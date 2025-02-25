
import RnsSDK from '../..';

import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';
import { normaliseManifest } from '../utils';

const mocks = {
    userDetails: {
        accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p',
        badgeId: '#1'
    },
    callbacks: {},
    intentHash: 'txid_tdx_2_1p9j7njn5wuagry6j8mrmkvhhwvttskq2cy4e5nk2wpexhqjav2dszpptsr'
};

const inputs = {
    domain: {
        name: "radixnameservice.xrd"
    }
};

const anticipated = {
    domain: {
        rootId: "[52e57ee0bdd7681786e15a0dabb7bdc4]",
        name: "radixnameservice.xrd",
        subdomainIds: ["[0601f34183fb940a690f3c87f29b6c25]"]
    }
}

jest.mock('@radixdlt/radix-dapp-toolkit', () => {
    return {
        RadixDappToolkit: jest.fn(() => ({
            walletApi: {
                sendTransaction: jest.fn(() => {
                    return {
                        value: {
                            transactionIntentHash: mocks.intentHash,
                        },
                        isErr: jest.fn(() => false),
                    };
                }),
            },
        })),
    };
});

describe('RNS - Activate Domain', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`should return a correctly formatted manifest string`, async () => {

        const dAppToolkit = RadixDappToolkit({
            dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
            networkId: RadixNetwork.Stokenet
        });

        const rns = new RnsSDK({ network: 'stokenet', rdt: dAppToolkit });

        const activate = await rns.activateDomain({
            domain: "radixnameservice.xrd",
            userDetails: mocks.userDetails
        });

        if ('errors' in activate) {
            throw new Error('Mock activation failed');
        }

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const expectedString = `
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${anticipated.domain.rootId}")
                );
            POP_FROM_AUTH_ZONE
                Proof("domain_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "update_address"
                Proof("domain_proof")
                Address("${mocks.userDetails.accountAddress}");
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${anticipated.domain.rootId}")
                );
            POP_FROM_AUTH_ZONE
                Proof("requested_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "delete_all_records_and_subdomains"
                NonFungibleLocalId("${anticipated.domain.rootId}")
                true
                true
                Array<NonFungibleLocalId>(
                    ${anticipated.domain.subdomainIds.map(id => `NonFungibleLocalId("${id}")`).join(', ')}
                )
                Proof("requested_proof")
                Enum<0u8>();
            DROP_ALL_PROOFS;        
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

});

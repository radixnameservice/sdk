import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';
import RnsSDK, { DomainDataI } from '../..';
import { normaliseManifest } from '../utils';

const mocks = {
    domain: {
        name: "radixnameservice.xrd"
    },
    fromAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p',
    destinationAddress: 'account_tdx_2_12y9gtvtcfah0kvnluefk7tpaknhx90mr9mn5gjprqzfnc0dyjdkw3d',
    preferences: {
        deleteRecords: true,
        deleteSubdomains: false
    },
    callbacks: {},
    intentHash: 'txid_tdx_2_1p9j7njn5wuagry6j8mrmkvhhwvttskq2cy4e5nk2wpexhqjav2dszpptsr'
};


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


describe('RNS - Transfer Domain', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    const dAppToolkit = RadixDappToolkit({
        dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
        networkId: RadixNetwork.Stokenet
    });

    const rns = new RnsSDK({ network: 'stokenet', rdt: dAppToolkit });

    it(`domain transfer creation should return a correctly formatted manifest string`, async () => {

         const rootDomainDetails = await rns.getDomainDetails({ domain: mocks.domain.name });

         if (rootDomainDetails.errors) {
            throw new Error('Domain details could not be obtained');
        }

        const rootDomainData = rootDomainDetails.data as DomainDataI;

        const subdomainsResponse = await rns.getSubdomains({ domain: mocks.domain.name });
        const actualSubdomainIds = subdomainsResponse.errors ? [] : subdomainsResponse.data.subdomains.map(sub => sub.id);

        const transferDomain = await rns.transferDomain({
            domain: mocks.domain.name,
            fromAddress: mocks.fromAddress,
            destinationAddress: mocks.destinationAddress,
            preferences: mocks.preferences
        });

        if (transferDomain.errors) {
            throw new Error('Mock record creation failed');
        }

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const expectedString = `
            CALL_METHOD
                Address("${mocks.fromAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${rootDomainDetails.data.id}")
                );
            POP_FROM_AUTH_ZONE
                Proof("requested_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "delete_all_records_and_subdomains"
                NonFungibleLocalId("${rootDomainData.id}")
                ${mocks.preferences.deleteSubdomains}
                ${mocks.preferences.deleteRecords}
                Array<NonFungibleLocalId>(
                    ${actualSubdomainIds.map(id => `NonFungibleLocalId("${id}")`).join(', ')}
                )
                Proof("requested_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${mocks.fromAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${rootDomainData.id}")
                );
            POP_FROM_AUTH_ZONE
                Proof("domain_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "update_address"
                Proof("domain_proof")
                Address("${mocks.destinationAddress}");
            CALL_METHOD
                Address("${mocks.fromAddress}")
                "withdraw_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${rootDomainData.id}")
                );
            CALL_METHOD
                Address("${mocks.destinationAddress}")
                "try_deposit_batch_or_refund"
                Expression("ENTIRE_WORKTOP")
                Enum<0u8>();
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

});

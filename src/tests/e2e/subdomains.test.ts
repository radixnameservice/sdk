
import RnsSDK, { DomainDataI } from '../..';

import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';

import { normaliseManifest } from '../utils';
import { deriveRootDomain, normaliseDomain } from '../../utils/domain.utils';

const mocks = {
    rootDomain: {
        id: "[52e57ee0bdd7681786e15a0dabb7bdc4]"
    },
    subdomain: `test-subdomain.radixnameservice.xrd`,
    userDetails: {
        accountAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k'
    },
    callbacks: {},
    intentHash: 'txid_tdx_2_1p9j7njn5wuagry6j8mrmkvhhwvttskq2cy4e5nk2wpexhqjav2dszpptsr'
};

const dAppToolkit = RadixDappToolkit({
    dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
    networkId: RadixNetwork.Stokenet
});

const rns = new RnsSDK({ network: 'stokenet', rdt: dAppToolkit });

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

describe('RNS - Create Subdomain', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`should return a correctly formatted manifest string`, async () => {

        const createSubdomain = await rns.createSubdomain({
            subdomain: mocks.subdomain,
            accountAddress: mocks.userDetails.accountAddress
        });

        if (createSubdomain.errors) {
            throw new Error('Mock subdomain creation failed');
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
                    NonFungibleLocalId("${mocks.rootDomain.id}")
                );
            POP_FROM_AUTH_ZONE
                Proof("requester_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "register_subdomain"
                NonFungibleLocalId("${mocks.rootDomain.id}")
                "${mocks.subdomain}"
                Address("${mocks.userDetails.accountAddress}")
                Proof("requester_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

});

describe('RNS - Delete Subdomain', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`should return a correctly formatted manifest string`, async () => {

        const normalisedSubDomain = normaliseDomain(mocks.subdomain)

        const rootDomainDetails = await rns.getDomainDetails({ domain: deriveRootDomain(mocks.subdomain) });

        if (rootDomainDetails.errors) {
            throw new Error('Root domain details could not be obtained');
        }
        
        const subdomainsResponse = await rns.getSubdomains({ domain: deriveRootDomain(mocks.subdomain) });
        
        if (subdomainsResponse.errors) {
            throw new Error('Subdomains could not be obtained');
        }
        
        const subdomainDetails = subdomainsResponse.data.subdomains.find((subdomain) => subdomain.name === normalisedSubDomain);

        if (!subdomainDetails) {
            throw new Error('Subdomain details could not be obtained');
        }

        const deleteSubdomain = await rns.deleteSubdomain({
            subdomain: mocks.subdomain,
            accountAddress: mocks.userDetails.accountAddress
        });

        if (deleteSubdomain.errors) {
            throw new Error('Mock subdomain deletion failed');
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
                    NonFungibleLocalId("${rootDomainDetails.data.id}")
                );
            POP_FROM_AUTH_ZONE
                Proof("requester_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "delete_subdomain"
                NonFungibleLocalId("${subdomainDetails.id}")
                Proof("requester_proof")
                Enum<0u8>();
            DROP_ALL_PROOFS;
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

});

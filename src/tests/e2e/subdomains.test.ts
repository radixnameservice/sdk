
import RnsSDK from '../..';

import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';

import { normaliseManifest } from '../utils';
import { deriveRootDomain, normaliseDomain } from '../../utils/domain.utils';

const mocks = {
    subdomain: `test-subdomain.radixnameservice.xrd`,
    userDetails: {
        accountAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
        badgeId: '#1'
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

        const details = await rns.getDomainDetails({ domain: deriveRootDomain(mocks.subdomain) });

        if ('errors' in details) {
            throw new Error('Subdomain details could not be obtained');
        }

        const createSubdomain = await rns.createSubdomain({
            subdomain: mocks.subdomain,
            userDetails: mocks.userDetails
        });

        if ('errors' in createSubdomain) {
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
                    NonFungibleLocalId("${details.id}")
                );
            POP_FROM_AUTH_ZONE
                Proof("requester_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "register_subdomain"
                NonFungibleLocalId("${details.id}")
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

        if ('errors' in rootDomainDetails) {
            throw new Error('Root domain details could not be obtained');
        }

        const subdomainDetails = rootDomainDetails.subdomains.find((subdomain) => subdomain.name === normalisedSubDomain);

        if (!subdomainDetails) {
            throw new Error('Subdomain details could not be obtained');
        }

        const deleteSubdomain = await rns.deleteSubdomain({
            subdomain: mocks.subdomain,
            userDetails: mocks.userDetails
        });

        if ('errors' in deleteSubdomain) {
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
                    NonFungibleLocalId("${rootDomainDetails.id}")
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

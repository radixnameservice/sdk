import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';
import RnsSDK, { ResolvedRecordResponseT } from '../..';
import { matchObjectTypes, normaliseManifest } from '../utils';
import { RecordDocketI, RecordItemI } from '../../common/record.types';
import { buildFungibleProofs, buildNonFungibleProofs } from '../../utils/proof.utils';

const mocks = {
    domain: {
        name: "radixnameservice.xrd"
    },
    userDetails: {
        accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
    },
    proofs: {
        nonFungibles: [
            {
                resourceAddress: "resource_tdx_2_1n2leg5zgd0cw3766mdae43jg8dvp2h4x08rjjcrf3qrta8lhfjt7wq",
                ids: ["[6440eca229adc52b1ee093a7eee0e71f]", "[d98c5be165f16668b89bfeb709225ac7]", "[51389d6aa8fba3e16a421179e13250f9]"]
            },
            {
                resourceAddress: "def",
                ids: ["def"]
            },
        ],
        fungibles: [
            {
                resourceAddress: "ghi",
                amount: "1"
            },
            {
                resourceAddress: "klm",
                amount: "1"
            },
        ]
    },
    docket: {
        context: "receivers",
        directive: "*",
        platformIdentifier: "SDK Tests",
        value: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
    },
    callbacks: {},
    intentHash: 'txid_tdx_2_1p9j7njn5wuagry6j8mrmkvhhwvttskq2cy4e5nk2wpexhqjav2dszpptsr'
};

const anticipated = {
    domain: {
        rootId: "[52e57ee0bdd7681786e15a0dabb7bdc4]",
        name: "radixnameservice.xrd"
    },
    record: {
        id: "[23ba95b0813ed097cc5cbc45861406f3]"
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

describe('RNS - Fetch Domain Records', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return a corresponding record array of docket objects`, async () => {

        const records = await rns.getRecords({ domain: 'test-records-present.xrd' });

        if (records.errors) {
            throw new Error('Record list fetch failed');
        }

        expect(Array.isArray(records.data)).toBe(true);
        expect(records.data.length).toBeGreaterThan(0);

        if (!matchObjectTypes<RecordItemI>(records.data[0], ['record_id', 'domain_id', 'context', 'directive', 'platform_identifier', 'value'])) {
            throw new Error('Record did not match expected schema');
        }

    });

    it('should return a empty array', async () => {

        const records = await rns.getRecords({ domain: 'test-records-blank.xrd' });

        if (records.errors) {
            throw new Error('Record list fetch failed');
        }

        expect(Array.isArray(records.data)).toBe(true);
        expect(records.data.length).toBeLessThan(1);

    });

    it('should return a specific stokenet address', async () => {

        const resolvedRecord = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            docket: {
                context: 'receivers',
                directive: '*'
            }
        });

        if (resolvedRecord.errors) {
            throw new Error('Record resolution failed');
        }

        expect(resolvedRecord.data.value).toBe('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

    });


    it('should return proven resource nfts', async () => {

        const record = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            docket: {
                context: 'social',
                directive: 'selfi:pfps'
            },
            proven: true
        });

        if (record.errors) {
            throw new Error('Record resolution failed');
        }

        expect(Array.isArray(record.data.nonFungibleDataList)).toBe(true);

        if (!matchObjectTypes<ResolvedRecordResponseT>(record.data, ['value', 'nonFungibleDataList'])) {
            throw new Error('Record value did not match expected schema');
        }

    });

});

describe('RNS - Manage Domain Records', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    const dAppToolkit = RadixDappToolkit({
        dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
        networkId: RadixNetwork.Stokenet
    });

    const rns = new RnsSDK({ network: 'stokenet', rdt: dAppToolkit });

    it(`record creation should return a correctly formatted manifest string`, async () => {

        const createRecord = await rns.createRecord({
            domain: mocks.domain.name,
            accountAddress: mocks.userDetails.accountAddress,
            docket: mocks.docket as RecordDocketI
        });

        if (createRecord.errors) {
            throw new Error('Mock record creation failed');
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
                Proof("request_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "create_record"
                NonFungibleLocalId("${anticipated.domain.rootId}")
                "${mocks.docket.context}"
                Enum<1u8>("${mocks.docket.directive}")
                Enum<1u8>("${mocks.docket.platformIdentifier}")
                Array<String>()
                "${mocks.docket.value}"
                Proof("request_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });


    it(`record creation with resource proofs should return a correctly formatted manifest string`, async () => {

        const createRecord = await rns.createRecord({
            domain: mocks.domain.name,
            accountAddress: mocks.userDetails.accountAddress,
            docket: { ...mocks.docket, proven: true } as RecordDocketI,
            proofs: mocks.proofs
        });

        if (createRecord.errors) {
            throw new Error('Mock proven record creation failed');
        }

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const nonFungibleProofs = buildNonFungibleProofs(mocks.proofs.nonFungibles, mocks.userDetails.accountAddress)
        const fungibleProofs = buildFungibleProofs(mocks.proofs.fungibles, mocks.userDetails.accountAddress);

        const expectedString = `
            ${nonFungibleProofs.map(proof => proof.manifest).join('')}
            ${fungibleProofs.map(proof => proof.manifest).join('')}
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${anticipated.domain.rootId}")
                );
            POP_FROM_AUTH_ZONE
                Proof("request_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "create_proven_record"
                NonFungibleLocalId("${anticipated.domain.rootId}")
                "${mocks.docket.context}"
                Enum<1u8>("${mocks.docket.directive}")
                Enum<1u8>("${mocks.docket.platformIdentifier}")
                Array<String>()
                Array<Proof>(
                    ${nonFungibleProofs.map(proof => proof.proofIds).join(',')}
                    ${fungibleProofs.map(proof => proof.proofIds).join(',')}
                )
                Proof("request_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });


    it(`record amendment should return a correctly formatted manifest string`, async () => {

        const amendRecord = await rns.amendRecord({
            domain: mocks.domain.name,
            accountAddress: mocks.userDetails.accountAddress,
            docket: mocks.docket as RecordDocketI
        });

        if (amendRecord.errors) {
            throw new Error('Mock record amendment failed');
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
                Proof("requester_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "update_record"
                NonFungibleLocalId("${anticipated.record.id}")
                "${mocks.docket.value}"
                Proof("requester_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

    it(`record amendment with resource proofs should return a correctly formatted manifest string`, async () => {

        const deleteRecord = await rns.amendRecord({
            domain: mocks.domain.name,
            accountAddress: mocks.userDetails.accountAddress,
            docket: { ...mocks.docket, proven: true } as RecordDocketI,
            proofs: mocks.proofs
        });

        if (deleteRecord.errors) {
            throw new Error('Mock record amendment failed');
        }

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const nonFungibleProofs = buildNonFungibleProofs(mocks.proofs.nonFungibles, mocks.userDetails.accountAddress)
        const fungibleProofs = buildFungibleProofs(mocks.proofs.fungibles, mocks.userDetails.accountAddress);

        const expectedString = `
            ${nonFungibleProofs.map(proof => proof.manifest).join('')}
            ${fungibleProofs.map(proof => proof.manifest).join('')}
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                NonFungibleLocalId("${anticipated.domain.rootId}")
                );
            POP_FROM_AUTH_ZONE
                Proof("requester_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "update_proven_record"
                NonFungibleLocalId("${anticipated.record.id}")
                Array<Proof>(
                    ${nonFungibleProofs.map(proof => proof.proofIds).join(',')}
                    ${fungibleProofs.map(proof => proof.proofIds).join(',')}
                )
                Proof("requester_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

    it(`record deletion should return a correctly formatted manifest string`, async () => {

        const deleteRecord = await rns.deleteRecord({
            domain: mocks.domain.name,
            accountAddress: mocks.userDetails.accountAddress,
            docket: mocks.docket as RecordDocketI
        });

        if (deleteRecord.errors) {
            throw new Error('Mock record deletion failed');
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
                Proof("requester_proof");
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "delete_record"
                NonFungibleLocalId("${anticipated.record.id}")
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

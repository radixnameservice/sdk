import RnsSDK, { RecordItem, ResolvedRecordResponse } from '../..';
import { matchObjectTypes } from '../utils';

const mocks = {
    userDetails: {
        accountAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
        badgeId: '#1'
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

describe('RNS - Fetch Domain Records', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return a corresponding record array of docket objects`, async () => {

        const records = await rns.getRecords('test-records-present.xrd');

        if ('errors' in records) {
            throw new Error('Record list fetch failed');
        }

        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);

        if (!matchObjectTypes<RecordItem>(records[0], ['record_id', 'id_additions', 'domain_id', 'context', 'directive', 'platform_identifier', 'value'])) {
            throw new Error('Record did not match expected schema');
        }

    });

    it('should return a empty array', async () => {

        const records = await rns.getRecords('test-records-blank.xrd');

        if ('errors' in records) {
            throw new Error('Record list fetch failed');
        }

        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeLessThan(1);

    });

    it('should return a specific stokenet address', async () => {

        const resolvedRecord = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            context: 'receivers',
            directive: '*'
        });

        if ('errors' in resolvedRecord) {
            throw new Error('Record resolution failed');
        }

        expect(resolvedRecord.value).toBe('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

    });


    it('should return proven resource nfts', async () => {

        const record = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            context: 'social',
            directive: 'selfi:pfps',
            proven: true
        });

        if ('errors' in record) {
            throw new Error('Record resolution failed');
        }

        expect(Array.isArray(record.nonFungibleDataList)).toBe(true);

        if (!matchObjectTypes<ResolvedRecordResponse>(record, ['value', 'nonFungibleDataList'])) {
            throw new Error('Record value did not match expected schema');
        }

    });

});

// describe('RNS - Create a Domain Record', () => {

    
// });
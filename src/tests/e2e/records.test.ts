import RnsSDK from '../..';
import { matchObjectTypes } from '../utils';

const recordsSchema = {
    record_id: 'string',
    id_additions: 'object',
    domain_id: 'string',
    context: 'string',
    directive: 'string',
    platform_identifier: 'string',
    value: 'string'
};

const resolvedRecordSchema = {
    value: 'string',
    nonFungibleDataList: 'object'
};

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

        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);
        expect(records.every(record => matchObjectTypes(record, recordsSchema))).toBe(true);

    });

    it('should return a empty array', async () => {

        const records = await rns.getRecords('test-records-blank.xrd');

        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeLessThan(1);

    });

    it('should return a specific stokenet address', async () => {

        const resolvedRecord = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            context: 'receivers',
            directive: '*'
        });

        expect(resolvedRecord.value).toBe('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

    });


    it('should return proven resource nfts', async () => {

        const record = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            context: 'social',
            directive: 'selfi:pfps',
            proven: true
        });

        expect(Array.isArray(record.nonFungibleDataList)).toBe(true);
        expect(matchObjectTypes(record, resolvedRecordSchema)).toBe(true);
    });

});

// describe('RNS - Create a Domain Record', () => {

    
// });
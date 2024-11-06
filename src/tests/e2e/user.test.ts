
import RnsSDK from '../..';

import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';

const mocks = {
    userDetails: {
        accountAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
        badgeId: '#1'
    },
    durationYears: 2,
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

describe('RNS - Issue User Badge', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`should return a correctly formatted manifest string`, async () => {

        const rns = new RnsSDK({ network: 'stokenet' });

        const dAppToolkit = RadixDappToolkit({
            dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
            networkId: RadixNetwork.Stokenet
        });

        const register = await rns.issueUserBadge({
            rdt: dAppToolkit,
            userDetails: mocks.userDetails
        });

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const formatString = (str: string) => str.replace(/\s+/g, ' ').trim();

        const expectedString = `
            CALL_METHOD
                Address("${rns.entities.radixNameServiceComponent}")
                "register_user";
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
            Expression("ENTIRE_WORKTOP");
        `;

        expect(formatString(transactionManifest)).toBe(formatString(expectedString));
        expect(register.status).toEqual("issuance-successful");

    });

});

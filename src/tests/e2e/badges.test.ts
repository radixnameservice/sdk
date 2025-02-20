import RnsSDK, { CommitmentStackResponseI } from '../..';

import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';
import { normaliseManifest } from '../utils';

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

        const dAppToolkit = RadixDappToolkit({
            dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
            networkId: RadixNetwork.Stokenet
        });

        const rns = new RnsSDK({ network: 'stokenet', rdt: dAppToolkit });

        const register = await rns.issueUserBadge({
            userDetails: mocks.userDetails
        }) as CommitmentStackResponseI;

        if ('errors' in register) {
            throw new Error('Mock badge issuance failed');
        }

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const expectedString = `
            CALL_METHOD
                Address("${rns.entities.components.coreVersionManager.rnsCoreComponent}")
                "register_user";
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
            Expression("ENTIRE_WORKTOP");
        `;

        expect(normaliseManifest(transactionManifest)).toBe(normaliseManifest(expectedString));

    });

});

describe('RNS - Fetch User Badge', () => {

    it(`should return a the corresponding account user badge ID`, async () => {

        const rns = new RnsSDK({ network: 'stokenet' });

        const userBadge = await rns.getUserBadge({ accountAddress: 'account_tdx_2_129v4x3e4u5rgyz6239k92suwx70rarx33hwfl3prm54hv2ca9lp2kl' });

        if ('errors' in userBadge) {
            throw new Error('User badge ID could not be resolved');
        }

        expect(userBadge.id).toBe("#1#");

    });

});
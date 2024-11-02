
import RnsSDK from '../..';

import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';
import { RadixNetwork } from '@radixdlt/babylon-gateway-api-sdk';

import { getWellKnownAddresses } from '../../utils/gateway.utils';
import { getBasePrice } from '../../utils/pricing.utils';
import { convertToDecimal, multiplyDecimal } from '../../utils/decimal.utils';

const mocks = {
    availableDomain: `test-registration-${(Math.random() + 1).toString(36).substring(3)}.xrd`,
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

describe('RNS - Register Domain', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`should return a correctly formatted manifest string`, async () => {

        const rns = new RnsSDK({ network: 'stokenet' });

        const dAppToolkit = RadixDappToolkit({
            dAppDefinitionAddress: 'account_tdx_2_129076yrjr5k4lumhp3fl2r88xt3eqgxwed6saplvf2ezz5szrhet8k',
            networkId: RadixNetwork.Stokenet
        });

        const register = await rns.registerDomain({
            domain: mocks.availableDomain,
            durationYears: mocks.durationYears,
            rdt: dAppToolkit,
            userDetails: mocks.userDetails
        });

        const sendTransactionMock = dAppToolkit.walletApi.sendTransaction as jest.Mock;
        expect(sendTransactionMock).toHaveBeenCalled();

        const sendTransactionArgs = sendTransactionMock.mock.calls[0][0];
        const transactionManifest = sendTransactionArgs.transactionManifest;

        const price = multiplyDecimal(convertToDecimal(getBasePrice(mocks.availableDomain, rns.dependencies.rates.usdXrd).xrd), mocks.durationYears);

        const xrdTokenResource = (await getWellKnownAddresses(rns.status)).xrd;

        const formatString = (str: string) => str.replace(/\s+/g, ' ').trim();

        const expectedString = `
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "withdraw"
                Address("${xrdTokenResource}")
                Decimal("${price}");
            TAKE_FROM_WORKTOP
                Address("${xrdTokenResource}")
                Decimal("${price}")
                Bucket("radix_bucket");
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "create_proof_of_non_fungibles"
                Address("${rns.entities.rnsUserBadgeResource}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${mocks.userDetails.badgeId}")
                );
            POP_FROM_AUTH_ZONE
                Proof("user_proof");
            CALL_METHOD
                Address("${rns.entities.radixNameServiceComponent}")
                "register_domain"
                "${mocks.availableDomain}"
                Address("${mocks.userDetails.accountAddress}")
                ${mocks.durationYears}i64
                Bucket("radix_bucket")
                Proof("user_proof");
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
        `;

        expect(formatString(transactionManifest)).toBe(formatString(expectedString));
        expect(register.status).toEqual("registration-successful");

    });

});


import RnsSDK from '../..';

import registerDomainManifest from '../../manifests/register-domain';

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
    callbacks: {}
};


describe('registerDomainManifest', () => {

    it(`should return a correctly formatted manifest string`, async () => {

        const rns = new RnsSDK({ network: 'stokenet' });
        await rns.fetchDependencies(); // wait on dependencies required

        const price = convertToDecimal(getBasePrice(mocks.availableDomain, rns.dependencies.rates.usdXrd).xrd);

        const result = await registerDomainManifest({
            sdkInstance: rns,
            domain: mocks.availableDomain,
            userDetails: mocks.userDetails,
            price: multiplyDecimal(price, mocks.durationYears),
            durationYears: mocks.durationYears
        });

        const xrdTokenResource = (await getWellKnownAddresses(rns.status)).xrd;

        const formatString = (str: string) => str.replace(/\s+/g, ' ').trim();

        const expectedString = `
            CALL_METHOD
                Address("${mocks.userDetails.accountAddress}")
                "withdraw"
                Address("${xrdTokenResource}")
                Decimal("${multiplyDecimal(price, mocks.durationYears)}");
            TAKE_FROM_WORKTOP
                Address("${xrdTokenResource}")
                Decimal("${multiplyDecimal(price, mocks.durationYears)}")
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

        expect(formatString(result)).toBe(formatString(expectedString));

    });

});

import RnsKit from '../..';

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a decimal price for the specified domain`, async () => {

        //const price = await rns.getDomainPrice('test-records-present.xrd');
        //console.log(price)

        const status = await rns.getDomainAttributes('test-records-present.xrd');
        console.log(status)

    });

   
});

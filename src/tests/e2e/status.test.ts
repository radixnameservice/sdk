import RnsKit from '../..';

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a 'taken' status.`, async () => {

        const status = await rns.getDomainStatus('james2.xrd');
        expect(status).toBe('taken');

    });

});
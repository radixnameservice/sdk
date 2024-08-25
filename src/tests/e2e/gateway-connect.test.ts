import RnsKit from '../..';
import { Network, NetworkT, getBasePath } from '../../utils/gateway.utils';


describe('RnsKit', () => {

    const networks: Array<NetworkT | undefined> = [undefined, 'mainnet', 'stokenet'];

    networks.forEach(network => {

        const rns = new RnsKit({ network });

        it(`should return a corresponding base path for ${network} (if undefined set default to mainnet)`, () => {

            if (Network[network]) {

                const basePath = getBasePath(network);
                expect(basePath).toEqual(Network[network]);

            } else {

                const defaultBasePath = getBasePath();
                expect(defaultBasePath).toEqual('https://mainnet.radixdlt.com');

            }

        });

        it('gateway check should return ledger state and info properties', async () => {

            const result = await rns.initGateway({});
            expect(result).toHaveProperty(["ledger_state"]);
            expect(result).toHaveProperty(["release_info"]);

        });

    });

});
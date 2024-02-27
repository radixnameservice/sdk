// import RnsKit from '../..';
// import { matchObjectTypes } from '../utils';

// const attributesSchema = {
//     status: 'string',
//     verbose: 'string'
// };


// describe('RnsKit', () => {

//     const rns = new RnsKit({ network: 'stokenet' });

//     it(`should return a 'registered' or 'settltment' status.`, async () => {

//         const attributes = await rns.getDomainAttributes('radixnameservice.xrd');

//         expect(matchObjectTypes(attributes, attributesSchema)).toBe(true);
//         expect(attributes.status).not.toBe('available');

//     });

// });
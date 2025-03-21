import { bech32m } from "bech32";
import errors from "../mappings/errors";
import { ErrorI } from "../common/response.types";
import { NetworkT } from "../common/gateway.types";

export function validateAccountAddress(accountAddress: string, options?: { network?: NetworkT }): true | ErrorI {

    if (!accountAddress.includes('account_'))
        return errors.account.invalidAddress({ accountAddress });

    try {
        validateRadixAddress({ address: accountAddress, network: options?.network });
    } catch (e) {
        return errors.account.invalidAddress({ accountAddress, verbose: e.message });
    }

    return true;

}

function determineAddressNetwork(hrp: string): NetworkT {

    let network: NetworkT;

    const mainnetRegex = /^([a-z]+)_rdx$/;
    const stokenetRegex = /^([a-z]+)_tdx_2_$/;

    let match = hrp.match(mainnetRegex);

    if (match) {
        network = 'mainnet';
    } else {

        match = hrp.match(stokenetRegex);

        if (match) {
            network = 'stokenet';
        } else {
            throw new Error("Invalid HRP format. Must match mainnet (e.g., account_rdx1) or stokenet (e.g., account_tdx_2_) pattern.");
        }

    }

    return network;

}

function determineAddressType(hrp: string): string {

    let entityType: string;

    const mainnetRegex = /^([a-z]+)_rdx$/;
    const stokenetRegex = /^([a-z]+)_tdx_2_$/;

    let match = hrp.match(mainnetRegex);

    if (match) {

        entityType = match[1];

    } else {

        match = hrp.match(stokenetRegex);

        if (match) {
            entityType = match[1];
        } else {
            throw new Error("Invalid HRP format. Must match mainnet (e.g., account_rdx1) or stokenet (e.g., account_tdx_2_) pattern.");
        }

    }

    return entityType;

}


function validateRadixAddress({ address, network }: { address: string; network?: NetworkT }): true {

    let decoded;
    try {
        decoded = bech32m.decode(address);
    } catch (err) {
        throw new Error("Invalid Bech32m encoding or checksum");
    }
    const { prefix: hrp, words } = decoded;

    if (!network) {
        network = determineAddressNetwork(hrp);
    }

    const entityTypePrefix = determineAddressType(hrp);

    // Check that the extracted entity prefix is in the allowed list.
    const allowedHrpPrefixes = new Set([
        "account", "resource", "component", "package", "identity", "validator",
        "consensusmanager", "accesscontroller", "pool", "locker", "transactiontracker",
        "internal_vault", "internal_component", "internal_keyvaluestore",
        "txid", "signedintent", "subtxid", "notarizedtransaction",
        "roundupdatetransaction", "systemtransaction", "ledgertransaction"
    ]);

    if (!allowedHrpPrefixes.has(entityTypePrefix)) {
        throw new Error(`Invalid HRP prefix "${entityTypePrefix}" for Radix address`);
    }

    const data = bech32m.fromWords(words); // Convert the 5-bit words back into bytes.
    if (data.length < 1) {
        throw new Error("Bech32 payload is empty or too short");
    }

    const entityType = data[0]; // The first byte represents the entity type

    const txPrefixes = new Set([
        "txid", "signedintent", "subtxid",
        "notarizedtransaction", "roundupdatetransaction",
        "systemtransaction", "ledgertransaction"
    ]);

    if (txPrefixes.has(entityTypePrefix)) {
        if (data.length !== 32) {
            throw new Error("Invalid length for transaction hash (expected 32 bytes)");
        }
        return true;
    }

    const allowedEntityTypes = new Set<number>([
        13,   // GlobalPackage
        134,  // GlobalConsensusManager
        131,  // GlobalValidator
        130,  // GlobalTransactionTracker
        192,  // GlobalGenericComponent
        193,  // GlobalAccount
        194,  // GlobalIdentity
        195,  // GlobalAccessController
        196, 197, 198, // GlobalOneResourcePool, TwoResourcePool, MultiResourcePool
        104,  // GlobalAccountLocker
        209, 210, // GlobalPreallocated Secp256k1 Account / Identity
        81, 82,   // GlobalPreallocated Ed25519 Account / Identity
        93,   // GlobalFungibleResourceManager
        154,  // GlobalNonFungibleResourceManager
        88,   // InternalFungibleVault
        152,  // InternalNonFungibleVault
        248,  // InternalGenericComponent
        176   // InternalKeyValueStore
    ]);

    if (!allowedEntityTypes.has(entityType)) {
        throw new Error(`Unrecognized entity type byte 0x${entityType.toString(16)} in address`);
    }

    // Cross-check that the HRP prefix (entityPrefix) matches the entity type.
    let expectedPrefix: string | null = null;
    switch (entityType) {
        case 13: expectedPrefix = "package"; break;
        case 93:
        case 154: expectedPrefix = "resource"; break;
        case 192: expectedPrefix = "component"; break;
        case 193:
        case 209:
        case 81: expectedPrefix = "account"; break;
        case 194:
        case 210:
        case 82: expectedPrefix = "identity"; break;
        case 131: expectedPrefix = "validator"; break;
        case 134: expectedPrefix = "consensusmanager"; break;
        case 195: expectedPrefix = "accesscontroller"; break;
        case 196:
        case 197:
        case 198: expectedPrefix = "pool"; break;
        case 104: expectedPrefix = "locker"; break;
        case 130: expectedPrefix = "transactiontracker"; break;
        case 88:
        case 152: expectedPrefix = "internal_vault"; break;
        case 248: expectedPrefix = "internal_component"; break;
        case 176: expectedPrefix = "internal_keyvaluestore"; break;
    }
    if (expectedPrefix && expectedPrefix !== entityTypePrefix) {
        throw new Error(`HRP prefix "${entityTypePrefix}" does not match entity type ${entityType}`);
    }

    return true;
}
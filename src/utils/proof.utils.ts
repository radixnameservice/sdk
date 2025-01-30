import { FungibleProofItemI, NonFungibleProofItemI } from "../common/entities.types";

export function buildNonFungibleProofs(
    nonFungibles: NonFungibleProofItemI[],
    account: string
): {
    manifest: string;
    proofIds: string
}[] {

    return nonFungibles.map((nonFungible, index) => {
        const manifest = `
            CALL_METHOD
                Address("${account}")
                "create_proof_of_non_fungibles"
                Address("${nonFungible.resourceAddress}")
                Array<NonFungibleLocalId>(
                    ${nonFungible.ids.map(id => `NonFungibleLocalId("${id}")`).join(',')}
                );
            POP_FROM_AUTH_ZONE
                Proof("non_fungible_proof_${index}");
        `;
        return { manifest, proofIds: `Proof("non_fungible_proof_${index}")` };
    });

}

export function buildFungibleProofs(
    fungibles: FungibleProofItemI[],
    account: string
): {
    manifest: string;
    proofIds: string
}[] {

    return fungibles.map((fungible, index) => {
        const manifest = `
            CALL_METHOD
                Address("${account}")
                "create_proof_of_amount"
                Address("${fungible.resourceAddress}")
                Decimal("${fungible.amount}");
            POP_FROM_AUTH_ZONE
                Proof("fungible_proof_${index}");
        `;
        return { manifest, proofIds: `Proof("fungible_proof_${index}")` };
    });

}
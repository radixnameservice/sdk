import RnsSDK from "..";
import { DocketI } from "../common/record.types";

import { UserSpecificsI } from "../common/user.types";


export default function recordCreationManifest({
    sdkInstance,
    userDetails,
    domainId,
    rootDomainId,
    recordDocket
}: {
    sdkInstance: RnsSDK;
    userDetails: UserSpecificsI;
    domainId: string;
    rootDomainId: string;
    recordDocket: DocketI;
}) {

    return `
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.domainNameResource}")
        Array<NonFungibleLocalId>(
            NonFungibleLocalId("${rootDomainId}");
        POP_FROM_AUTH_ZONE
            Proof("request_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.radixNameServiceComponent}")
            "create_record"
            NonFungibleLocalId("${domainId}")
            "${recordDocket.context}"
            ${recordDocket.directive}
            ${recordDocket.platformIdentifier}
            Array<String>()
            ${recordDocket.value}
            Proof("request_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
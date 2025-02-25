import { DocketPropsI } from "../common/record.types";
import { domainToNonFungId } from "./domain.utils";


export async function docketToRecordId(domain: string, docket: DocketPropsI) {

    const domainId = await domainToNonFungId(domain);
    const parsedContext = docket.context ? `-${docket.context}` : '';
    const parsedDirective = docket.directive ? `-${docket.directive}` : '';
    const recordId = await domainToNonFungId(`${domainId}${parsedContext}${parsedDirective}`);

    return recordId;

}

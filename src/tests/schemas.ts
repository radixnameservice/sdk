export const detailsSchema = {
    id: 'string',
    name: 'string',
    address: 'string',
    created_timestamp: 'number',
    last_valid_timestamp: 'number',
    key_image_url: 'string'
};

export const domainsSchema = {
    id: 'string',
    name: 'string',
    subdomains: 'object',
    created_timestamp: 'number',
    last_valid_timestamp: 'number',
    key_image_url: 'string',
    address: 'string'
};

export const authenticitySchema = {
    isAuthentic: 'boolean'
};

export const attributesSchema = {
    status: 'string',
    verbose: 'string'
};

export const auctionSchema = {
    id: 'string',
    ends: 'number',
    domain: 'string',
    bids: 'object'
};

export const recordsSchema = {
    record_id: 'string',
    id_additions: 'object',
    domain_id: 'string',
    context: 'string',
    directive: 'string',
    platform_identifier: 'string',
    value: 'string'
};

export const resolvedRecordSchema = {
    value: 'string',
    nonFungibleDataList: 'object'
};
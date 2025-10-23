/**
 * @description /公司&联络资料--接口请求Body参数
 * @url POST /biz/company/open-account/hsbc/entity-contact
 */
export interface postOpenAccountHsbcEntityContactBody {
  existing_relationship_with_hsbc_country_or_region_code: string
  existing_relationship_with_hsbc_indicator: number
  id: number
  identity_document_identifier: string
  legal_name: string
  principal_business_address: string
  principal_business_address_country_or_region_code: string
  principal_business_address_line1_text: string
  principal_business_address_line2_text: string
  principal_business_address_line3_text: string
  registration_date: string
}

/**
 * @description /公司&联络资料--接口返回值
 * @url POST /biz/company/open-account/hsbc/entity-contact
 */
export interface postOpenAccountHsbcEntityContactRes {
  code: number
  msg: string
}

/**
 * @description /商业资料--接口请求Body参数
 * @url POST /biz/company/open-account/hsbc/commercial
 */
export interface postOpenAccountHsbcCommercialBody {
  approximate_annual_revenue_amount: number
  business_nature: string
  business_nature_description: string
  experience_business_year_count: number
  id: number
  major_customer_type: string
  operation_primary_country_or_region_code: string
}

/**
 * @description /商业资料--接口返回值
 * @url POST /biz/company/open-account/hsbc/commercial
 */
export interface postOpenAccountHsbcCommercialRes {}

/**
 * @description /人士列表--接口请求Query参数
 * @url GET /biz/company/open-account/hsbc/connected/list
 */
export interface getHsbcConnectedListQuery {
  /** 对应块资料id */
  id?: number
  /** 列表类型 1个人 2法人团体 */
  type?: number
}

/**
 * @description /人士列表--接口返回值
 * @url GET /biz/company/open-account/hsbc/connected/list
 */
export type getHsbcConnectedListRes = getHsbcConnectedListResItemItem[][]

/** getHsbcConnectedListResItem */
export interface getHsbcConnectedListResItemItem {
  connected_individual_id?: number
  first_name?: string
  status?: number
}

/**
 * @description /有关人士(个人)--接口请求Body参数
 * @url POST /biz/company/open-account/hsbc/connected-individual
 */
export interface postOpenAccountHsbcConnectedIndividualBody {
  authorised_signatory_indicator: number
  birth_date: string
  connected_id: number
  contact_person_indicator: number
  director_partner_sole_proprietor_indicator: number
  email_address_text: string
  first_name: string
  id: number
  identity_document_identifier: string
  identity_document_type: string
  job_title_text: string
  last_name: string
  mobile_phone_number: string
  operate_type: number
  residential_address_country_or_region_name: string
  residential_address_line1_text: string
  residential_address_line2_text: string
  residential_address_line3_text: string
  salutation: string
  ultimate_beneficial_owner_indicator: number
  ultimate_beneficial_ownership_percentage: number
}

/**
 * @description /有关人士(个人)--接口返回值
 * @url POST /biz/company/open-account/hsbc/connected-individual
 */
export interface postOpenAccountHsbcConnectedIndividualRes {}

/**
 * @description /有关人士(法人团体)--接口请求Body参数
 * @url POST /biz/company/open-account/hsbc/connected-entity
 */
export interface postOpenAccountHsbcConnectedEntityBody {
  connected_id: number
  id: number
  identity_document_identifier: string
  identity_document_type: string
  intermediate_owner_indicator: number
  intermediate_ownership_percentage: number
  legal_name: string
  operate_type: number
  registered_office_address_country_or_region_name: string
  registered_office_address_line1_text: string
  registered_office_address_line2_text: string
  registered_office_address_line3_text: string
  registered_stock_exchange_listing_indicator: number
  registration_country_or_region_code: string
  stock_exchange_code: string
}

/**
 * @description /有关人士(法人团体)--接口返回值
 * @url POST /biz/company/open-account/hsbc/connected-entity
 */
export interface postOpenAccountHsbcConnectedEntityRes {}

/**
 * @description /汇丰所需数据提交--接口请求Body参数
 * @url POST /biz/company/open-account/hsbc/submit
 */
export interface postOpenAccountHsbcSubmitBody {
  id: number
}

/**
 * @description /汇丰所需数据提交--接口返回值
 * @url POST /biz/company/open-account/hsbc/submit
 */
export interface postOpenAccountHsbcSubmitRes {
  code: number
  msg: string
}

/**
 * @description /汇丰资料详情列表--接口请求Query参数
 * @url GET /biz/company/open-account/hsbc/detail/list
 */
export interface getHsbcDetailListQuery {
  /** 对应块数据id */
  id?: number
}

/**
 * @description /汇丰资料详情列表--接口返回值
 * @url GET /biz/company/open-account/hsbc/detail/list
 */
export interface getHsbcDetailListRes {
  commercial: getHsbcDetailListResCommercial
  connected_entity: getHsbcDetailListResConnected_entityItem[]
  connected_individual: getHsbcDetailListResConnected_individualItem[]
  entity_contact: getHsbcDetailListResEntity_contact
}

/** getHsbcDetailListResCommercial */
export interface getHsbcDetailListResCommercial {
  approximate_annual_revenue_amount: number
  business_nature: string
  business_nature_description: string
  experience_business_year_count: number
  major_customer_type: string
  major_customer_type_cn: string
  operation_primary_country_or_region_code: string
  operation_primary_country_or_region_code_cn: string
}

/** getHsbcDetailListResConnected_entity */
export interface getHsbcDetailListResConnected_entityItem {
  director_partner_sole_proprietor_indicator?: string
  email_address_text?: string
  intermediate_owner_indicator?: number
  intermediate_ownership_percentage?: number
  legal_name?: string
  registered_office_address_country_or_region_name?: string
  registered_office_address_country_or_region_name_cn?: string
  registered_office_address_line1_text?: string
  registered_office_address_line2_text: string
  registered_office_address_line3_text: string
  registered_stock_exchange_listing_indicator?: number
  stock_exchange_code?: string
  stock_exchange_code_cn: string
}

/** getHsbcDetailListResConnected_individual */
export interface getHsbcDetailListResConnected_individualItem {
  authorised_signatory_indicator?: number
  birth_date?: string
  contact_person_indicator?: number
  director_partner_sole_proprietor_indicator?: number
  email_address_text?: string
  first_name?: string
  identity_document_identifier?: string
  identity_document_type?: string
  identity_document_type_cn: string
  job_title_text?: string
  last_name?: string
  mobile_phone_number?: string
  residential_address_country_or_region_name?: string
  residential_address_country_or_region_name_cn: string
  residential_address_line1_text?: string
  residential_address_line2_text: string
  residential_address_line3_text: string
  salutation?: string
  ultimate_beneficial_owner_indicator?: number
  ultimate_beneficial_ownership_percentage?: number
}

/** getHsbcDetailListResEntity_contact */
export interface getHsbcDetailListResEntity_contact {
  existing_relationship_with_hsbc_country_or_region_code: string
  existing_relationship_with_hsbc_country_or_region_code_cn: string
  existing_relationship_with_hsbc_indicator: number
  identity_document_identifier: string
  legal_name: string
  principal_business_address: string
  principal_business_address_cn: string
  principal_business_address_country_or_region_code: string
  principal_business_address_country_or_region_code_cn: string
  principal_business_address_line1_text: string
  principal_business_address_line2_text: string
  principal_business_address_line3_text: string
  registration_date: string
}

/**
 * @description /公司&联络资料详情--接口请求Query参数
 * @url GET /biz/company/open-account/hsbc/entity-contact
 */
export interface getOpenAccountHsbcEntityContactQuery {
  /** 对应块资料id */
  id?: number
}

/**
 * @description /公司&联络资料详情--接口请求Body参数
 * @url GET /biz/company/open-account/hsbc/entity-contact
 */
export interface getOpenAccountHsbcEntityContactBody {
  id: number
}

/**
 * @description /公司&联络资料详情--接口返回值
 * @url GET /biz/company/open-account/hsbc/entity-contact
 */
export interface getOpenAccountHsbcEntityContactRes {
  existing_relationship_with_hsbc_country_or_region_code: string
  existing_relationship_with_hsbc_indicator: number
  id: number
  identity_document_identifier: string
  legal_name: string
  principal_business_address: string
  principal_business_address_country_or_region_code: string
  principal_business_address_line1_text: string
  principal_business_address_line2_text: string
  principal_business_address_line3_text: string
  registration_date: string
}

/**
 * @description /商业资料详情--接口请求Query参数
 * @url GET /biz/company/open-account/hsbc/commercial
 */
export interface getOpenAccountHsbcCommercialQuery {
  /** 对应块资料id */
  id?: number
}

/**
 * @description /商业资料详情--接口请求Body参数
 * @url GET /biz/company/open-account/hsbc/commercial
 */
export interface getOpenAccountHsbcCommercialBody {
  id: number
}

/**
 * @description /商业资料详情--接口返回值
 * @url GET /biz/company/open-account/hsbc/commercial
 */
export interface getOpenAccountHsbcCommercialRes {
  approximate_annual_revenue_amount: number
  business_nature: string
  business_nature_description: string
  experience_business_year_count: number
  id: number
  major_customer_type: string
  operation_primary_country_or_region_code: string
}

/**
 * @description /有关人士(个人)详情--接口请求Query参数
 * @url GET /biz/company/open-account/hsbc/connected-individual
 */
export interface getOpenAccountHsbcConnectedIndividualQuery {
  /** 对应块资料id */
  id?: number
  /** 成员id */
  connected_id?: number
}

/**
 * @description /有关人士(个人)详情--接口请求Body参数
 * @url GET /biz/company/open-account/hsbc/connected-individual
 */
export interface getOpenAccountHsbcConnectedIndividualBody {
  id: number
}

/**
 * @description /有关人士(个人)详情--接口返回值
 * @url GET /biz/company/open-account/hsbc/connected-individual
 */
export interface getOpenAccountHsbcConnectedIndividualRes {
  authorised_signatory_indicator: number
  birth_date: string
  connected_id: number
  contact_person_indicator: number
  director_partner_sole_proprietor_indicator: number
  email_address_text: string
  first_name: string
  id: number
  identity_document_identifier: string
  identity_document_type: string
  job_title_text: string
  last_name: string
  mobile_phone_number: string
  operate_type: string
  residential_address_country_or_region_name: string
  residential_address_line1_text: string
  residential_address_line2_text: string
  residential_address_line3_text: string
  salutation: string
  ultimate_beneficial_owner_indicator: number
  ultimate_beneficial_ownership_percentage: number
}

/**
 * @description /有关人士(法人团体) 详情--接口请求Query参数
 * @url GET /biz/company/open-account/hsbc/connected-entity
 */
export interface getOpenAccountHsbcConnectedEntityQuery {
  /** 对应块资料id */
  id?: number
  /** 成员id */
  connected_id?: number
}

/**
 * @description /有关人士(法人团体) 详情--接口请求Body参数
 * @url GET /biz/company/open-account/hsbc/connected-entity
 */
export interface getOpenAccountHsbcConnectedEntityBody {
  id: number
}

/**
 * @description /有关人士(法人团体) 详情--接口返回值
 * @url GET /biz/company/open-account/hsbc/connected-entity
 */
export interface getOpenAccountHsbcConnectedEntityRes {
  authorised_signatory_indicator: number
  birth_date: string
  connected_id: number
  contact_person_indicator: number
  director_partner_sole_proprietor_indicator: number
  email_address_text: string
  first_name: string
  id: number
  identity_document_identifier: string
  identity_document_type: string
  job_title_text: string
  last_name: string
  mobile_phone_number: string
  operate_type: string
  residential_address: string
  residential_address_country_or_region_name: string
  salutation: string
  ultimate_beneficial_owner_indicator: number
  ultimate_beneficial_ownership_percentage: number
}

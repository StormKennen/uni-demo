export const getBusinessOrderServicePagePath = (product_id: number, presale_product_id: number) => {
  // 59 香港公司强积金年服务，57香港个人开立个户，74香港公司开立公户，77香港公司注册, 140 薪俸税，82 公司审计利得税, 80 个人税务

  const links = {
    59: '/pagesServices/business/mandatory-provident-fund/home',
    57: '/pagesServices/business/personal-account-open/service/service',
    74: '/pagesServices/business/company-account-open/service',
    77: '/pagesServices/business/register-company/index',
    140: '/pagesSalaryTax/home/index', // 薪俸税
    80: '/pagesPersonalTax/home', // 个人税务
    82: '/pagesCompanyAudit/home',
  }
  // 是否薪俸税项目
  const testArray = [534, 854, 1399, 1856, 1863, 1868, 1876, 1961, 1966, 1967]
  const productionArray = [
    534, 581, 662, 675, 788, 789, 790, 857, 1049, 1075, 1078, 1079, 1159, 1223, 1227, 1257, 1281, 1287, 1292, 1340, 1341, 1342, 1343, 1344,
    1348, 1378, 1379, 1399, 1407, 1418, 1424, 1429, 1437, 1452, 1457, 1463, 1471,
  ]

  const getIsSalariesTax = (product_id: number, presale_product_id: number) => {
    return (
      product_id === 140 ||
      (['dev', 'test'].includes(import.meta.env.VITE_APP_ENV)
        ? testArray.includes(presale_product_id)
        : productionArray.includes(presale_product_id))
    )
  }

  // 是否个税
  const testPersonalTaxArray = [1963, 1398, 852]
  const productionPersonalTaxArray = [
    1472, 1464, 1458, 1453, 1438, 1430, 1408, 1398, 1381, 1380, 1339, 1338, 1337, 1336, 1335, 1269, 1265, 1264,
  ]
  const getIsPersonalTax = (product_id: number, presale_product_id: number) => {
    return (
      product_id === 80 ||
      (['development', 'test'].includes(import.meta.env.VITE_APP_ENV)
        ? testPersonalTaxArray.includes(presale_product_id)
        : productionPersonalTaxArray.includes(presale_product_id))
    )
  }

  let path
  if (getIsSalariesTax(product_id, presale_product_id)) {
    path = links[140]
  } else if (getIsPersonalTax(product_id, presale_product_id)) {
    path = links[80]
  } else {
    path = links[product_id] || ''
  }
  return path
}

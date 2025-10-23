/*
 * @FilePath: /easybay-diy-mini-h5/apifox.config.js
 * @Description:
 */
module.exports = {
  module: 'uni',
  // moduleEnv: 'react-native',
  multiple: true, // 可能有多个项目引入
  // 选择你的项目id反注释掉就行，只支持一个projectId
  // projectId: 3454392, // DIY专项
  projectId: 3903128, // 超级APP
  // projectId: 3903128, // 支撑流程组-老CRM
  // projectId: 2581366, // C端项目组-全IT
  // 如果Authorization过期，直接访问https://app.apifox.com/main从某个接口的请求头里面copy Authorization header放到这里就行
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTk2MjMxLCJ0cyI6ImI1YTMyNDFlMWFjMWI5OGEiLCJpYXQiOjE3MDQ3MDUxMDYyMzB9.p4j-Es2P7AHHYrjd_BrZNi7oPYvYti_6BYQJoa_s3IA',
}

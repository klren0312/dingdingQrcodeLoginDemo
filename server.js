import express from 'express'
import { contact_1_0, oauth2_1_0 } from '@alicloud/dingtalk'
import * as $OpenApi from '@alicloud/openapi-client'
import * as $Util from '@alicloud/tea-util'

const CLIENTID = '' // 应用 client_id
const CLIENTSECRET = '' // 应用 client_secret

const app = express()
app.use(express.static('public'))

/**
 * 获取用户授权
 */
app.get('/auth', async (req, res) => {
  const config = new $OpenApi.Config({ })
  config.protocol = 'https'
  config.regionId = 'central'
  const client = new oauth2_1_0.default(config)
  const getUserTokenRequest = new oauth2_1_0.GetUserTokenRequest({
    clientId: CLIENTID,
    clientSecret: CLIENTSECRET,
    code: req.query.authCode,
    refreshToken: '',
    grantType: 'authorization_code',
  })
  try {
    const result = await client.getUserToken(getUserTokenRequest)
    const info = await getUserInfo(result.body.accessToken)
    res.json({
      data: {
        ackey: result.body,
        info: info.body
      }
    })
  } catch (err) {
    console.log(err)
  }
})

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})

/**
 * 获取用户信息
 * @param {string} accessToken
 * @returns 用户信息返回体
 */
async function getUserInfo (accessToken) {
  const config = new $OpenApi.Config({ })
  config.protocol = 'https'
  config.regionId = 'central'
  const client = new contact_1_0.default(config)
  const getUserHeader = new contact_1_0.GetUserHeaders()
  getUserHeader.xAcsDingtalkAccessToken = accessToken
  const infoRes = await client.getUserWithOptions('me', getUserHeader, new $Util.RuntimeOptions())
  return infoRes
}


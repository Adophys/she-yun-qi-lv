# 微信资质办理 Checklist（B8 · 小陈）

> 目的：让小程序走**真实微信登录 + 真实微信支付（方案 A）**。资质周期 2-4 周，是 MVP 落地的最长前置依赖，**请尽早启动**。
> 状态：资质未办齐前 `SHOP_PAYMENT_ENABLED=false`（代码已默认），商城在前端降级为「意向收集」。

## 一、微信小程序认证（必办，先办）

| # | 事项 | 说明 | 周期 | 状态 |
|---|---|---|---|---|
| 1 | 注册微信小程序账号 | mp.weixin.qq.com 注册，选「企业」主体（可用营业执照/学校课题名义） | 1-2 天 | ☐ |
| 2 | 微信认证（300 元/年） | 认证后才有支付等能力；未认证个人主体不可开支付 | 1-2 周（含审核） | ☐ |
| 3 | 获取 AppID/AppSecret | 「开发管理 → 开发设置」查看，**AppSecret 只能看一次，务必保存** | 即时 | ☐ |
| 4 | 配置合法域名 | 「开发管理 → 开发设置 → 服务器域名」：request 合法域名加入后端 HTTPS 域名 | 即时 | ☐ |
| 5 | 小程序类目审核 | 选择「旅游/文化」等合适类目，上传营业执照 | 与认证同步 | ☐ |

## 二、微信支付商户号（办完认证才能开）

| # | 事项 | 说明 | 周期 | 状态 |
|---|---|---|---|---|
| 6 | 申请微信支付商户号 | pay.weixin.qq.com，用已认证的小程序关联申请 | 1-2 周 | ☐ |
| 7 | 商户号绑定 AppID | 「产品中心 → AppID 账号管理」绑定小程序 AppID | 即时 | ☐ |
| 8 | 开通 JSAPI 支付 | 「产品中心 → 开发配置」开通 JSAPI 支付 | 即时 | ☐ |
| 9 | 设置支付回调域名 | 「产品中心 → 开发配置 → 支付配置」填写后端回调 URL（需 HTTPS） | 即时 | ☐ |
| 10 | 下载商户 API 证书 | 「账户中心 → API 安全」下载 apiclient_cert.pem / apiclient_key.pem，记录 APIv3 密钥、商户证书序列号 | 即时 | ☐ |

## 三、后端配置（资质到位后填入）

编辑 `backend/.env`（生产 `docker-compose.prod.yml` 对应 `.env.production`）：

```ini
# 微信登录
WECHAT_APPID=wx实际AppID
WECHAT_SECRET=实际AppSecret

# 微信支付（方案 A）
SHOP_PAYMENT_ENABLED=true
WECHAT_PAY_MCHID=1900000000            # 商户号
WECHAT_PAY_APPID=wx实际AppID          # 与商户号绑定
WECHAT_PAY_API_V3_KEY=APIv3密钥
WECHAT_PAY_SERIAL_NO=证书序列号
WECHAT_PAY_PRIVATE_KEY_PATH=/secrets/apiclient_key.pem
WECHAT_PAY_NOTIFY_URL=https://api.example.com/api/v1/app/shop/pay/notify
```

> ⚠️ 所有密钥只进 `.env` / 服务器环境变量，**严禁提交到 Git**。生产 secret 用 `openssl rand -hex 32` 生成。

## 四、无资质时的降级方案（当前默认）

- `SHOP_PAYMENT_ENABLED=false`：商城可浏览/加购，下单按钮提示「意向收集」（留手机号），不做真实支付。
- `WECHAT_APPID/WECHAT_SECRET` 为空：`wx-login` 走 **mock 模式**（任意 code 换稳定 openid），本地联调正常，提审前必须换成真实 AppID。

## 五、关键时间提醒

- 认证 + 商户号合计 2-4 周 → **本周内必须提交小程序认证申请**。
- 域名备案（B7）：国内服务器域名需 ICP 备案（约 1-2 周），与微信认证并行推进。

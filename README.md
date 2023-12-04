# openai-billing
This project provides a quick and easy way to check OpenAI API Key balances, supports multiple key checks, and includes a tutorial for setting up a Cloudflare reverse proxy.这个项目提供了一个快速简便的方式来查询 OpenAI API Key 的余额，支持多个 Key 的查询，并附带了 Cloudflare 反向代理的搭建教程。

## Feature：

1. 纯开源项目，使用 html 内的js 脚本请求内容，不会收集任何数据
2. 支持国内直连，输入 API Key 后自动识别查询
3. 支持自建反向代理查询，让你的查询更安心
4. 支持多个 KEY 查询，自动提取 KEY 并批量查询
5. 包含独立部署反代代码，使用更放心。
6. 用React 进行重构，添加pwa支持

查询结果样例如下：

| API KEY                                    | 总限额   | 已使用 | 剩余量  | 到期时间    | GPT-4 | 是否绑卡 |
| ----------------------------------------- | ------- | ------ | ------- | ----------- | ----- | -------- |
| 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 | 账户疑似被封禁，请登录 OpenAI 官网确认| | | | ❌    | 🔴      |
| sk-92I2***lVEv0i                          | 5.00    | 0.00   | 5.00    | 2023-09-01 | ❌    | 🟢      |
| sk-6f9R***iHouYS                          | 5000.00 | 144.10 | 4855.90 | 2023-07-01 | ❌    | 🟢      |
| sk-jA6g***3lDJem                          | 18.00   | 0.00   | 🔴过期 | 2023-06-01 | ❌    | 🔴      |


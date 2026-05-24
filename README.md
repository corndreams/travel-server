# travel-server（后端）

AI 旅游行程规划助手的后端服务：提供行程推荐接口与 AI 流式对话接口，基于 Express + LangChain 调用大模型生成内容。

## 功能

- 行程推荐：接收 `city/budget/days`，生成结构化行程 JSON（按天 + 早/中/晚安排 + 预算明细 + tips/warnings）
- AI 对话：基于 SSE（`text/event-stream`）向前端流式推送回复片段
- 多模型配置：通过环境变量切换模型供应商与模型参数

## 技术栈

- Node.js + Express
- LangChain（ChatOpenAI）
- dotenv（环境变量）+ cors

## 接口

- `POST /travel/recommend`
  - body：`{ "city": "北京", "budget": 2000, "days": 3 }`
  - 返回：行程规划 JSON（成功时包含 `success: true`）
- `POST /travel/chat`
  - body：`{ "message": "北京有哪些必去景点？" }`
  - 返回：SSE 流式数据，按 chunk 推送

## 环境变量（.env）

服务会读取以下环境变量（不要把真实 key 提交到仓库）：

- `PORT`：服务端口（前端默认请求 `3300`，可设置 `PORT=3300` 对齐）
- `MODEL_PROVIDER`：`SILICONFLOW` / `DEEPSEEK` / `MINIMAX`
- 对应 provider 的配置（按你选择的 provider 填写）：
  - `SILICONFLOW_API_KEY` `SILICONFLOW_API_URL` `SILICONFLOW_API_MODEL`
  - `DEEPSEEK_API_KEY` `DEEPSEEK_API_URL` `DEEPSEEK_API_MODEL`
  - `MINIMAX_API_KEY` `MINIMAX_API_URL` `MINIMAX_API_MODEL`

## 启动

环境要求：建议 Node.js 18+，包管理器 pnpm

```bash
pnpm install
pnpm start
```

启动后默认监听 `http://localhost:PORT`，业务接口前缀为 `/travel`。

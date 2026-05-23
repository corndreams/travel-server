var { ChatOpenAI } = require("@langchain/openai");
var { HumanMessage, SystemMessage } = require("@langchain/core/messages");
var dotenv = require("dotenv");

dotenv.config();

class TravelService {
  constructor() {
    this.llm = null;
    this.initLLM();
  }

  initLLM() {
    // 初始化LLM
    const provider = process.env.MODEL_PROVIDER;

    let apikey, apiurl, model;
    if (provider === "SILICONFLOW") {
      apikey = process.env.SILICONFLOW_API_KEY;
      apiurl = process.env.SILICONFLOW_API_URL;
      model = process.env.SILICONFLOW_API_MODEL;
    } else if (provider === "DEEPSEEK") {
      apikey = process.env.DEEPSEEK_API_KEY;
      apiurl = process.env.DEEPSEEK_API_URL;
      model = process.env.DEEPSEEK_API_MODEL;
    } else if (provider === "MINIMAX") {
      apikey = process.env.MINIMAX_API_KEY;
      apiurl = process.env.MINIMAX_API_URL;
      model = process.env.MINIMAX_API_MODEL;
    }

    console.log(apikey);
    console.log(apiurl);
    console.log(model);

    this.llm = new ChatOpenAI({
      configuration: {
        baseURL: apiurl,
      },
      apiKey: apikey,
      model: model,
      temperature: 0.7,
      streaming: true,
    });
  }

  async recommend(city, budget, days) {
    // 推荐
    if (budget < 100 || days < 1 || days > 30) {
      return "预算应该在100元以上，天数应该在1到30天之间";
    }
    const prompt = this.getTravelPrompt(city, budget, days);
    try {
      const response = await this.llm.invoke(prompt);
      const fullResponse = response.content || "";

      try {
        const jsonMatch =
          fullResponse.match(/```json\n([\s\S]*?)```/) ||
          fullResponse.match(/```\n([\s\S]*?)```/) ||
          fullResponse.match(/\{[\s\S]*?}/);
        const resData = JSON.parse(jsonMatch[1]);
        return resData;
      } catch (error) {
        return {
          success: false,
          message: "JSON解析失败",
          error: error.message,
        };
      }
    } catch (error) {
      return error;
    }
  }

  getTravelPrompt(city, budget, days) {
    return [
      new HumanMessage(`
      你是一个专业的旅游推荐助手，你的任务是根据用户的输入，推荐一个合适的旅游计划。
      请根据以下输入，推荐一个合适的旅游计划：
      目的地：${city}
      预算：${budget}元
      天数：${days}天

      要求：
      1.每天的行程安排(上午、下午、晚上)
      2.每个景点的详细介绍
      3.交通建议
      4.预算分配明细
      5.其他注意事项

      请以JSON格式输出,结构如下：
      {
        "success": true,
          "city": "填写对应城市名称",
          "days": 填写数字天数,
          "totalBudget": 填写数字总预算金额,
          "dailyItinerary": [
            {
              "day": 1,
              "morning": {
                "spot": "景点名称",
                "duration": "游玩时长",
                "ticket": "门票费用",
                "transportation": "交通方式",
                "description": "景点详细介绍",
                "playContent": "游玩具体内容"
              },
              "afternoon": {
                "spot": "景点名称",
                "duration": "游玩时长",
                "ticket": "门票费用",
                "transportation": "交通方式",
                "description": "景点详细介绍",
                "playContent": "游玩具体内容"
              },
              "evening": {  
                "spot": "景点/商圈名称",
                "duration": "游玩时长",
                "ticket": "门票费用",
                "transportation": "交通方式",
                "description": "场所详细介绍",
                "playContent": "游玩休闲内容"
              }
            }
          ],
          "budgetDetail": {
            "accommodation": 住宿费用,
            "tickets": "门票费用",
            "food": "餐饮费用",
            "transportation": "交通费用",
            "other": "其他杂费"
          },
          "tips": ["提示1","提示2","提示3"],
          "warning": ["注意事项1","注意事项2"]
        }
      }

      请确保输出的JSON格式正确，可以被解析。
      `),
    ];
  }

  async chat(message, streamCallback) {
    const messages = [
      new SystemMessage(
        "你是一个专业且友好的旅游推荐助手，你的任务是根据用户的输入，推荐一个合适的旅游计划。",
      ),
      new HumanMessage(message),
    ];
    const stream = await this.llm.stream(messages);

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.content || "";

      // 过滤空内容
      if (content.trim() === "") {
        continue;
      }

      fullResponse += content;

      if (streamCallback) {
        streamCallback(content);
      }
    }
    return {
      success: true,
      reply: fullResponse,
    };
  }
}

module.exports = new TravelService();

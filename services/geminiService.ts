
import { GoogleGenAI } from "@google/genai";

/**
 * 极度安全的环境变量获取方法
 */
const getSafeApiKey = (): string => {
  try {
    // 必须使用 typeof 检查，否则直接访问 process 会在某些浏览器中抛错
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // 忽略任何环境变量访问错误
  }
  return '';
};

// 将 AI 实例放在函数内部初始化，防止在模块加载阶段崩溃
let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  const apiKey = getSafeApiKey();
  if (!apiKey) return null;
  
  try {
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
  } catch (err) {
    console.error("AI Client Initialization Failed:", err);
    return null;
  }
};

export const getTradingAdvice = async (leaderPnl: number, followerPnl: number, marketPrice: number) => {
  const ai = getAiClient();
  
  if (!ai) {
    return "提示：系统检测到未配置 API_KEY。请在 Vercel 环境变量中设置 API_KEY 后重新部署。";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `当前 BTC 市场背景:
      - 当前 BTC 价格: $${marketPrice.toLocaleString()}
      - 带单端 (Leader) 累计盈亏: $${leaderPnl.toFixed(2)}
      - 跟单端 (5倍反向跟单) 累计盈亏: $${followerPnl.toFixed(2)}
      
      请分析这种“反向跟单”策略在当前行情下的表现。解释为什么跟单端相对于带单端在盈利或亏损。请以专业、简洁且通俗易懂的方式为新手交易者提供中文投资洞察，长度在 150 字以内。`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 350,
      }
    });
    return response.text || "暂无分析数据。";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "策略中心当前无法连接。请检查网络。";
  }
};

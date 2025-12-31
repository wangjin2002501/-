
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTradingAdvice = async (leaderPnl: number, followerPnl: number, marketPrice: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current BTC Market Context:
      - Current BTC Price: $${marketPrice.toLocaleString()}
      - Leader Cumulative PnL: $${leaderPnl.toFixed(2)}
      - Follower (Reverse 5x) Cumulative PnL: $${followerPnl.toFixed(2)}
      
      Analyze this "Reverse Copy Trading" strategy performance. Explain why the follower might be winning or losing compared to the leader. Provide a short, professional trading insight for a beginner trader.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Market analysis temporarily unavailable. Continue monitoring volatility.";
  }
};

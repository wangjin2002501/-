
import { Side } from '../types.ts';

/**
 * LighterService: 与 Lighter.xyz (Arbitrum) 交互的逻辑
 */
export class LighterService {
  private apiKey: string = '';
  private rpcUrl: string = 'https://arb1.arbitrum.io/rpc';

  updateCredentials(apiKey: string, rpcUrl: string) {
    this.apiKey = apiKey;
    this.rpcUrl = rpcUrl;
  }

  // 模拟链上下单
  async placeOrder(side: Side, amount: number, price: number) {
    if (!this.apiKey) {
      throw new Error("API 私钥未配置，无法执行真实交易。");
    }

    console.log(`[LighterAPI] 正在执行 ${side} 订单: ${amount} BTC @ $${price}`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      status: 'success',
      timestamp: Date.now()
    };
  }

  async cancelAllOrders() {
    if (!this.apiKey) return { success: false };
    console.log("[LighterAPI] 正在撤销所有活跃订单...");
    return { success: true };
  }
}

export const lighterApi = new LighterService();

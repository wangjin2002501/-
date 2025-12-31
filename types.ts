
export type Side = 'LONG' | 'SHORT' | 'NONE';

export interface TradeSignal {
  id: string;
  side: Side;
  price: number;
  timestamp: number;
  type: 'OPEN' | 'CLOSE';
  originalAmount: number;
  txHash?: string;
}

export interface Position {
  side: Side;
  entryPrice: number;
  amount: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED';
  txHash?: string;
}

export interface ApiConfig {
  followerPrivateKey: string;
  arbitrumRpc: string;
  leaderAddress: string;
}

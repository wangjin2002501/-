
import React, { useState, useEffect } from 'react';
import { Position, Side } from '../types';

interface Props {
  btcPrice: number;
  onSignal: (side: Side, type: 'OPEN' | 'CLOSE', amount: number) => void;
  onPnlUpdate: (pnl: number) => void;
  watchAddress: string;
}

export const LeaderTerminal: React.FC<Props> = ({ btcPrice, onSignal, onPnlUpdate, watchAddress }) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [cumulativePnl, setCumulativePnl] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  // Simulation of "Scanning Blockchain"
  useEffect(() => {
    if (position && position.status === 'OPEN') {
      const diff = position.side === 'LONG' ? btcPrice - position.entryPrice : position.entryPrice - btcPrice;
      const pnl = diff * position.amount;
      setPosition(prev => prev ? { ...prev, pnl } : null);
    }
  }, [btcPrice]);

  const simulateMarketEvent = (side: Side, amount: number) => {
    const newPos: Position = {
      side,
      entryPrice: btcPrice,
      amount,
      leverage: 1,
      pnl: 0,
      pnlPercent: 0,
      status: 'OPEN',
      txHash: `0x${Math.random().toString(16).slice(2, 42)}`
    };
    setPosition(newPos);
    onSignal(side, 'OPEN', amount);
  };

  const simulateClose = () => {
    if (position) {
      setCumulativePnl(prev => prev + position.pnl);
      onPnlUpdate(cumulativePnl + position.pnl);
      onSignal('NONE', 'CLOSE', 0);
      setPosition(null);
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full ring-1 ring-white/5">
      <div className="px-5 py-4 bg-zinc-900/30 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'}`}></div>
          <span className="text-xs font-black text-zinc-100 uppercase tracking-widest">Monitoring Leader</span>
        </div>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
          {watchAddress || '0x...'}
        </span>
      </div>

      <div className="p-6 flex-grow space-y-6">
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl py-10 bg-zinc-900/10">
          {position ? (
            <div className="w-full px-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${position.side === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  Lighter.xyz {position.side}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">TX: {position.txHash?.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Active Amount</div>
                  <div className="text-2xl font-black text-zinc-100 mono">{position.amount} BTC</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Unrealized PnL</div>
                  <div className={`text-xl font-bold mono ${position.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${position.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
              <button 
                onClick={simulateClose}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-black rounded-lg transition-all border border-zinc-700"
              >
                SIMULATE MANUAL CLOSE
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                Listening for order events on Arbitrum...
              </div>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => simulateMarketEvent('LONG', 0.1)}
                  className="px-4 py-2 bg-emerald-600/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  Simulate Buy
                </button>
                <button 
                  onClick={() => simulateMarketEvent('SHORT', 0.1)}
                  className="px-4 py-2 bg-rose-600/10 text-rose-500 text-[10px] font-bold rounded border border-rose-500/20 hover:bg-rose-500/20"
                >
                  Simulate Sell
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
           <div className="text-[10px] text-zinc-500 font-bold uppercase mb-3 flex items-center gap-2">
             <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
             Recent Account History (Lighter)
           </div>
           <div className="space-y-2">
             <div className="flex justify-between text-[10px] font-mono border-b border-zinc-900 pb-2">
               <span className="text-zinc-500">TYPE</span>
               <span className="text-zinc-500">PRICE</span>
               <span className="text-zinc-500">SIZE</span>
             </div>
             <div className="flex justify-between text-[10px] font-mono text-zinc-400">
               <span className="text-emerald-500">BUY</span>
               <span>$64,120.5</span>
               <span>0.10 BTC</span>
             </div>
             <div className="flex justify-between text-[10px] font-mono text-zinc-400">
               <span className="text-rose-500">SELL</span>
               <span>$63,980.2</span>
               <span>0.25 BTC</span>
             </div>
           </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono">
        <span className="text-zinc-500">SYNCED_BLOCK: 182,129,041</span>
        <span className="text-zinc-400">PNL: <span className={cumulativePnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>${cumulativePnl.toFixed(2)}</span></span>
      </div>
    </div>
  );
};

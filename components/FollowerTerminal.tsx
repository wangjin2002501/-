
import React, { useState, useEffect } from 'react';
import { Position, Side, TradeSignal } from '../types';
import { lighterApi } from '../services/lighterService';

interface Props {
  btcPrice: number;
  channelName: string;
  onPnlUpdate: (pnl: number) => void;
  apiKey: string;
}

export const FollowerTerminal: React.FC<Props> = ({ btcPrice, channelName, onPnlUpdate, apiKey }) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [cumulativePnl, setCumulativePnl] = useState(0);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  const [isTransacting, setIsTransacting] = useState(false);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type}, ...prev].slice(0, 10));
  };

  useEffect(() => {
    const bc = new BroadcastChannel(channelName);
    bc.onmessage = async (event: MessageEvent<TradeSignal>) => {
      const signal = event.data;
      
      if (signal.type === 'OPEN') {
        const reverseSide: Side = signal.side === 'LONG' ? 'SHORT' : 'LONG';
        const followerAmount = signal.originalAmount * 5;

        addLog(`SIGNAL: Leader ${signal.side} ${signal.originalAmount} BTC. Initiating 5X Reverse...`, 'info');
        
        setIsTransacting(true);
        try {
          // ACTUAL API CALL
          const result = await lighterApi.placeOrder(reverseSide, followerAmount, btcPrice);
          
          addLog(`SUCCESS: ${reverseSide} ${followerAmount} BTC placed via Lighter API. Hash: ${result.hash.slice(0,12)}...`, 'success');
          
          const newPos: Position = {
            side: reverseSide,
            entryPrice: btcPrice,
            amount: followerAmount,
            leverage: 5,
            pnl: 0,
            pnlPercent: 0,
            status: 'OPEN',
            txHash: result.hash
          };
          setPosition(newPos);
        } catch (error: any) {
          addLog(`API ERROR: ${error.message}`, 'error');
        } finally {
          setIsTransacting(false);
        }
      } else if (signal.type === 'CLOSE') {
        addLog(`SIGNAL: Leader Closed. Closing Follower via API...`, 'info');
        if (position) {
          setIsTransacting(true);
          try {
            await lighterApi.cancelAllOrders();
            const diff = position.side === 'LONG' ? btcPrice - position.entryPrice : position.entryPrice - btcPrice;
            const finalPnl = diff * position.amount;
            setCumulativePnl(prev => {
              const next = prev + finalPnl;
              onPnlUpdate(next);
              return next;
            });
            addLog(`SUCCESS: All positions closed on Lighter. Final PnL: $${finalPnl.toFixed(2)}`, 'success');
          } catch (error: any) {
            addLog(`API ERROR: ${error.message}`, 'error');
          } finally {
            setIsTransacting(false);
          }
        }
        setPosition(null);
      }
    };
    return () => bc.close();
  }, [channelName, btcPrice, position, apiKey]);

  useEffect(() => {
    if (position) {
      const diff = position.side === 'LONG' ? btcPrice - position.entryPrice : position.entryPrice - btcPrice;
      setPosition(prev => prev ? { ...prev, pnl: diff * position.amount, pnlPercent: (diff/position.entryPrice)*500 } : null);
    }
  }, [btcPrice]);

  return (
    <div className="bg-[#0c0c0c] border border-orange-900/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full ring-1 ring-orange-500/10">
      <div className="px-5 py-4 bg-orange-950/10 border-b border-orange-900/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isTransacting ? 'bg-orange-500 animate-ping' : 'bg-orange-500'}`}></div>
          <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Execution Engine (API)</span>
        </div>
        {!apiKey && <span className="text-[10px] text-rose-500 animate-pulse font-bold">MISSING API KEY</span>}
      </div>

      <div className="p-6 flex-grow space-y-6">
        {position ? (
          <div className="bg-zinc-950 p-6 rounded-xl border border-orange-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500/10 rounded-bl-xl">
              <span className="text-[10px] font-mono text-orange-500">AUTO_PILOT_EXECUTING</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Reverse Side</div>
                <div className={`text-2xl font-black ${position.side === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {position.side} 5X
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Exec Amount</div>
                <div className="text-2xl font-black text-zinc-100 mono">{position.amount.toFixed(2)} BTC</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900 grid grid-cols-2 items-end">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Real-time P&L</div>
                <div className={`text-3xl font-black font-mono ${position.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 mb-1 font-mono">{position.txHash?.slice(0,16)}...</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-tighter">Arbitrum Confirmation</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-zinc-950/50 border border-dashed border-zinc-800 rounded-xl">
             {isTransacting ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                 <div className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Broadcasting Transaction...</div>
               </div>
             ) : (
               <div className="space-y-3 opacity-30">
                 <span className="text-4xl block">📡</span>
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Awaiting API Signal from Monitor</p>
               </div>
             )}
          </div>
        )}

        <div className="bg-[#050505] rounded-xl p-4 border border-zinc-800 font-mono">
           <div className="text-[10px] text-zinc-600 mb-3 uppercase flex justify-between">
             <span>Engine Execution Logs</span>
             <span className="text-emerald-500/50">Lighter_Node: Active</span>
           </div>
           <div className="space-y-1.5 h-32 overflow-y-auto custom-scrollbar">
             {logs.length > 0 ? logs.map((log, i) => (
               <div key={i} className={`text-[9px] border-l-2 pl-2 ${
                 log.type === 'error' ? 'border-rose-500 text-rose-400' : 
                 log.type === 'success' ? 'border-emerald-500 text-emerald-400' : 
                 'border-zinc-800 text-zinc-500'
               }`}>
                 {log.msg}
               </div>
             )) : (
               <div className="text-[10px] text-zinc-800 italic">No activity recorded...</div>
             )}
           </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-orange-950/5 border-t border-orange-900/10 text-[10px] flex justify-between items-center font-mono">
        <div className="flex gap-4">
          <span className="text-zinc-600">SLIPPAGE: 0.5%</span>
          <span className="text-zinc-600">MAX_FEE: 0.01 ETH</span>
        </div>
        <span className="text-zinc-400">FOLLOW_PNL: <span className={cumulativePnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>${cumulativePnl.toFixed(2)}</span></span>
      </div>
    </div>
  );
};

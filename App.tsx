
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LeaderTerminal } from './components/LeaderTerminal';
import { FollowerTerminal } from './components/FollowerTerminal';
import { MarketWidget } from './components/MarketWidget';
import { TradeSignal, Side, ApiConfig } from './types';
import { getTradingAdvice } from './services/geminiService';

const BROADCAST_CHANNEL_NAME = 'lighter_api_bridge_v2';

const App: React.FC = () => {
  const [btcPrice, setBtcPrice] = useState(64250.50);
  const [aiInsight, setAiInsight] = useState<string>("系统就绪。请配置 Lighter.xyz API 凭证...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // API Config State
  const [config, setConfig] = useState<ApiConfig>({
    followerPrivateKey: '',
    arbitrumRpc: 'https://arb1.arbitrum.io/rpc',
    leaderAddress: '0x71C...F3a'
  });

  // Performance Stats
  const [leaderPnl, setLeaderPnl] = useState(0);
  const [followerPnl, setFollowerPnl] = useState(0);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  // Real-time price simulation (Replace with actual WSS later)
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 12);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const broadcastSignal = useCallback((side: Side, type: 'OPEN' | 'CLOSE', amount: number) => {
    const signal: TradeSignal = {
      id: `SIG-${Date.now()}`,
      side,
      price: btcPrice,
      timestamp: Date.now(),
      type,
      originalAmount: amount
    };
    channelRef.current?.postMessage(signal);
  }, [btcPrice]);

  const refreshAiInsight = async () => {
    setIsAiLoading(true);
    const insight = await getTradingAdvice(leaderPnl, followerPnl, btcPrice);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  useEffect(() => {
    refreshAiInsight();
    const interval = setInterval(refreshAiInsight, 45000);
    return () => clearInterval(interval);
  }, [leaderPnl, followerPnl]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10 flex flex-col gap-6 bg-[#020202]">
      {/* Top Navigation / Status */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#080808] border border-zinc-800 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <span className="text-3xl">🎛️</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#080808] animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              LIGHTER API BRIDGE
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-mono tracking-widest">PRO_MODE</span>
            </h1>
            <div className="flex gap-3 mt-1 items-center">
              <span className="text-zinc-500 text-[10px] font-mono uppercase">Node: Arbitrum One</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <span className="text-zinc-500 text-[10px] font-mono uppercase">API: Enabled</span>
            </div>
          </div>
        </div>
        <MarketWidget price={btcPrice} />
      </header>

      {/* API Configuration Panel */}
      <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Follower Private Key (API)</label>
          <input 
            type="password"
            value={config.followerPrivateKey}
            onChange={(e) => setConfig({...config, followerPrivateKey: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-orange-400 font-mono outline-none focus:border-orange-500/50"
            placeholder="0x... (Required for Auto-Trade)"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Arbitrum RPC URL</label>
          <input 
            type="text"
            value={config.arbitrumRpc}
            onChange={(e) => setConfig({...config, arbitrumRpc: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 font-mono outline-none focus:border-zinc-700"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Watching Address (Leader)</label>
          <input 
            type="text"
            value={config.leaderAddress}
            onChange={(e) => setConfig({...config, leaderAddress: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-blue-400 font-mono outline-none focus:border-blue-500/50"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        <LeaderTerminal 
          btcPrice={btcPrice} 
          onSignal={broadcastSignal}
          onPnlUpdate={setLeaderPnl}
          watchAddress={config.leaderAddress}
        />
        <FollowerTerminal 
          btcPrice={btcPrice} 
          channelName={BROADCAST_CHANNEL_NAME}
          onPnlUpdate={setFollowerPnl}
          apiKey={config.followerPrivateKey}
        />
      </div>

      <section className="bg-[#080808] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <span className="text-emerald-500">🧠</span>
          </div>
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Gemini 策略中枢</h2>
        </div>
        <div className={`text-zinc-400 text-sm leading-relaxed max-w-4xl ${isAiLoading ? 'animate-pulse' : ''}`}>
          {aiInsight}
        </div>
      </section>

      <footer className="flex justify-between items-center text-[10px] text-zinc-600 font-mono">
        <span>© 2025 LIGHTER REVERSE BRIDGE v2.5</span>
        <div className="flex gap-4">
          <span className="hover:text-zinc-400 cursor-pointer">DOCUMENTATION</span>
          <span className="hover:text-zinc-400 cursor-pointer">API REFRESH: 45S</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

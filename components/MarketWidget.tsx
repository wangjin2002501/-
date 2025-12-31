
import React from 'react';

interface Props {
  price: number;
}

export const MarketWidget: React.FC<Props> = ({ price }) => {
  return (
    <div className="flex items-center gap-6">
      <div className="text-right">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">BTC/USDT 永续</div>
        <div className="text-xl md:text-2xl font-bold mono text-emerald-400">
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      <div className="hidden sm:block h-10 w-[1px] bg-zinc-800"></div>
      <div className="hidden sm:flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-zinc-400">WebSocket Connected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span className="text-[10px] text-zinc-400">Signal Relay Active</span>
        </div>
      </div>
    </div>
  );
};

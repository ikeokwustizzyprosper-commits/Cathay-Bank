import React, { useState } from 'react';
import { useAppContext } from '../App';
import { formatCurrency, convertFromGbp } from '../constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronRight, ShieldCheck } from 'lucide-react';

export interface CryptoItem {
  symbol: 'USDT' | 'BTC' | 'ETH' | 'XRP' | 'BNB' | 'SOL';
  name: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  color: string;
  iconBg: string;
  history: { time: string; price: number }[];
}

export const INITIAL_CRYPTO_DATA: CryptoItem[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.8542,
    priceUsd: 67840.50,
    change24h: 3.42,
    color: '#F7931A',
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    history: [
      { time: '00:00', price: 65200 },
      { time: '04:00', price: 65800 },
      { time: '08:00', price: 66400 },
      { time: '12:00', price: 66100 },
      { time: '16:00', price: 67200 },
      { time: '20:00', price: 67840 },
    ],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 4.8250,
    priceUsd: 3480.20,
    change24h: 2.15,
    color: '#627EEA',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    history: [
      { time: '00:00', price: 3390 },
      { time: '04:00', price: 3410 },
      { time: '08:00', price: 3440 },
      { time: '12:00', price: 3420 },
      { time: '16:00', price: 3465 },
      { time: '20:00', price: 3480 },
    ],
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: 14250.00,
    priceUsd: 1.00,
    change24h: 0.01,
    color: '#26A17B',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    history: [
      { time: '00:00', price: 1.00 },
      { time: '04:00', price: 1.001 },
      { time: '08:00', price: 0.999 },
      { time: '12:00', price: 1.00 },
      { time: '16:00', price: 1.0005 },
      { time: '20:00', price: 1.00 },
    ],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: 48.60,
    priceUsd: 154.30,
    change24h: 5.84,
    color: '#14F195',
    iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    history: [
      { time: '00:00', price: 142.5 },
      { time: '04:00', price: 145.0 },
      { time: '08:00', price: 148.2 },
      { time: '12:00', price: 147.8 },
      { time: '16:00', price: 152.1 },
      { time: '20:00', price: 154.3 },
    ],
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    balance: 12.40,
    priceUsd: 588.60,
    change24h: -0.82,
    color: '#F3BA2F',
    iconBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    history: [
      { time: '00:00', price: 595.0 },
      { time: '04:00', price: 592.5 },
      { time: '08:00', price: 586.0 },
      { time: '12:00', price: 589.2 },
      { time: '16:00', price: 587.0 },
      { time: '20:00', price: 588.6 },
    ],
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    balance: 3850.00,
    priceUsd: 0.584,
    change24h: 1.94,
    color: '#23292F',
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    history: [
      { time: '00:00', price: 0.568 },
      { time: '04:00', price: 0.572 },
      { time: '08:00', price: 0.570 },
      { time: '12:00', price: 0.579 },
      { time: '16:00', price: 0.581 },
      { time: '20:00', price: 0.584 },
    ],
  },
];

export const CryptoAssetsSection: React.FC = () => {
  const { state } = useAppContext();
  const [selectedSymbol, setSelectedSymbol] = useState<'BTC' | 'ETH' | 'USDT' | 'SOL' | 'BNB' | 'XRP'>('BTC');

  // Total portfolio value calculation
  const totalCryptoUsd = INITIAL_CRYPTO_DATA.reduce((acc, coin) => acc + (coin.balance * coin.priceUsd), 0);
  const totalCryptoInCurrency = convertFromGbp(totalCryptoUsd * 0.78, state.currentCurrency); // rough approx GBP rate

  const activeCoin = INITIAL_CRYPTO_DATA.find(c => c.symbol === selectedSymbol) || INITIAL_CRYPTO_DATA[0];

  return (
    <div className="px-5 mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Crypto Vault & Assets</h3>
            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Market
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400">Supported tokens: USDT, BTC, ETH, XRP, BNB, SOL</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Portfolio Value</p>
          <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalCryptoInCurrency, state.currentCurrency)}
          </p>
        </div>
      </div>

      {/* Main Crypto Card Container */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Selected Asset Header & Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black text-xs ${activeCoin.iconBg}`}>
                {activeCoin.symbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">{activeCoin.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">({activeCoin.symbol})</span>
                </div>
                <p className="text-xs font-black text-slate-200">
                  ${activeCoin.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  <span className={`ml-2 text-[10px] font-bold inline-flex items-center ${activeCoin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeCoin.change24h >= 0 ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                    {activeCoin.change24h >= 0 ? '+' : ''}{activeCoin.change24h}%
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Vault Balance</span>
              <p className="text-sm font-black text-amber-400 tabular-nums">
                {activeCoin.balance.toLocaleString()} {activeCoin.symbol}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 tabular-nums">
                ≈ ${(activeCoin.balance * activeCoin.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>

          {/* Recharts 24h Price Trend */}
          <div className="h-32 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeCoin.history} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={`cryptoGrad-${activeCoin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeCoin.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={activeCoin.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={activeCoin.color} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill={`url(#cryptoGrad-${activeCoin.symbol})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crypto Asset Selectors Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-slate-800">
          {INITIAL_CRYPTO_DATA.map(coin => {
            const isSelected = coin.symbol === selectedSymbol;
            return (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`p-2.5 rounded-2xl border text-left transition duration-200 ${
                  isSelected 
                    ? 'bg-slate-800 border-amber-500/50 shadow-md shadow-amber-500/10 scale-[1.02]' 
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                    {coin.symbol}
                  </span>
                  <span className={`text-[8px] font-bold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </span>
                </div>
                <p className="text-xs font-black text-white truncate tabular-nums">
                  {coin.balance}
                </p>
                <p className="text-[8px] font-semibold text-slate-400 truncate">
                  ${(coin.balance * coin.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CryptoAssetsSection;

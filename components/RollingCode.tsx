import React, { useState, useEffect } from 'react';

interface RollingCodeProps {
  code?: string;
  isRolling?: boolean;
  onRollAgain?: () => void;
  label?: string;
  showRollButton?: boolean;
}

export const RollingCodeDisplay: React.FC<RollingCodeProps> = ({
  code = '',
  isRolling = false,
  onRollAgain,
  label = '6-Digit Verification Code',
  showRollButton = true,
}) => {
  const [displayDigits, setDisplayDigits] = useState<string[]>(['0', '0', '0', '0', '0', '0']);
  const [animating, setAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (isRolling || !code) {
      setAnimating(true);
      const interval = setInterval(() => {
        setDisplayDigits([
          Math.floor(Math.random() * 10).toString(),
          Math.floor(Math.random() * 10).toString(),
          Math.floor(Math.random() * 10).toString(),
          Math.floor(Math.random() * 10).toString(),
          Math.floor(Math.random() * 10).toString(),
          Math.floor(Math.random() * 10).toString(),
        ]);
      }, 50);

      const timer = setTimeout(() => {
        clearInterval(interval);
        if (code && code.length >= 6) {
          setDisplayDigits(code.slice(0, 6).split(''));
        }
        setAnimating(false);
      }, 1200);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      const padded = (code + '000000').slice(0, 6);
      setDisplayDigits(padded.split(''));
      setAnimating(false);
    }
  }, [code, isRolling]);

  const handleManualRoll = () => {
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setDisplayDigits([
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
      ]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        if (onRollAgain) {
          onRollAgain();
        } else if (code && code.length >= 6) {
          setDisplayDigits(code.slice(0, 6).split(''));
        }
        setAnimating(false);
      }
    }, 60);
  };

  return (
    <div className="w-full bg-slate-900/90 dark:bg-slate-950/90 text-white p-4 rounded-2xl border border-primary/30 shadow-xl my-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {label}
          </span>
        </div>
        {showRollButton && (
          <button
            type="button"
            onClick={handleManualRoll}
            className="text-[10px] font-bold text-amber-300 hover:text-amber-200 uppercase tracking-tight flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
          >
            <span>🔄 Roll Code Again</span>
          </button>
        )}
      </div>

      <div className="flex justify-center items-center gap-2 py-2">
        {displayDigits.map((digit, idx) => (
          <div
            key={idx}
            className={`w-10 h-12 sm:w-12 sm:h-14 bg-slate-800/90 border-2 ${
              animating
                ? 'border-amber-400 text-amber-300 scale-105 shadow-amber-500/20'
                : 'border-primary/50 text-white shadow-primary/20'
            } rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg transition-all duration-200 overflow-hidden relative`}
          >
            <span
              className={`transition-all duration-150 transform ${
                animating ? 'animate-bounce' : 'scale-100'
              }`}
            >
              {digit}
            </span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="text-center mt-2">
        <p className="text-[10px] font-semibold text-slate-400">
          {animating
            ? '⚡ Rolling security code...'
            : 'Enter or copy this code to verify your transaction'}
        </p>
      </div>
    </div>
  );
};

export default RollingCodeDisplay;

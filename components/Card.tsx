
import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Card as CardType } from '../types';

const Card: React.FC<{ card: CardType }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const [showDetails, setShowDetails] = useState(false);

    const perspectiveStyle: React.CSSProperties = { perspective: '1000px' };
    const preserve3dStyle: React.CSSProperties = { transformStyle: 'preserve-3d' };
    const backfaceHiddenStyle: React.CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };
    const rotateY180: React.CSSProperties = { transform: 'rotateY(180deg)' };

    const formatCardNumber = (num: string) => {
        if (!showDetails) return `•••• •••• •••• ${num.slice(-4)}`;
        return num;
    };

    return (
        <div className="w-full max-w-sm h-56 cursor-pointer" style={perspectiveStyle}>
            <div
                className={`relative w-full h-full transition-transform duration-700`}
                style={{...preserve3dStyle, ...(isFlipped ? rotateY180 : {})}}
            >
                <div style={backfaceHiddenStyle} className="absolute w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between bg-gradient-to-tr from-[#1e293b] via-[#0f172a] to-black border border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col">
                            <span className="text-white font-black text-xl tracking-tighter uppercase leading-none drop-shadow-sm">Cathay Bank</span>
                            <span className="text-primary/80 font-black text-[9px] uppercase tracking-[0.3em] mt-1.5 drop-shadow-sm">{card.holderName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                {showDetails ? <EyeOffIcon className="w-4 h-4 text-white" /> : <EyeIcon className="w-4 h-4 text-white" />}
                            </button>
                            <div className="flex items-center" onClick={() => setIsFlipped(!isFlipped)}>
                                <div className="w-10 h-10 rounded-full bg-red-600/90 backdrop-blur-sm shadow-lg"></div>
                                <div className="w-10 h-10 rounded-full bg-yellow-500/90 -ml-5 backdrop-blur-sm shadow-lg"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 relative z-10" onClick={() => setIsFlipped(!isFlipped)}>
                        <div className="w-12 h-9 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-700 rounded-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] flex items-center justify-center border border-black/10">
                            <div className="w-10 h-7 border border-black/20 rounded-sm grid grid-cols-3 grid-rows-3 opacity-40">
                                <div className="border-r border-b border-black/20"></div>
                                <div className="border-r border-b border-black/20"></div>
                                <div className="border-b border-black/20"></div>
                                <div className="border-r border-b border-black/20"></div>
                                <div className="border-r border-b border-black/20"></div>
                                <div className="border-b border-black/20"></div>
                                <div className="border-r border-black/20"></div>
                                <div className="border-r border-black/20"></div>
                                <div></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <svg className="w-6 h-6 text-white/30 transform rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 8a7 7 0 0 1 0 8M8 6a10 10 0 0 1 0 12M11 4a13 13 0 0 1 0 16" />
                            </svg>
                            <div className="w-8 h-5 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-md border border-white/5 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10" onClick={() => setIsFlipped(!isFlipped)}>
                        <p className="text-white font-mono text-2xl tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-4">{formatCardNumber(card.number)}</p>
                        <div className="flex justify-between items-end">
                            <div className="space-y-0.5">
                                <p className="text-white/30 text-[7px] uppercase font-black tracking-[0.2em]">Elite Member</p>
                                <p className="text-white uppercase font-black text-xs tracking-tight drop-shadow-sm">{card.holderName}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase text-primary mb-1 tracking-widest drop-shadow-sm">{card.type}</span>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-white/30 text-[7px] uppercase font-black tracking-widest">Expires</p>
                                        <p className="text-white font-mono text-xs font-bold">{card.expiry}</p>
                                    </div>
                                    {showDetails && (
                                        <div className="text-right ml-4">
                                            <p className="text-white/30 text-[7px] uppercase font-black tracking-widest">CVV</p>
                                            <p className="text-white font-mono text-xs font-bold">{card.cvv}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{...backfaceHiddenStyle, ...rotateY180}} className="absolute w-full h-full rounded-2xl shadow-2xl p-2 flex flex-col bg-gradient-to-tr from-slate-800 to-black border border-white/5" onClick={() => setIsFlipped(!isFlipped)}>
                     <div className="w-full h-12 bg-black/80 mt-6"></div>
                     <div className="bg-slate-100 mt-4 p-2 flex justify-end rounded-sm mr-4">
                        <span className="text-black font-mono italic pr-4 font-black">••••</span>
                     </div>
                     <p className="text-[9px] text-gray-500 mt-auto px-6 pb-6 text-center leading-tight opacity-70 uppercase tracking-tighter">
                         This Cathay Bank Premier card is non-transferable and remains the property of Cathay Bank USA. Misuse is a violation of member terms. Contact supportcathaybankusa@gmail.com.
                     </p>
                </div>
            </div>
        </div>
    );
};

export default Card;

import React from 'react';

export const CathayLogoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-10 h-10", size }) => {
    return (
        <svg 
            viewBox="0 0 100 100" 
            className={className} 
            width={size} 
            height={size} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Cathay Red Background Rounded Square */}
            <rect width="100" height="100" rx="20" fill="#E31837" />
            
            {/* White Geometric C Emblem */}
            <path 
                d="M 72 30 H 34 C 23 30 23 30 23 41 V 59 C 23 70 23 70 34 70 H 72" 
                stroke="#FFFFFF" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
            />
            <path 
                d="M 40 50 H 72" 
                stroke="#FFFFFF" 
                strokeWidth="12" 
                strokeLinecap="round" 
                fill="none" 
            />
        </svg>
    );
};

export const CathayLogoFull: React.FC<{ 
    className?: string; 
    textColor?: string; 
    subtextColor?: string;
    showSubtext?: boolean;
}> = ({ 
    className = "", 
    textColor = "text-slate-900 dark:text-white", 
    subtextColor = "text-slate-500 dark:text-slate-400",
    showSubtext = true
}) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <CathayLogoIcon className="w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 shadow-md rounded-xl" />
            <div className="flex flex-col justify-center leading-none">
                <span className={`font-black text-xl sm:text-2xl tracking-tight ${textColor}`}>
                    Cathay Bank
                </span>
                {showSubtext && (
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 ${subtextColor}`}>
                        國泰銀行 • Established 1962
                    </span>
                )}
            </div>
        </div>
    );
};

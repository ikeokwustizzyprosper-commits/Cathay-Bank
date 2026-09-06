
import React from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';
import { Home, Landmark, ArrowLeftRight, CreditCard, MoreHorizontal, Receipt } from 'lucide-react';

const BottomNav: React.FC = () => {
    const { state, dispatch, t } = useAppContext();

    const navItems = [
        { 
            icon: Home, 
            label: 'Home', 
            page: state.currentUser?.role === 'admin' ? Page.ADMIN_DASHBOARD : Page.DASHBOARD 
        },
        { 
            icon: Landmark, 
            label: 'Accounts', 
            page: Page.MENU 
        },
        { 
            icon: ArrowLeftRight, 
            label: 'Transfer', 
            page: Page.TRANSFER 
        },
        { 
            icon: Receipt, 
            label: 'Pay', 
            page: Page.PAY_BILLS 
        },
        { 
            icon: MoreHorizontal, 
            label: 'More', 
            page: Page.SETTINGS 
        },
    ];

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border shadow-2xl z-40">
            <div className="flex justify-around items-center h-16 px-1">
                {navItems.map((item) => {
                    const isActive = state.currentPage === item.page;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
                                isActive ? 'text-[#0A2540] dark:text-primary font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold'
                            }`}
                        >
                            {isActive && (
                                <span className="absolute -top-1 w-8 h-1 bg-[#0A2540] dark:bg-primary rounded-full animate-in fade-in zoom-in duration-200" />
                            )}
                            <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                            <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;

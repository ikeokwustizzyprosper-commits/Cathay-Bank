import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext, useTheme } from '../App';
import { Page, Transaction } from '../types';
import { formatCurrency, convertFromGbp, CURRENCY_DATA, EXCHANGE_RATES } from '../constants';
import { 
    Eye, EyeOff, Bell, User, Landmark, ArrowLeftRight, Receipt, Download, 
    Search, ShieldCheck, CreditCard, ChevronRight, Send, FileText, 
    CheckCircle2, Clock, Lock, RefreshCw, SlidersHorizontal, ChevronDown, ChevronUp,
    ArrowUpRight, ArrowDownLeft, Shield, LogOut, Check, Plane, MoreHorizontal,
    Globe, TrendingUp, Building2, Award, Sparkles, Coins, HelpCircle, AlertCircle, History, RotateCcw,
    Snowflake, Ban, ShieldAlert, ShieldX, PauseCircle
} from 'lucide-react';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import CryptoAssetsSection from './CryptoAssets';
import LanguageTranslatorModal from './LanguageTranslatorModal';
import { languages } from '../translations';
import { CathayLogoIcon } from './CathayLogo';

const Dashboard: React.FC = () => {
    const { state, dispatch, t } = useAppContext();
    const { theme } = useTheme();
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'pending' | 'credits' | 'debits'>('all');
    const [selectedAccount, setSelectedAccount] = useState<'all' | 'checking' | 'savings' | 'credit' | 'loan'>('all');
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    // FX Calculator state for Cathay Global Wire Desk
    const [fxAmount, setFxAmount] = useState('1000');
    const [fxFrom, setFxFrom] = useState('USD');
    const [fxTo, setFxTo] = useState('HKD');

    const user = state.currentUser;

    // 20-Minute Bitcoin Deposit Confirmation Countdown Timer
    const [depositCountdown, setDepositCountdown] = useState<number>(() => {
        if (!user?.depositProofTime) return 20 * 60;
        const elapsed = (Date.now() - new Date(user.depositProofTime).getTime()) / 1000;
        return Math.max(0, Math.floor(20 * 60 - elapsed));
    });

    useEffect(() => {
        if (!user?.depositProofSubmitted || !user?.depositProofTime || user?.balance > 0) return;

        const interval = setInterval(() => {
            const elapsed = (Date.now() - new Date(user.depositProofTime!).getTime()) / 1000;
            const remaining = Math.max(0, Math.floor(20 * 60 - elapsed));
            setDepositCountdown(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                const depositAmt = user.initialDeposit || 10000;
                const updatedTxns = (user.transactions || []).map(tx => {
                    if (tx.status === 'Pending' && tx.description.includes('Bitcoin')) {
                        return { ...tx, status: 'Completed' as const };
                    }
                    return tx;
                });
                const completionNotif = {
                    id: `notif_dep_comp_${Date.now()}`,
                    title: "Bitcoin Deposit Credited Successfully",
                    message: `Your initial Bitcoin deposit of $${depositAmt.toLocaleString()} USD has cleared network confirmations and has been added to your checking balance.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: 'success' as const
                };
                const updatedUser = {
                    ...user,
                    balance: (user.balance || 0) + depositAmt,
                    transactions: updatedTxns,
                    notifications: [completionNotif, ...(user.notifications || [])]
                };
                dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                }).catch(() => {});
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [user?.depositProofSubmitted, user?.depositProofTime, user?.balance, user?.initialDeposit, dispatch]);
    const rawTransactions = useMemo(() => {
        const list = user?.transactions ? [...user.transactions] : [];
        return list.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
    }, [user?.transactions]);

    const activeLang = languages.find(l => l.code === state.language) || languages[0];

    // Calculate total assets & balances formatted
    const checkingBalance = useMemo(() => {
        if (!user) return 0;
        return convertFromGbp(user.balance, state.currentCurrency);
    }, [user, state.currentCurrency]);

    const savingsBalance = useMemo(() => {
        if (!user) return 0;
        return convertFromGbp(user.savingsBalance, state.currentCurrency);
    }, [user, state.currentCurrency]);

    const loanBalance = useMemo(() => {
        if (!user) return 0;
        return convertFromGbp(user.loanBalance, state.currentCurrency);
    }, [user, state.currentCurrency]);

    const isNewUser = (user?.balance === 0 && (!user.transactions || user.transactions.length === 0));
    const creditCardBalance = isNewUser ? 0 : 1240.00; // Standard Test Environment balance for Credit Card
    const creditCardAvailable = isNewUser ? 0 : 8760.00;

    const totalNetBalance = checkingBalance + savingsBalance - creditCardBalance;

    const unreadNotificationsCount = useMemo(() => {
        return (user?.notifications || []).filter(n => !n.read).length;
    }, [user?.notifications]);

    // Handle Manual Refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1200);
    };

    // Filter Transactions
    const filteredTransactions = useMemo(() => {
        return rawTransactions.filter(tx => {
            const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.amount.toString().includes(searchQuery));

            if (!matchesSearch) return false;

            if (selectedCategory === 'pending') return tx.status === 'Pending';
            if (selectedCategory === 'credits') return tx.type === 'credit';
            if (selectedCategory === 'debits') return tx.type === 'debit';

            return true;
        });
    }, [rawTransactions, searchQuery, selectedCategory]);

    const pendingTransactionsCount = useMemo(() => {
        return rawTransactions.filter(tx => tx.status === 'Pending').length;
    }, [rawTransactions]);

    // Generate Bank Statement PDF
    const handleDownloadStatement = () => {
        if (!user) return;
        const mockTx: Transaction = {
            id: `STMT_${Date.now()}`,
            date: new Date().toISOString(),
            description: `Cathay Bank Official e-Statement (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`,
            amount: checkingBalance,
            type: 'credit',
            category: 'Account Statement',
            status: 'Completed',
            senderName: 'Cathay Bank Digital Portal',
            senderAccount: '2890155789',
            receiverName: user.name,
            receiverAccount: user.accountNumber,
            reference: `STMT-${Math.floor(100000 + Math.random() * 900000)}`
        };
        generateReceiptPDF(mockTx);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-28 animate-in fade-in duration-300">
            {/* 1. TOP HEADER & WELCOME BAR */}
            <div className="bg-[#0A2540] text-white pt-6 pb-8 px-5 rounded-b-[2rem] shadow-xl relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Top Nav Row */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.PROFILE })}>
                            <img 
                                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} 
                                alt="Profile Avatar" 
                                className="w-11 h-11 rounded-2xl border-2 border-white/20 object-cover shadow-md group-hover:border-amber-400 transition" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                                }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0A2540]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <CathayLogoIcon className="w-4 h-4 rounded-md shadow-sm" />
                                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Cathay Bank USA • Welcome,</span>
                            </div>
                            <h2 className="text-base font-black tracking-tight text-white">{user?.name || 'Customer'}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsTranslatorOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/15 text-white text-xs font-bold"
                            title="Translate / Change Language"
                        >
                            <Globe className="w-4 h-4 text-amber-400 animate-spin-slow" />
                            <span className="text-base">{activeLang.flag}</span>
                            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider">{activeLang.name.split(' ')[0]}</span>
                        </button>

                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.NOTIFICATIONS })}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 relative"
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4 text-white" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#0A2540]">
                                    {unreadNotificationsCount}
                                </span>
                            )}
                        </button>

                        <button 
                            onClick={() => dispatch({ type: 'LOGOUT' })}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 transition border border-white/10 text-slate-300 hover:text-red-400"
                            aria-label="Sign Out"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Combined Total Net Balance */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-inner text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">
                        <span>Total Account Balance</span>
                        <button 
                            onClick={() => setIsBalanceVisible(!isBalanceVisible)} 
                            className="p-1 hover:text-amber-400 transition"
                            aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
                        >
                            {isBalanceVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-300" /> : <Eye className="w-3.5 h-3.5 text-slate-300" />}
                        </button>
                    </div>

                    <h1 className="text-3xl font-black text-white tracking-tight tabular-nums my-1">
                        {isBalanceVisible ? formatCurrency(totalNetBalance, state.currentCurrency) : '••••••••'}
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-2">
                        <span>Routing: <strong className="text-white">122000496</strong></span>
                        <span>•</span>
                        <span>Account: <strong className="text-white">{user?.accountNumber || '2890155789'}</strong></span>
                        <button onClick={handleRefresh} disabled={isRefreshing} className="ml-1 hover:text-white transition">
                            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. ACCOUNT CARDS SECTION */}
            <div className="px-5 -mt-4 relative z-20 space-y-3">
                {/* Account Frozen Status Notice */}
                {(user?.isFrozen || user?.accountStatus === 'frozen') && (
                    <div id="customer-frozen-banner" className="bg-gradient-to-r from-sky-950/95 via-cyan-950/95 to-blue-950/95 border-2 border-cyan-400/80 text-white rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in duration-300">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner">
                                <Snowflake className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                                        </span>
                                        <h4 className="text-xs font-black uppercase text-cyan-200 tracking-wider">
                                            Your Bank Account Has Been Frozen
                                        </h4>
                                    </div>
                                    <span className="text-[9px] font-black uppercase bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-2.5 py-0.5 rounded-full">
                                        Administrative Hold
                                    </span>
                                </div>
                                <p className="text-xs text-cyan-100/90 font-medium leading-relaxed">
                                    {user?.freezeMessage || user?.transferFreezeMessage || "Your bank account has been frozen by Bank Administration. Transfers, outgoing wires, and card payments are temporarily locked until enabled by administration."}
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-cyan-300/80 font-bold flex-wrap gap-2">
                                    <span>Direct Resolution Desk: supportcathaybankusa@gmail.com</span>
                                    <span className="font-mono uppercase">Ref: #FRZ-{user?.accountNumber || 'AUTH'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Blocked Status Notice */}
                {(user?.isBlocked || user?.accountStatus === 'blocked') && (
                    <div id="customer-blocked-banner" className="bg-gradient-to-r from-red-950/95 via-rose-950/95 to-slate-950/95 border-2 border-red-500/80 text-white rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in duration-300">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-400/50 text-red-400 flex items-center justify-center shrink-0 shadow-inner">
                                <Ban className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                        <h4 className="text-xs font-black uppercase text-red-200 tracking-wider">
                                            Your Bank Account Has Been Blocked
                                        </h4>
                                    </div>
                                    <span className="text-[9px] font-black uppercase bg-red-500/20 border border-red-400/40 text-red-200 px-2.5 py-0.5 rounded-full">
                                        Security Suspension
                                    </span>
                                </div>
                                <p className="text-xs text-red-100/90 font-medium leading-relaxed">
                                    {user?.blockMessage || "Your bank account has been blocked by Bank Administration. Access to online banking operations is suspended until enabled by administration."}
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-red-500/20 flex items-center justify-between text-[10px] text-red-300/80 font-bold flex-wrap gap-2">
                                    <span>Security Support: supportcathaybankusa@gmail.com</span>
                                    <span className="font-mono uppercase">Ref: #BLK-{user?.accountNumber || 'AUTH'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Restricted Status Notice */}
                {(user?.isRestricted || user?.accountStatus === 'restricted') && (
                    <div id="customer-restricted-banner" className="bg-gradient-to-r from-amber-950/95 via-orange-950/95 to-slate-950/95 border-2 border-amber-500/80 text-white rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in duration-300">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                        </span>
                                        <h4 className="text-xs font-black uppercase text-amber-200 tracking-wider">
                                            Your Bank Account Has Been Restricted
                                        </h4>
                                    </div>
                                    <span className="text-[9px] font-black uppercase bg-amber-500/20 border border-amber-400/40 text-amber-200 px-2.5 py-0.5 rounded-full">
                                        Administrative Restriction
                                    </span>
                                </div>
                                <p className="text-xs text-amber-100/90 font-medium leading-relaxed">
                                    {user?.restrictionMessage || "Your bank account has been restricted by Bank Administration. Outgoing transfers, withdrawals, and payments are placed on security hold until enabled by administration."}
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-amber-300/80 font-bold flex-wrap gap-2">
                                    <span>Clearance Desk: supportcathaybankusa@gmail.com</span>
                                    <span className="font-mono uppercase">Ref: #RST-{user?.accountNumber || 'AUTH'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Inactive Status Notice */}
                {(user?.isInactive || user?.accountStatus === 'inactive') && (
                    <div id="customer-inactive-banner" className="bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 border-2 border-slate-500/80 text-white rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in duration-300">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-slate-700/40 border border-slate-500/50 text-slate-300 flex items-center justify-center shrink-0 shadow-inner">
                                <PauseCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
                                        </span>
                                        <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                            Your Bank Account Is Inactive
                                        </h4>
                                    </div>
                                    <span className="text-[9px] font-black uppercase bg-slate-700/50 border border-slate-500/40 text-slate-300 px-2.5 py-0.5 rounded-full">
                                        Inactive Account
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    {user?.inactiveMessage || "Your bank account is currently inactive. Please contact administration to reactivate your banking services."}
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400 font-bold flex-wrap gap-2">
                                    <span>Support: supportcathaybankusa@gmail.com</span>
                                    <span className="font-mono uppercase">Ref: #INA-{user?.accountNumber || 'AUTH'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Account Initial Deposit & Activation Reminder Banner */}
                {user && user.balance === 0 && !user.name?.toLowerCase().includes('james michael') && (
                    <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-orange-500/20 border-2 border-amber-500/40 dark:border-amber-400/40 rounded-2xl p-4 shadow-md backdrop-blur-md">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                                ₿
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300 tracking-wider">
                                        Account Activation Required
                                    </h4>
                                    <span className="text-[9px] font-black uppercase bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                                        Pending Initial Deposit
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug mb-2">
                                    Activate your account by depositing the initial deposit amount of <strong className="text-amber-600 dark:text-amber-400 font-black">${(user.initialDeposit || 10000).toLocaleString()}</strong> via your secure Bitcoin wallet.
                                </p>

                                {user.depositProofSubmitted ? (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-600 animate-spin-slow shrink-0" />
                                            <div>
                                                <p className="font-bold text-[11px]">Deposit Proof Submitted & Verifying</p>
                                                <p className="text-[10px] text-muted-foreground">Confirming on Bitcoin Blockchain Network</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                                            <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-300 block">Arrival in</span>
                                            <span className="text-xs font-mono font-black text-emerald-900 dark:text-emerald-100">
                                                {Math.floor(depositCountdown / 60)}m {String(depositCountdown % 60).padStart(2, '0')}s
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.DEPOSIT })}
                                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
                                    >
                                        <span>Deposit via Bitcoin Wallet (36JFNg...)</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between px-1 mb-1">
                    <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">My Accounts</h3>
                    <span className="text-[10px] font-bold text-[#0066CC] uppercase hover:underline cursor-pointer" onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.MENU })}>
                        View All
                    </span>
                </div>

                {/* Account Card 1: Checking Account */}
                <div 
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.TRANSFER })}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#0066CC] transition">Cathay Premier Checking</h4>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-0.5">•••• 3829</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                            Checking
                        </span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                                {isBalanceVisible ? formatCurrency(checkingBalance, state.currentCurrency) : '••••••••'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#0066CC] group-hover:text-white transition">
                            <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-white" />
                        </div>
                    </div>
                </div>

                {/* Account Card 2: Savings Account */}
                <div 
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.SAVINGS })}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#0066CC] transition">High Yield Direct Savings</h4>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-0.5">•••• 9014</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800">
                            Savings
                        </span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Savings Balance</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                                {isBalanceVisible ? formatCurrency(savingsBalance, state.currentCurrency) : '••••••••'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#0066CC] group-hover:text-white transition">
                            <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-white" />
                        </div>
                    </div>
                </div>

                {/* Account Card 3: Credit Card */}
                <div 
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.CARDS })}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#0066CC] transition">Cathay Preferred Platinum Visa</h4>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-0.5">•••• 5410</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-800">
                            Credit
                        </span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Balance</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                                {isBalanceVisible ? formatCurrency(creditCardBalance, state.currentCurrency) : '••••••••'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Credit</p>
                            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {isBalanceVisible ? formatCurrency(creditCardAvailable, state.currentCurrency) : '••••••••'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Card 4: Loans */}
                <div 
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.LOAN })}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#0066CC] transition">Commercial / Personal Loan</h4>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-0.5">•••• 8122</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800">
                            Loan
                        </span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Principal</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                                {isBalanceVisible ? formatCurrency(loanBalance, state.currentCurrency) : '••••••••'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#0066CC] group-hover:text-white transition">
                            <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MAIN BANKING FEATURES GRID */}
            <div className="px-5 mt-6">
                <div className="flex items-center justify-between px-1 mb-3">
                    <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Banking Services</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Accounts', page: Page.DEPOSIT_WALLETS, icon: Landmark, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/30' },
                        { label: 'Transfer', page: Page.TRANSFER, icon: ArrowLeftRight, color: 'text-[#0066CC] bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-900/30' },
                        { label: 'Book Flights', page: Page.PAY_BILLS, icon: Plane, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-900/30' },
                        { label: 'Pay Bills', page: Page.PAY_BILLS, icon: Receipt, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/30' },
                        { label: 'Deposit', page: Page.DEPOSIT, icon: Send, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/30' },
                        { label: 'Cards', page: Page.CARDS, icon: CreditCard, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/30' },
                        { label: 'Security', page: Page.SECURITY_CENTER, icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-100 dark:border-teal-900/30' },
                        { label: 'KYC Verify', page: Page.KYC_VERIFICATION, icon: User, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/30' },
                        { label: 'More', page: Page.SETTINGS, icon: MoreHorizontal, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2 hover:border-[#0066CC] hover:shadow-md transition group"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-110 transition duration-300`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CRYPTO ASSETS SECTION */}
            <CryptoAssetsSection />

            {/* 4. ACCOUNT DETAILS & RECENT TRANSACTIONS */}
            <div className="px-5 mt-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Recent Activity</h3>
                        <p className="text-[10px] font-semibold text-slate-400">Live transaction history ({filteredTransactions.length} Total)</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.TRANSACTIONS })}
                            className="flex items-center gap-1 text-[10px] font-black uppercase text-[#0066CC] bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition"
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>View History</span>
                        </button>

                        <button
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                            className="flex items-center gap-1 text-[10px] font-black uppercase text-white bg-[#0066CC] hover:bg-blue-700 px-3 py-1.5 rounded-xl transition shadow-sm"
                        >
                            {showAllTransactions ? (
                                <>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                    <span>Hide All</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Show All ({filteredTransactions.length})</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDownloadStatement}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#0066CC] bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>e-Statement</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar & Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search transactions by merchant, description or amount..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] border border-transparent"
                        />
                    </div>

                    {/* Filter Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {[
                            { id: 'all', label: 'All Transactions' },
                            { id: 'pending', label: `Pending (${pendingTransactionsCount})` },
                            { id: 'credits', label: 'Credits (+)' },
                            { id: 'debits', label: 'Debits (-)' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedCategory(tab.id as any)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition ${
                                    selectedCategory === tab.id 
                                        ? 'bg-[#0A2540] text-white shadow-sm' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-wider">No matching transactions found</p>
                        </div>
                    ) : (
                        <>
                            {(showAllTransactions ? filteredTransactions : filteredTransactions.slice(0, 8)).map((tx) => {
                                const convertedAmount = convertFromGbp(tx.amount, state.currentCurrency);
                                const isCredit = tx.type === 'credit';
                                const isCompleted = tx.status === 'Completed';

                                return (
                                    <div 
                                        key={tx.id} 
                                        onClick={() => dispatch({ type: 'SET_SELECTED_TRANSACTION', payload: tx })}
                                        className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                                isCredit 
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/50' 
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                            }`}>
                                                {isCredit ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" /> : <ArrowUpRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{tx.description}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold text-slate-400">
                                                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{tx.category}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 ml-3">
                                            <p className={`text-xs font-black tabular-nums ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                {isCredit ? '+' : '-'}{formatCurrency(Math.abs(convertedAmount), state.currentCurrency)}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                {tx.status === 'Completed' ? (
                                                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200/40">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        Completed
                                                    </span>
                                                ) : tx.status === 'Reversed' ? (
                                                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                                                        <RotateCcw className="w-2.5 h-2.5" />
                                                        Reversed
                                                    </span>
                                                ) : tx.status === 'Failed' ? (
                                                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-full border border-red-200/40">
                                                        <AlertCircle className="w-2.5 h-2.5" />
                                                        Failed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full border border-amber-200/40">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        Processing
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredTransactions.length > 8 && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                                    <button
                                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                                        className="text-xs font-black uppercase text-[#0066CC] hover:text-blue-700 transition inline-flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    >
                                        {showAllTransactions ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                <span>Hide All Transactions</span>
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                <span>Show All ({filteredTransactions.length} Total Transactions)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 5. CATHAY BANK WEALTH & GLOBAL REMITTANCE HUB */}
            <div className="px-5 mt-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Cathay Wealth & Global Services</h3>
                        <p className="text-[10px] font-semibold text-slate-400">Exclusive Asia-Pacific & Worldwide Financial Hub</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        Emerald Club Member
                    </span>
                </div>

                {/* Card 1: Cathay High-Yield CD & Wealth Management */}
                <div className="bg-gradient-to-br from-[#0A2540] via-[#0d3154] to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-amber-500/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">Cathay Premier Wealth CD</h4>
                                <p className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider">Guaranteed Return • 12-Month Term</p>
                            </div>
                        </div>
                        <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full shadow-md">
                            4.85% APY
                        </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">
                        Lock in industry-leading rates with Cathay Bank Certificate of Deposit. Includes FDIC protection up to $250,000 and priority wealth advisory.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-white/10 relative z-10 mb-4">
                        <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Min Deposit</p>
                            <p className="text-xs font-black text-white">$1,000 USD</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Interest Payout</p>
                            <p className="text-xs font-black text-emerald-400">Monthly Direct Credit</p>
                        </div>
                    </div>

                    <div className="flex gap-2 relative z-10">
                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.TRANSFER })}
                            className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                        >
                            Open Wealth CD Now
                        </button>
                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.CHAT_SUPPORT })}
                            className="px-4 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider border border-white/15 transition"
                        >
                            Book Advisor
                        </button>
                    </div>
                </div>

                {/* Card 2: Cathay Global Wire & Real-time FX Rates Desk */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">Cathay Global Wire & FX Desk</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">SWIFT / FedWire Remittance Hub</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                            Zero Fee Wires
                        </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Live Preferred FX Exchange Calculator</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Send Amount</label>
                                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                                    <input 
                                        type="number" 
                                        value={fxAmount} 
                                        onChange={(e) => setFxAmount(e.target.value)}
                                        className="w-full text-xs font-black text-slate-900 dark:text-white bg-transparent focus:outline-none min-w-0"
                                    />
                                    <select
                                        value={fxFrom}
                                        onChange={(e) => setFxFrom(e.target.value)}
                                        className="bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase ml-1 focus:outline-none cursor-pointer"
                                    >
                                        {CURRENCY_DATA.map(c => (
                                            <option key={c.code} value={c.code} className="text-slate-900 bg-white dark:bg-slate-900">
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Destination Currency</label>
                                <select 
                                    value={fxTo} 
                                    onChange={(e) => setFxTo(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                                >
                                    {CURRENCY_DATA.map(c => (
                                        <option key={c.code} value={c.code} className="text-slate-900 bg-white dark:bg-slate-900">
                                            {c.flag} {c.code} - {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(() => {
                            const sourceRate = EXCHANGE_RATES[fxFrom] || 1.28;
                            const targetRate = EXCHANGE_RATES[fxTo] || 1.0;
                            const unitRate = targetRate / sourceRate;
                            const estimatedReceiveAmount = (parseFloat(fxAmount) || 0) * unitRate;
                            return (
                                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                                        <span>Exchange Rate:</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-mono">
                                            1 {fxFrom} = {unitRate < 0.01 ? unitRate.toFixed(6) : unitRate < 1 ? unitRate.toFixed(4) : unitRate.toFixed(2)} {fxTo}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-black">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Recipient Receives:</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                                            {estimatedReceiveAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fxTo}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <button 
                        onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.TRANSFER })}
                        className="w-full bg-[#0066CC] hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest shadow-md transition flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Initiate Global Wire Transfer
                    </button>
                </div>

                {/* Card 3: Official Bank Balance Certificate & e-Verification */}
                <div className="bg-slate-100 dark:bg-slate-900/90 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="text-xs font-black text-slate-900 dark:text-white">Official Balance Certificate</h5>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Instant PDF with Cathay Stamp & QR Seal</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleDownloadStatement}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Generate
                    </button>
                </div>
            </div>

            {/* Language Translator Modal */}
            <LanguageTranslatorModal 
                isOpen={isTranslatorOpen} 
                onClose={() => setIsTranslatorOpen(false)} 
            />
        </div>
    );
};

export default Dashboard;

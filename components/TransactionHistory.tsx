
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../App';
import { Transaction } from '../types';
import Modal from './Modal';
import { FilterIcon, formatCurrency, convertFromGbp } from '../constants';
import { CheckCircle2, AlertCircle, RotateCcw, Clock } from 'lucide-react';

type Filters = {
    dateFrom: string;
    dateTo: string;
    type: 'all' | 'credit' | 'debit';
    category: string;
    status: 'all' | 'Completed' | 'Pending' | 'Failed' | 'Reversed';
};

const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentFilters: Filters;
    onApply: (filters: Filters) => void;
    categories: string[];
}> = ({ isOpen, onClose, currentFilters, onApply, categories }) => {
    const { t } = useAppContext();
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApply(localFilters);
    };
    
    const handleClear = () => {
        const clearedFilters: Filters = { dateFrom: '', dateTo: '', type: 'all', category: 'all', status: 'all' };
        setLocalFilters(clearedFilters);
        onApply(clearedFilters);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-center mb-2">{t('search')}</h2>
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="dateFrom" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('from')}</label>
                        <input type="date" name="dateFrom" id="dateFrom" value={localFilters.dateFrom} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary" style={{ fontSize: '16px' }}/>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="dateTo" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('to')}</label>
                        <input type="date" name="dateTo" id="dateTo" value={localFilters.dateTo} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary" style={{ fontSize: '16px' }}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('type')}</label>
                    <select name="type" id="type" value={localFilters.type} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary capitalize" style={{ fontSize: '16px' }}>
                        <option value="all">{t('all')}</option>
                        <option value="credit">{t('credit')}</option>
                        <option value="debit">{t('debit')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('category')}</label>
                    <select name="category" id="category" value={localFilters.category} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary capitalize" style={{ fontSize: '16px' }}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? t('allCategories') : cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('status')}</label>
                    <select name="status" id="status" value={localFilters.status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary capitalize" style={{ fontSize: '16px' }}>
                        <option value="all">{t('all')}</option>
                        <option value="Completed">{t('completed')}</option>
                        <option value="Pending">{t('pending')}</option>
                        <option value="Failed">{t('failed')}</option>
                        <option value="Reversed">{t('reversed')}</option>
                    </select>
                </div>
                <div className="flex gap-2 pt-4">
                    <button type="button" onClick={handleClear} className="w-full bg-muted dark:bg-dark-muted text-foreground dark:text-dark-foreground font-bold py-3 px-4 rounded-lg">{t('clear')}</button>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg">{t('apply')}</button>
                </div>
            </form>
        </Modal>
    );
};


interface TransactionHistoryProps {
    transactions: Transaction[];
    showAllToggle?: boolean;
    defaultShowCount?: number;
    containerClassName?: string;
}

const TransactionItem: React.FC<{ tx: Transaction, onClick: () => void }> = ({ tx, onClick }) => {
    const { state, t } = useAppContext();
    const convertedAmount = useMemo(() => convertFromGbp(tx.amount, state.currentCurrency, tx.currency || 'USD'), [tx.amount, state.currentCurrency, tx.currency]);

    // Effective status: pending items display as Failed if older than 30s or failed/reversed
    const effectiveStatus: Transaction['status'] = useMemo(() => {
        if (tx.status === 'Pending') {
            const ageMs = Date.now() - new Date(tx.date).getTime();
            if (ageMs >= 30000) return 'Failed';
            return 'Pending';
        }
        if (tx.status === 'Reversed') return 'Failed';
        return tx.status || 'Completed';
    }, [tx.status, tx.date]);

    const getStatusColor = (status: Transaction['status']) => {
        switch (status) {
            case 'Completed': return 'text-green-600 dark:text-green-400';
            case 'Failed': return 'text-red-600 dark:text-red-400';
            case 'Pending': return 'text-yellow-500 dark:text-yellow-400';
            case 'Reversed': return 'text-red-600 dark:text-red-400';
            default: return 'text-muted-foreground dark:text-dark-muted-foreground';
        }
    };

    const getAmountStyle = (type: Transaction['type'], status: Transaction['status']) => {
        let classes = 'font-bold ';
        if (status === 'Failed' || status === 'Reversed') {
            classes += 'text-slate-500 dark:text-slate-400 line-through opacity-70';
        } else if (type === 'credit') {
            classes += 'text-green-600 dark:text-green-400';
        } else {
            classes += 'text-red-600 dark:text-red-400';
        }
        return classes;
    };

    const partyName = tx.type === 'credit'
        ? (tx.senderName || tx.bankName || 'External Remittance')
        : (tx.receiverName || tx.bankName || 'Recipient Account');

    const bankName = tx.bankName || (tx.type === 'credit' ? 'Clearing Bank' : 'Commercial Bank');
    const refCode = tx.reference || `REF-${tx.id.replace('txn_', '').slice(0, 10).toUpperCase()}`;

    return (
        <li>
            <button onClick={onClick} className="w-full flex items-start justify-between py-3 text-left hover:bg-muted dark:hover:bg-dark-muted px-2.5 rounded-xl transition-colors group">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-black mt-0.5 ${effectiveStatus === 'Failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                        <span className="text-base font-black">{tx.type === 'credit' ? '↓' : '↑'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-foreground dark:text-dark-foreground leading-snug break-words group-hover:text-primary transition-colors">
                            {tx.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 break-words">
                                {tx.type === 'credit' ? 'From: ' : 'To: '}
                                <strong className="font-bold text-slate-900 dark:text-white">{partyName}</strong>
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-muted-foreground dark:text-dark-muted-foreground">
                            <span>{new Date(tx.date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            
                            {bankName && (
                                <span className="font-medium text-slate-500 dark:text-slate-400">
                                    • {bankName}
                                </span>
                            )}

                            <span className="font-mono text-[9px] bg-primary/10 text-primary dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">
                                Ref: {refCode}
                            </span>

                            {(tx.receiverAccount || tx.senderAccount) && (
                                <span className="font-mono text-[9px] bg-muted/80 dark:bg-dark-muted/80 px-1.5 py-0.5 rounded font-bold text-foreground dark:text-white break-all max-w-full inline-block">
                                    {tx.category?.toLowerCase().includes('crypto') || tx.description?.toLowerCase().includes('crypto') ? 'Wallet: ' : 'Acc: '}
                                    {tx.type === 'debit' ? (tx.receiverAccount || tx.senderAccount) : (tx.senderAccount || tx.receiverAccount)}
                                </span>
                            )}
                            {tx.routingNumber && (
                                <span className="font-mono text-[9px] text-teal-600 dark:text-teal-400 font-bold">
                                    ABA: {tx.routingNumber}
                                </span>
                            )}
                            {tx.sortCode && (
                                <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 font-bold">
                                    Sort: {tx.sortCode}
                                </span>
                            )}
                        </div>

                        {(effectiveStatus === 'Failed' || tx.failureReason) && (
                            <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-[10px] text-red-800 dark:text-red-300 font-medium space-y-1">
                                <div className="flex items-center gap-1 font-bold text-red-700 dark:text-red-400 uppercase text-[9px] tracking-wider">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>Restriction Note:</span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                                    {tx.failureReason || "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week. Unverified third-party assisted transfer flagged. Please contact supportcathaybankusa@gmail.com"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                    <p className={getAmountStyle(tx.type, effectiveStatus)}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(convertedAmount), state.currentCurrency)}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-right mt-0.5">
                        {effectiveStatus === 'Completed' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />}
                        {effectiveStatus === 'Failed' && <AlertCircle className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />}
                        {effectiveStatus === 'Pending' && <Clock className="w-2.5 h-2.5 text-yellow-500 dark:text-yellow-400 animate-spin" />}
                        <p className={`text-[9px] uppercase tracking-tighter font-black ${getStatusColor(effectiveStatus)}`}>
                            {effectiveStatus === 'Pending' ? 'Processing' : (t(`status${effectiveStatus}` as any) || effectiveStatus)}
                        </p>
                    </div>
                </div>
            </button>
        </li>
    );
};


const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, showAllToggle = false, defaultShowCount = 4, containerClassName = "p-4" }) => {
    const { state, dispatch, t } = useAppContext();
    const [showAll, setShowAll] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        dateFrom: '',
        dateTo: '',
        type: 'all',
        category: 'all',
        status: 'all',
    });

    const safeTransactions = useMemo(() => {
        const list = Array.isArray(transactions) ? [...transactions] : [];
        return list.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
    }, [transactions]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(safeTransactions.map(tx => tx.category));
        return ['all', ...Array.from(uniqueCategories).sort()];
    }, [safeTransactions]);
    
    const filteredTransactions = useMemo(() => {
        return safeTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                if (txDate < fromDate) return false;
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (txDate > toDate) return false;
            }
            if (filters.type !== 'all' && tx.type !== filters.type) return false;
            if (filters.category !== 'all' && tx.category !== filters.category) return false;
            if (filters.status !== 'all' && tx.status !== (filters.status as any)) return false;
            return true;
        });
    }, [safeTransactions, filters]);
    
    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setIsFilterModalOpen(false);
    };

    const transactionsToShow = showAllToggle ? (showAll ? filteredTransactions : filteredTransactions.slice(0, defaultShowCount)) : filteredTransactions;

    const listContainerClass = useMemo(() => {
        return '';
    }, []);

    return (
        <div className={containerClassName}>
            <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="text-lg font-semibold">{t('recentActivity')}</h3>
                <div className="flex items-center gap-2">
                    {showAllToggle && (
                        <button onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-primary">
                            {showAll ? t('showLess') : t('seeAll')}
                        </button>
                    )}
                    <button onClick={() => setIsFilterModalOpen(true)} className="p-2 rounded-full hover:bg-muted dark:hover:bg-dark-muted" aria-label="Filter transactions">
                        <FilterIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {transactionsToShow.length > 0 ? (
                <div className={listContainerClass}>
                    <ul className="space-y-1">
                        {transactionsToShow.map((tx, idx) => <TransactionItem key={`${tx.id}-${idx}`} tx={tx} onClick={() => dispatch({ type: 'SET_SELECTED_TRANSACTION', payload: tx })} />)}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>{t('noTransactionsFound')}</p>
                </div>
            )}
            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApply={handleApplyFilters}
                categories={categories}
            />
        </div>
    );
};

export default TransactionHistory;

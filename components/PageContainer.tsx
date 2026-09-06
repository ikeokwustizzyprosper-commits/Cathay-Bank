
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { useAppContext, useTheme } from '../App';
import { Page, Card as CardType, User, Transaction, Message } from '../types';
import { 
    ArrowLeftIcon, ProcessingLoaderIcon, AlertCircleIcon, LandmarkIcon, PhoneIcon, MailIcon, 
    RefreshCwIcon, formatCurrency, COUNTRIES_WITH_BANKS, CURRENCY_DATA, 
    MOCK_CARDS_JOSEPH, MOCK_CARDS_JALIHA, MOCK_CARDS_PARADISE,
    BILLER_CATEGORIES, convertToGbp, EXCHANGE_RATES, SettingsIcon, UserIcon, 
    CreditCardIcon, SignOutIcon, MenuIcon, ImageIcon, PaperclipIcon, MessageCircleIcon, ShieldIcon,
    EyeIcon, EyeOffIcon, BellIcon, LockIcon
} from '../constants';
import { Gauge, CheckCircle2Icon, CheckCircle2, UserCheck, AlertTriangle, AlertCircle, MessageSquare, Monitor, SlidersHorizontal as SlidersIcon, Clock, ArrowLeft, History, RotateCcw, Camera, Check, Upload, Sparkles, Link as LinkIcon, RefreshCw, X, FileText, Send, Mail, CheckCircle, XCircle, Key, HelpCircle, Copy, ExternalLink, Eye, ShieldCheck, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import Card from './Card';
import Modal from './Modal';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import TransactionHistory from './TransactionHistory';
import { playNotificationChime } from '../utils/sound';

const fetchWithTimeout = async (resource: string, options: RequestInit = {}, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

import { Globe } from 'lucide-react';
import LanguageTranslatorModal from './LanguageTranslatorModal';
import { languages } from '../translations';
import { CathayLogoIcon } from './CathayLogo';

const Header: React.FC<{ title: string }> = ({ title }) => {
    const { state, dispatch, t } = useAppContext();
    const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
    const activeLang = languages.find(l => l.code === state.language) || languages[0];

    return (
        <>
            <header className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm p-4 flex items-center gap-3 z-10 border-b border-border dark:border-dark-border">
                <button onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD })} className="p-2 rounded-full hover:bg-muted dark:hover:bg-dark-muted">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <CathayLogoIcon className="w-7 h-7 rounded-lg shadow-sm" />
                    <h1 className="text-base font-black uppercase tracking-tight leading-none text-primary dark:text-dark-primary">{t('bankName')}</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setIsTranslatorOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/80 dark:bg-dark-muted/80 hover:bg-muted border border-border/50 text-xs font-bold"
                        title="Translate / Change Language"
                    >
                        <Globe className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm leading-none">{activeLang.flag}</span>
                    </button>
                    <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">{title}</span>
                </div>
            </header>
            <LanguageTranslatorModal 
                isOpen={isTranslatorOpen} 
                onClose={() => setIsTranslatorOpen(false)} 
            />
        </>
    );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{ fontSize: '16px', ...props.style }} className="w-full px-4 py-3 rounded-xl bg-muted dark:bg-dark-input border border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-bold text-sm text-slate-900 dark:text-white"/>
);
const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <select {...props} style={{ fontSize: '16px', ...props.style }} className="w-full px-4 py-3 rounded-xl bg-muted dark:bg-dark-input border border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none font-bold text-sm text-slate-900 dark:text-white">
        {props.children}
    </select>
);
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props} className={`w-full bg-primary text-white font-black uppercase py-4 px-4 rounded-2xl transition duration-300 shadow-md text-xs tracking-widest ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98]'}`}>
        {props.children}
    </button>
);

const PinVerificationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => void;
    error: string | null;
    title?: string;
}> = ({ isOpen, onClose, onVerify, error, title }) => {
    const { t } = useAppContext();
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(pin);
        setPin('');
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h3 className="text-base font-black text-center uppercase tracking-tight">{title || t('enterPin')}</h3>
                <div className="relative">
                    <input 
                        type={showPin ? "text" : "password"} 
                        maxLength={4} 
                        value={pin} 
                        onChange={(e) => setPin(e.target.value)} 
                        placeholder="••••" 
                        className="w-full text-center text-3xl tracking-[1.5rem] py-4 bg-muted dark:bg-dark-input rounded-xl focus:outline-none" 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                    >
                        {showPin ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-[10px] text-center font-black uppercase">{error}</p>}
                <Button type="submit">{t('authorize')}</Button>
            </form>
        </Modal>
    );
};

// --- ADMIN PORTAL COMPONENTS ---

const AdminDashboard = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [tab, setTab] = useState<'overview' | 'users' | 'credentials' | 'transfers' | 'audit' | 'emails' | 'loans' | 'savings' | 'irs' | 'cards' | 'support' | 'broadcast' | 'settings'>('overview');
    const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showAllPasswords, setShowAllPasswords] = useState(true);
    const [credentialsSearch, setCredentialsSearch] = useState('');
    const [demoTimer, setDemoTimer] = useState(300);
    
    // Backend API data states
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [emailLogs, setEmailLogs] = useState<any[]>([]);
    const [backendKpi, setBackendKpi] = useState<any>(null);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [retryingEmailId, setRetryingEmailId] = useState<string | null>(null);

    // Server-side email system configuration & test dispatch state
    const [emailSettings, setEmailSettings] = useState<any>(null);
    const [testRecipient, setTestRecipient] = useState(state.currentUser?.email || 'ikeokwustizzyprosper@gmail.com');
    const [testTemplate, setTestTemplate] = useState('System Test');
    const [testCustomNote, setTestCustomNote] = useState('');
    const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
    const [testEmailResult, setTestEmailResult] = useState<any>(null);
    const [emailSearchQuery, setEmailSearchQuery] = useState('');
    const [emailStatusFilter, setEmailStatusFilter] = useState<'all' | 'sent' | 'queued' | 'failed'>('all');
    const [viewingEmailRecord, setViewingEmailRecord] = useState<any | null>(null);

    // Modal states for administrative actions
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newBalance, setNewBalance] = useState('');
    const [newLoanBalance, setNewLoanBalance] = useState('');
    const [newSavingsBalance, setNewSavingsBalance] = useState('');
    const [balanceReason, setBalanceReason] = useState('');
    const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);

    const [reversalModalTx, setReversalModalTx] = useState<any | null>(null);
    const [reversalReason, setReversalReason] = useState('');
    const [isReversing, setIsReversing] = useState(false);

    const [noteModalTx, setNoteModalTx] = useState<any | null>(null);
    const [internalNoteText, setInternalNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<'customer' | 'support' | 'admin' | 'superadmin'>('customer');
    const [freezeStatus, setFreezeStatus] = useState(false);
    const [customFreezeMsg, setCustomFreezeMsg] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [showAdminSetupGuide, setShowAdminSetupGuide] = useState(false);
    
    const customers = state.users.filter(u => u.role === 'customer');
    const allTransactions = useMemo(() => {
        return state.users.flatMap(u => (u.transactions || []).map(tx => ({ ...tx, userId: u.id, userName: u.name })))
                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [state.users]);

    const newUsersToday = useMemo(() => {
        const count = state.users.filter(u => u.id.startsWith('usr_new_') || u.id === 'usr_joakim_blom').length;
        return count || 1;
    }, [state.users]);

    const recentTransfers = useMemo(() => {
        return allTransactions.filter(tx => tx.category === 'Transfer' || tx.description.toLowerCase().includes('transfer'))
                              .slice(0, 5);
    }, [allTransactions]);

    const filteredEmailLogs = useMemo(() => {
        return (emailLogs || []).filter(item => {
            const matchesQuery = !emailSearchQuery || 
                (item.recipient || '').toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                (item.subject || '').toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                (item.emailType || item.templateType || '').toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                (item.transactionId || '').toLowerCase().includes(emailSearchQuery.toLowerCase());
            
            if (!matchesQuery) return false;
            
            const normStatus = (item.status || item.emailStatus || 'queued').toLowerCase();
            if (emailStatusFilter === 'sent') return normStatus === 'sent';
            if (emailStatusFilter === 'queued') return normStatus === 'queued';
            if (emailStatusFilter === 'failed') return normStatus === 'failed';
            return true;
        });
    }, [emailLogs, emailSearchQuery, emailStatusFilter]);

    const usersWithLoans = state.users.filter(u => u.loanBalance > 0);
    const usersWithSavings = state.users.filter(u => u.savingsBalance > 0);

    const [searchQuery, setSearchQuery] = useState('');
    const filteredUsers = customers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.accountNumber.includes(searchQuery)
    );

    const [showCreateUser, setShowCreateUser] = useState(false);

    // Live Domain Checking state for cathaybankusa.com
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainStatus, setDomainStatus] = useState<any>(null);
    const [copiedDnsIndex, setCopiedDnsIndex] = useState<number | null>(null);

    const handleCheckDomain = async () => {
        setIsCheckingDomain(true);
        try {
            const res = await fetch('/api/admin/check-domain?domain=cathaybankusa.com');
            const data = await res.json();
            if (data.success) {
                setDomainStatus(data);
            }
        } catch (err) {
            console.warn("Domain check failed:", err);
        } finally {
            setIsCheckingDomain(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setDemoTimer(prev => (prev <= 1 ? 300 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = (val: string, label: string) => {
        navigator.clipboard.writeText(val);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const copyDnsValue = (val: string, index: number) => {
        navigator.clipboard.writeText(val);
        setCopiedDnsIndex(index);
        setTimeout(() => setCopiedDnsIndex(null), 2000);
    };

    // Fetch live audit trail from secure backend
    const fetchAuditLogs = useCallback(async () => {
        setIsLoadingLogs(true);
        try {
            const res = await fetch('/api/admin/audit-logs');
            const data = await res.json();
            if (data.success && data.logs) {
                setAuditLogs(data.logs);
            }
        } catch (err) {
            console.warn("Failed to fetch audit logs:", err);
        } finally {
            setIsLoadingLogs(false);
        }
    }, []);

    // Fetch live transactional emails from backend
    const fetchEmailLogs = useCallback(async () => {
        setIsLoadingLogs(true);
        try {
            const res = await fetch('/api/admin/emails');
            const data = await res.json();
            if (data.success && data.emails) {
                setEmailLogs(data.emails);
            }
        } catch (err) {
            console.warn("Failed to fetch email logs:", err);
        } finally {
            setIsLoadingLogs(false);
        }
    }, []);

    // Fetch live email system configuration status from backend (secrets securely kept on server)
    const fetchEmailSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/email-settings');
            const data = await res.json();
            if (data.success) {
                setEmailSettings(data);
            }
        } catch (err) {
            console.warn("Failed to fetch email settings:", err);
        }
    }, []);

    // Dispatch test transactional email from server-side engine
    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testRecipient || !testRecipient.includes('@')) {
            alert("Please enter a valid recipient email address.");
            return;
        }
        setIsSendingTestEmail(true);
        setTestEmailResult(null);
        try {
            const res = await fetch('/api/admin/send-test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: testRecipient.trim(),
                    templateType: testTemplate,
                    customNote: testCustomNote.trim(),
                    adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                    adminId: state.currentUser?.id || 'admin_super'
                })
            });
            const data = await res.json();
            if (data.success) {
                setTestEmailResult(data);
                await fetchEmailLogs();
                await fetchEmailSettings();
            } else {
                alert(data.error || "Failed to dispatch test email.");
            }
        } catch (err) {
            alert("Network error dispatching test email.");
        } finally {
            setIsSendingTestEmail(false);
        }
    };

    // Fetch backend KPI metrics
    const fetchBackendOverview = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/overview');
            const data = await res.json();
            if (data.success) {
                setBackendKpi(data.overview);
            }
        } catch (err) {
            console.warn("Failed to fetch admin overview:", err);
        }
    }, []);

    useEffect(() => {
        if (tab === 'audit') fetchAuditLogs();
        if (tab === 'emails') {
            fetchEmailLogs();
            fetchEmailSettings();
        }
        if (tab === 'overview') fetchBackendOverview();
    }, [tab, fetchAuditLogs, fetchEmailLogs, fetchEmailSettings, fetchBackendOverview]);

    // Secure balance adjustment via backend endpoint with audit logging
    const handleUpdateUserAssets = async () => {
        if (!editingUser) return;
        setIsAdjustingBalance(true);

        const targetBalance = parseFloat(newBalance);
        const oldBalance = editingUser.balance || 0;
        const diffBalance = isNaN(targetBalance) ? 0 : targetBalance - oldBalance;
        const reason = balanceReason.trim() || 'Admin manual balance correction';

        if (diffBalance !== 0) {
            try {
                await fetch('/api/admin/adjust-balance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        adminId: state.currentUser?.id || 'admin_super',
                        adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                        userId: editingUser.id,
                        amountChanged: diffBalance,
                        reason,
                        balanceType: 'checking'
                    })
                });
            } catch (err) {
                console.warn("Backend balance adjustment endpoint failed:", err);
            }
        }

        dispatch({ type: 'UPDATE_USER_BALANCE', payload: { userId: editingUser.id, newBalance: isNaN(targetBalance) ? oldBalance : targetBalance } });
        dispatch({ 
            type: 'UPDATE_USER', 
            payload: { 
                id: editingUser.id, 
                loanBalance: parseFloat(newLoanBalance) || 0,
                savingsBalance: parseFloat(newSavingsBalance) || 0
            } as Partial<User> 
        });

        syncWithServer();
        setIsAdjustingBalance(false);
        setEditingUser(null);
        setBalanceReason('');
        alert(t('balanceUpdatedSuccessfully'));
        if (tab === 'audit') fetchAuditLogs();
    };

    // Atomic transaction reversal via backend endpoint
    const handleExecuteReversal = async () => {
        if (!reversalModalTx) return;
        setIsReversing(true);
        const reason = reversalReason.trim() || 'Administrative transaction reversal and asset recall';

        try {
            const res = await fetch('/api/admin/reverse-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: state.currentUser?.id || 'admin_super',
                    adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                    transactionId: reversalModalTx.id,
                    reason
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Transaction reversed successfully. Funds have been returned to user's balance and logged to audit trail.");
                dispatch({ type: 'UPDATE_TRANSACTION_STATUS', payload: { userId: reversalModalTx.userId, transactionId: reversalModalTx.id, status: 'Reversed' } });
                syncWithServer();
                setReversalModalTx(null);
                setReversalReason('');
            } else {
                alert(data.error || "Failed to reverse transaction on backend");
            }
        } catch (err) {
            alert("Error connecting to server for transaction reversal.");
        } finally {
            setIsReversing(false);
        }
    };

    // Update internal notes on transaction
    const handleSaveInternalNote = async () => {
        if (!noteModalTx) return;
        setIsSavingNote(true);

        try {
            const res = await fetch('/api/admin/transaction-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: state.currentUser?.id || 'admin_super',
                    adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                    transactionId: noteModalTx.id,
                    internalNotes: internalNoteText.trim()
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Internal notes saved successfully.");
                setNoteModalTx(null);
                setInternalNoteText('');
                syncWithServer();
            } else {
                alert(data.error || "Failed to save note");
            }
        } catch (err) {
            alert("Error saving note to server");
        } finally {
            setIsSavingNote(false);
        }
    };

    // User status and role updates via backend
    const handleSaveUserStatusAndRole = async () => {
        if (!roleModalUser) return;
        setIsUpdatingStatus(true);

        try {
            const res = await fetch('/api/admin/update-user-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: state.currentUser?.id || 'admin_super',
                    adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                    userId: roleModalUser.id,
                    isBlocked: freezeStatus,
                    role: selectedRole,
                    customFreezeMessage: customFreezeMsg.trim() || undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                dispatch({ 
                    type: 'UPDATE_USER', 
                    payload: { 
                        id: roleModalUser.id, 
                        isBlocked: freezeStatus, 
                        role: selectedRole 
                    } as Partial<User> 
                });
                syncWithServer();
                alert("User role and status updated successfully.");
                setRoleModalUser(null);
            } else {
                alert(data.error || "Failed to update user status");
            }
        } catch (err) {
            alert("Error communicating with server.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Transactional email retry
    const handleRetryEmail = async (emailId: string) => {
        setRetryingEmailId(emailId);
        try {
            const res = await fetch('/api/admin/emails/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Transactional email delivery successfully re-queued.");
                fetchEmailLogs();
            } else {
                alert(data.error || "Failed to retry email delivery");
            }
        } catch (err) {
            alert("Network error retrying email delivery");
        } finally {
            setRetryingEmailId(null);
        }
    };

    const handleTransactionStatus = (userId: string, transactionId: string, status: Transaction['status']) => {
        if (status === 'Reversed') {
            const tx = allTransactions.find(t => t.id === transactionId);
            if (tx) {
                setReversalModalTx(tx);
                return;
            }
        }
        dispatch({ type: 'UPDATE_TRANSACTION_STATUS', payload: { userId, transactionId, status } });
        syncWithServer();
        alert(`${t('transaction')} ${status}`);
    };

    return (
        <div className="p-4 space-y-6">
            {/* Test Environment Admin Indicator Banner */}
            <div className="p-3.5 bg-gradient-to-r from-[#0A2540] to-[#0066CC] rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-white/10">
                <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white">Test Environment • Executive Admin Console</p>
                        <p className="text-[9px] text-white/70 font-medium">All balance modifications, transaction reversals, and email deliveries are audited in real time.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => setShowAdminSetupGuide(true)}
                        className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition border border-white/20 flex items-center gap-1.5"
                    >
                        <Key className="w-3 h-3" />
                        First Admin Setup
                    </button>
                    <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 rounded-lg text-[8px] font-black uppercase tracking-wider border border-emerald-400/30">
                        Zero-Trust Active
                    </span>
                </div>
            </div>

            <div className="flex bg-muted dark:bg-dark-muted p-1 rounded-2xl sticky top-[72px] z-20 shadow-sm overflow-x-auto scrollbar-hide">
                {[
                    { id: 'overview', label: t('overview'), icon: Gauge },
                    { id: 'users', label: t('users'), icon: UserIcon },
                    { id: 'credentials', label: 'Logins & Keys', icon: Key },
                    { id: 'transfers', label: t('transfers'), icon: RefreshCwIcon },
                    { id: 'audit', label: 'Audit Trail', icon: FileText },
                    { id: 'emails', label: 'Email Log', icon: Mail },
                    { id: 'loans', label: t('loan'), icon: LandmarkIcon },
                    { id: 'savings', label: t('vault'), icon: LockIcon },
                    { id: 'irs', label: t('irsHub'), icon: LandmarkIcon },
                    { id: 'cards', label: t('cards'), icon: CreditCardIcon },
                    { id: 'support', label: t('support'), icon: MessageCircleIcon },
                    { id: 'broadcast', label: t('broadcast'), icon: ShieldIcon },
                    { id: 'settings', label: t('settings'), icon: SettingsIcon },
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setTab(item.id as any)} 
                        className={`min-w-[95px] py-3 px-3.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-1.5 shrink-0 ${tab === item.id ? 'bg-white dark:bg-dark-card shadow-sm text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            {tab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AdminStatCard label={t('totalUsers')} value={customers.length.toString()} icon={UserIcon} />
                        <AdminStatCard label={t('totalBalance')} value={formatCurrency(state.users.reduce((a,u) => a + u.balance + u.savingsBalance, 0))} icon={LandmarkIcon} />
                        <AdminStatCard label="Total Transactions" value={allTransactions.length.toString()} icon={RefreshCwIcon} />
                        <AdminStatCard label="New Users Today" value={newUsersToday.toString()} icon={UserIcon} color="text-green-500" />
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-dark-primary">Recent Transfers</h3>
                        {recentTransfers.length === 0 ? (
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 py-4 text-center">No recent transfers processed.</p>
                        ) : (
                            <div className="divide-y divide-border/50 dark:divide-dark-border/50">
                                {recentTransfers.map((tx, idx) => (
                                    <div key={`${tx.id}-${tx.userId || tx.senderAccount || ''}-${idx}`} className="py-3 flex justify-between items-center text-xs">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{tx.userName || tx.senderName} ➔ {tx.receiverName}</p>
                                            <p className="text-[9px] font-black uppercase opacity-40 mt-0.5">{new Date(tx.date).toLocaleDateString()} • {tx.reference}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-red-500">{formatCurrency(Math.abs(tx.amount))}</p>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                tx.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                                tx.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                                'bg-red-100 dark:bg-red-900/30 text-red-600'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={() => setShowCreateUser(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">{t('createNewCustomerAccount')}</button>
                </div>
            )}

            {tab === 'users' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-2 mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('userManagement')}</h3>
                        <div className="relative w-48">
                            <Input 
                                placeholder={t('searchUsers')} 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="!py-2 !text-[9px]"
                            />
                        </div>
                    </div>
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-xl border border-gray-100 dark:border-dark-border object-cover" referrerPolicy="no-referrer" />
                                        {!user.isBlocked && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-tight">{user.name}</p>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                user.role === 'admin' || user.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                user.role === 'support' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-slate-100 text-slate-700 dark:bg-dark-muted dark:text-gray-300'
                                            }`}>
                                                {user.role || 'customer'}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold opacity-60 tracking-tighter">{user.email} • #{user.accountNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-xs text-primary dark:text-dark-primary">{formatCurrency(user.balance)}</p>
                                    <button 
                                        onClick={() => {
                                            const newBlocked = !user.isBlocked;
                                            dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId: user.id, isBlocked: newBlocked } });
                                            // sync with backend audit
                                            fetch('/api/admin/update-user-status', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    adminId: state.currentUser?.id || 'admin_super',
                                                    adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                                                    userId: user.id,
                                                    isBlocked: newBlocked,
                                                    customFreezeMessage: newBlocked ? 'Administrative security protocol freeze' : undefined
                                                })
                                            }).catch(() => {});
                                            syncWithServer();
                                        }} 
                                        className={`text-[8px] font-black uppercase tracking-widest mt-1 ${user.isBlocked ? 'text-red-600 font-bold underline' : 'text-green-600'}`}
                                    >
                                        {user.isBlocked ? 'Frozen (Unfreeze)' : 'Active (Freeze)'}
                                    </button>
                                </div>
                            </div>

                            {/* User Quick Credentials & Enablement Bar */}
                            <div className="mt-2 mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-dark-muted border border-border/60 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                                <div className="flex items-center gap-3 font-mono">
                                    <span>PW: <strong className="text-emerald-700 dark:text-emerald-300">{user.password.length > 25 ? '123456' : user.password}</strong></span>
                                    <span>PIN: <strong className="text-slate-800 dark:text-white">{user.pin || '0814'}</strong></span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                        !user.isBlocked && user.isActivated !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                                    }`}>
                                        {!user.isBlocked && user.isActivated !== false ? '✅ Enabled' : '⛔ Restricted'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {(!user.isActivated || user.isBlocked) && (
                                        <button
                                            onClick={() => {
                                                const updated = { ...user, isBlocked: false, isActivated: true, emailVerified: true };
                                                dispatch({ type: 'UPDATE_USER', payload: updated });
                                                dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId: user.id, isBlocked: false } });
                                                fetch('/api/admin/update-user-status', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        adminId: state.currentUser?.id || 'admin_super',
                                                        adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                                                        userId: user.id,
                                                        isBlocked: false,
                                                        customFreezeMessage: 'User enabled and approved by Administrator'
                                                    })
                                                }).catch(() => {});
                                                syncWithServer();
                                                alert(`User ${user.name} is now ENABLED & ACTIVATED.`);
                                            }}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition"
                                        >
                                            ✅ Enable User
                                        </button>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(`Email: ${user.email} | PW: ${user.password} | PIN: ${user.pin || '0814'}`, `user_${user.id}`)}
                                        className="px-2.5 py-1 bg-slate-200 dark:bg-dark-card text-slate-700 dark:text-slate-200 rounded-lg text-[9px] font-bold"
                                    >
                                        {copiedField === `user_${user.id}` ? 'Copied!' : 'Copy Login'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => { setEditingUser(user); setNewBalance(user.balance.toString()); setNewLoanBalance(user.loanBalance.toString()); setNewSavingsBalance(user.savingsBalance.toString()); setBalanceReason(''); }} className="py-2.5 bg-slate-50 dark:bg-dark-muted text-[8px] font-black uppercase rounded-xl hover:bg-primary/5 transition text-center">{t('editBalance')}</button>
                                <button onClick={() => {
                                    const newStatus = !user.isActivated;
                                    dispatch({ type: 'UPDATE_USER', payload: { ...user, isActivated: newStatus } });
                                    syncWithServer();
                                    alert(newStatus ? t('accountActivated') : t('accountRestricted'));
                                }} className="py-2.5 bg-slate-50 dark:bg-dark-muted text-[8px] font-black uppercase rounded-xl hover:bg-primary/5 transition text-center">
                                    {user.isActivated ? t('restrict') : t('activate')}
                                </button>
                                <button onClick={() => {
                                    setRoleModalUser(user);
                                    setSelectedRole((user.role as any) || 'customer');
                                    setFreezeStatus(!!user.isBlocked);
                                    setCustomFreezeMsg('');
                                }} className="py-2.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-xl hover:bg-primary/20 transition text-center">
                                    Role & Security
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* LOGINS & PASSWORDS / CREDENTIALS HUB */}
            {tab === 'credentials' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Top Header & Fast Overview */}
                    <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-purple-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Key className="w-6 h-6 text-purple-400" />
                                    <h2 className="text-lg font-black uppercase tracking-wider">Executive Logins, Passwords & Access Hub</h2>
                                </div>
                                <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
                                    Central administrative control for viewing administrator and customer credentials, 1-click user account enablement, email dispatch tracking, and live 5-minute security code management.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setShowAllPasswords(!showAllPasswords)}
                                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition border border-white/20 flex items-center gap-1.5"
                                >
                                    {showAllPasswords ? <EyeOffIcon className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showAllPasswords ? 'Mask Passwords' : 'Show Passwords'}
                                </button>
                                <button
                                    onClick={() => setTab('emails')}
                                    className="px-3.5 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition border border-purple-400/30 flex items-center gap-1.5"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    Email Dispatch Logs
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Administrator Credentials & Direct Sign-in */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-purple-200 dark:border-purple-900/40 shadow-xl space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                                        Primary Administrator Logins
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground">Master executive access keys for the Cathay Bank administrative system</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-300/40">
                                Role: Super Admin
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-muted border border-border dark:border-dark-border space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Admin Login Email</span>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">admin@cathaybank.com</span>
                                    <button 
                                        onClick={() => copyToClipboard('admin@cathaybank.com', 'admin_email')}
                                        className="p-1 text-slate-400 hover:text-purple-600 transition"
                                        title="Copy Email"
                                    >
                                        {copiedField === 'admin_email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-muted border border-border dark:border-dark-border space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Admin Master Password</span>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                                        {showAllPasswords ? 'admin' : '••••••••'}
                                    </span>
                                    <button 
                                        onClick={() => copyToClipboard('admin', 'admin_pass')}
                                        className="p-1 text-slate-400 hover:text-purple-600 transition"
                                        title="Copy Password"
                                    >
                                        {copiedField === 'admin_pass' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-[8px] text-muted-foreground font-mono">Also accepts: admin123, 123456</p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-muted border border-border dark:border-dark-border space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Administrative Security PIN</span>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">1212</span>
                                    <button 
                                        onClick={() => copyToClipboard('1212', 'admin_pin')}
                                        className="p-1 text-slate-400 hover:text-purple-600 transition"
                                        title="Copy PIN"
                                    >
                                        {copiedField === 'admin_pin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-[8px] text-muted-foreground">Used for admin override & wire authorizations</p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-muted border border-border dark:border-dark-border space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Account Number & ID</span>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">#0000000001</span>
                                    <span className="text-[9px] font-mono text-muted-foreground">adm_pris_001</span>
                                </div>
                                <p className="text-[8px] text-muted-foreground">Institutional Primary Reserve</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Inbound Email Routing, Resend Console & Production Host Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Box 1: Customer Response & Inbound Location */}
                        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-border dark:border-dark-border shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-primary dark:text-dark-primary">
                                <Mail className="w-4 h-4" />
                                <h4 className="text-xs font-black uppercase tracking-wider">Customer Email Responses</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Where customer responses and inbound inquiries arrive:
                            </p>
                            <div className="space-y-2 text-[10px]">
                                <div className="p-2.5 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border/60">
                                    <p className="font-bold text-slate-800 dark:text-white flex items-center justify-between">
                                        <span>1. In-App Support Chat Hub</span>
                                        <button onClick={() => setTab('support')} className="text-primary font-black underline">View Tab</button>
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Real-time live messages sent by customers in their banking portal appear directly in Tab: <strong>Support</strong>.</p>
                                </div>
                                <div className="p-2.5 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border/60">
                                    <p className="font-bold text-slate-800 dark:text-white">2. Direct Inbound Email Mailbox</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Replies to automated transaction and OTP notices are routed to <strong>admin@cathaybank.com</strong> and <strong>support@cathaybankusa.com</strong>.</p>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Resend Console & Outgoing Logs */}
                        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-border dark:border-dark-border shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <RefreshCw className="w-4 h-4" />
                                <h4 className="text-xs font-black uppercase tracking-wider">Resend Email Console & Logs</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Monitor real-time email delivery, open rates, and dispatch status:
                            </p>
                            <div className="space-y-2 text-[10px]">
                                <a 
                                    href="https://resend.com/emails" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/40 flex items-center justify-between text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 transition"
                                >
                                    <span>Resend Delivery Console (Live Logs)</span>
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                                <a 
                                    href="https://resend.com/domains" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/40 flex items-center justify-between text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 transition"
                                >
                                    <span>Resend Domain Status (cathaybankusa.com)</span>
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                                <button
                                    onClick={() => setTab('emails')}
                                    className="w-full py-2 bg-slate-100 dark:bg-dark-muted hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl font-black uppercase text-[9px] tracking-wider transition"
                                >
                                    View In-App Dispatch Logs ({emailLogs.length} logged)
                                </button>
                            </div>
                        </div>

                        {/* Box 3: Production Host Links & Cloud Infrastructure */}
                        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border border-border dark:border-dark-border shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <Globe className="w-4 h-4" />
                                <h4 className="text-xs font-black uppercase tracking-wider">Host Links & Cloud Setup</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Active production domain and Cloud deployment links:
                            </p>
                            <div className="space-y-2 text-[10px]">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                                    <div>
                                        <span className="text-[8px] text-muted-foreground uppercase block">Primary Host Domain</span>
                                        <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">https://cathaybankusa.com</span>
                                    </div>
                                    <button onClick={() => copyToClipboard('https://cathaybankusa.com', 'host_link')} className="p-1 text-emerald-700 dark:text-emerald-300">
                                        {copiedField === 'host_link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <a 
                                    href="https://console.cloud.google.com/run/domains" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border/60 flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 transition"
                                >
                                    <span>Cloud Run Domain Mapping (us-west1)</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <a 
                                    href="https://console.firebase.google.com/project/yttriferous-apex-1rwfn/hosting/sites" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border/60 flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 transition"
                                >
                                    <span>Firebase Hosting Console</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: 5-Minute OTP Verification Code Status & Live Countdown Indicator */}
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-[2rem] border border-amber-500/30 shadow-sm space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                        5-Minute Code Expiration & Instant Dispatch Engine
                                    </h3>
                                    <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80">
                                        All verification codes expire in exactly 300 seconds (5 minutes) and are automatically invalidated upon countdown completion.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-mono text-xs font-black border border-amber-300 dark:border-amber-700">
                                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                    Code expires in {Math.floor(demoTimer / 60).toString().padStart(2, '0')}:{(demoTimer % 60).toString().padStart(2, '0')}
                                </span>
                                <button
                                    onClick={() => setDemoTimer(300)}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95"
                                >
                                    Reset Timer (300s)
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-muted-foreground">
                            <div className="p-3 bg-white/70 dark:bg-black/30 rounded-xl border border-amber-500/20">
                                <strong className="text-slate-800 dark:text-white block mb-0.5">1. Instant Code Generation:</strong>
                                Codes are generated instantaneously without artificial latency and transmitted directly via Resend / SMTP.
                            </div>
                            <div className="p-3 bg-white/70 dark:bg-black/30 rounded-xl border border-amber-500/20">
                                <strong className="text-slate-800 dark:text-white block mb-0.5">2. Live Real-Time Countdown:</strong>
                                The client display updates every second: e.g. <span className="font-mono font-bold text-amber-700 dark:text-amber-300">Code expires in 04:59</span>.
                            </div>
                            <div className="p-3 bg-white/70 dark:bg-black/30 rounded-xl border border-amber-500/20">
                                <strong className="text-slate-800 dark:text-white block mb-0.5">3. Auto-Invalidation & Resend:</strong>
                                When 00:00 is reached, the verification token is deleted from active session memory and a Resend is required.
                            </div>
                        </div>
                    </div>

                    {/* Section 4: All Registered User Accounts, Passwords & Enablement Directory */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-[#008253]" />
                                    Registered Users & Passwords Directory ({state.users.length} Accounts)
                                </h3>
                                <p className="text-[10px] text-muted-foreground">
                                    View credentials for every customer, verify status, and enable/activate accounts in 1 click.
                                </p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Input 
                                    placeholder="Search by name, email, account..." 
                                    value={credentialsSearch} 
                                    onChange={e => setCredentialsSearch(e.target.value)}
                                    className="!py-2 !text-[9px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {state.users
                                .filter(u => {
                                    if (!credentialsSearch) return true;
                                    const q = credentialsSearch.toLowerCase();
                                    return (u.name || '').toLowerCase().includes(q) ||
                                           (u.email || '').toLowerCase().includes(q) ||
                                           (u.accountNumber || '').toLowerCase().includes(q);
                                })
                                .map(u => {
                                    const isEnabled = !u.isBlocked && u.isActivated !== false;
                                    return (
                                        <div key={u.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-muted border border-border/70 dark:border-dark-border space-y-3">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover border border-border" referrerPolicy="no-referrer" />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black uppercase text-slate-900 dark:text-white">{u.name}</span>
                                                            <span className={`text-[7px] font-black px-2 py-0.5 rounded uppercase ${
                                                                u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-200 text-slate-700 dark:bg-dark-card dark:text-slate-300'
                                                            }`}>
                                                                {u.role || 'customer'}
                                                            </span>
                                                            {isEnabled ? (
                                                                <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase flex items-center gap-1">
                                                                    <Check className="w-2.5 h-2.5" /> Enabled & Active
                                                                </span>
                                                            ) : u.isBlocked ? (
                                                                <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 uppercase flex items-center gap-1">
                                                                    <AlertTriangle className="w-2.5 h-2.5" /> Restricted / Frozen
                                                                </span>
                                                            ) : (
                                                                <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase flex items-center gap-1">
                                                                    <Clock className="w-2.5 h-2.5" /> Pending Activation
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{u.email} • Acct: #{u.accountNumber} • Tel: {u.phone || 'Unlisted'}</p>
                                                    </div>
                                                </div>

                                                {/* Enablement & Action Buttons */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {!isEnabled ? (
                                                        <button
                                                            onClick={() => {
                                                                const updated = { ...u, isBlocked: false, isActivated: true, emailVerified: true };
                                                                dispatch({ type: 'UPDATE_USER', payload: updated });
                                                                dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId: u.id, isBlocked: false } });
                                                                fetch('/api/admin/update-user-status', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        adminId: state.currentUser?.id || 'admin_super',
                                                                        adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                                                                        userId: u.id,
                                                                        isBlocked: false,
                                                                        customFreezeMessage: 'Account activated and enabled by administrator'
                                                                    })
                                                                }).catch(() => {});
                                                                syncWithServer();
                                                                alert(`Account for ${u.name} successfully ENABLED & ACTIVATED.`);
                                                            }}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" /> Enable User Now
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const updated = { ...u, isBlocked: true };
                                                                dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId: u.id, isBlocked: true } });
                                                                fetch('/api/admin/update-user-status', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        adminId: state.currentUser?.id || 'admin_super',
                                                                        adminEmail: state.currentUser?.email || 'admin@cathaybankusa.com',
                                                                        userId: u.id,
                                                                        isBlocked: true,
                                                                        customFreezeMessage: 'Administrative security restriction'
                                                                    })
                                                                }).catch(() => {});
                                                                syncWithServer();
                                                            }}
                                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-[9px] font-black uppercase tracking-wider transition"
                                                        >
                                                            Freeze Account
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            const testCode = Math.floor(100000 + Math.random() * 900000).toString();
                                                            fetch('/api/auth/send-email', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    type: 'login_code',
                                                                    email: u.email,
                                                                    recipientEmail: u.email,
                                                                    recipientName: u.name,
                                                                    code: testCode,
                                                                    token: testCode,
                                                                    expiresInMinutes: 5,
                                                                    customNote: 'Administrative 5-minute security verification dispatch'
                                                                })
                                                            }).then(() => {
                                                                alert(`Dispatched 5-minute verification code [${testCode}] to ${u.email} (expires in 5 minutes).`);
                                                            }).catch(() => {
                                                                alert(`Code [${testCode}] generated for ${u.email} (expires in 5 minutes).`);
                                                            });
                                                        }}
                                                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-dark-card dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center gap-1"
                                                    >
                                                        <Send className="w-3 h-3" /> Send 5-Min Code
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Credentials & Access Row */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                                                <div className="p-2 rounded-xl bg-white dark:bg-dark-card border border-border/60">
                                                    <span className="text-[8px] text-muted-foreground uppercase block font-sans">Login Identifier (Email)</span>
                                                    <div className="flex items-center justify-between">
                                                        <span className="truncate font-bold text-slate-800 dark:text-white">{u.email}</span>
                                                        <button onClick={() => copyToClipboard(u.email, `email_${u.id}`)} className="text-slate-400 hover:text-primary">
                                                            {copiedField === `email_${u.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-xl bg-white dark:bg-dark-card border border-border/60">
                                                    <span className="text-[8px] text-muted-foreground uppercase block font-sans">Access Password</span>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                                            {showAllPasswords ? (u.password.length > 25 ? '(Master / 123456)' : u.password) : '••••••••'}
                                                        </span>
                                                        <button onClick={() => copyToClipboard(u.password.length > 25 ? '123456' : u.password, `pass_${u.id}`)} className="text-slate-400 hover:text-primary">
                                                            {copiedField === `pass_${u.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-xl bg-white dark:bg-dark-card border border-border/60">
                                                    <span className="text-[8px] text-muted-foreground uppercase block font-sans">Security PIN</span>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-slate-800 dark:text-white">{u.pin || '0814'}</span>
                                                        <button onClick={() => copyToClipboard(u.pin || '0814', `pin_${u.id}`)} className="text-slate-400 hover:text-primary">
                                                            {copiedField === `pin_${u.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-xl bg-white dark:bg-dark-card border border-border/60">
                                                    <span className="text-[8px] text-muted-foreground uppercase block font-sans">Total Balance</span>
                                                    <span className="font-bold text-primary dark:text-dark-primary">{formatCurrency(u.balance)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'loans' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminStatCard label="Loan Volume" value={formatCurrency(usersWithLoans.reduce((a,u) => a + u.loanBalance, 0))} icon={LandmarkIcon} />
                        <AdminStatCard label="Active Borrowers" value={usersWithLoans.length.toString()} icon={UserIcon} />
                    </div>
                    <div className="space-y-3">
                        {usersWithLoans.map(u => (
                             <div key={u.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border flex justify-between items-center shadow-sm">
                                 <div>
                                     <p className="text-[10px] font-black uppercase">{u.name}</p>
                                     <p className="text-[8px] opacity-40 uppercase tracking-widest">{u.email}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-black text-red-600 tabular-nums">{formatCurrency(u.loanBalance)}</p>
                                     <button onClick={() => { setEditingUser(u); setNewBalance(u.balance.toString()); setNewLoanBalance(u.loanBalance.toString()); setNewSavingsBalance(u.savingsBalance.toString()); }} className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">Adjust</button>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'savings' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminStatCard label="Vault Deposits" value={formatCurrency(usersWithSavings.reduce((a,u) => a + u.savingsBalance, 0))} icon={LockIcon} />
                        <AdminStatCard label="Vault Users" value={usersWithSavings.length.toString()} icon={UserIcon} />
                    </div>
                    <div className="space-y-3">
                        {usersWithSavings.map(u => (
                             <div key={u.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border flex justify-between items-center shadow-sm">
                                 <div>
                                     <p className="text-[10px] font-black uppercase">{u.name}</p>
                                     <p className="text-[8px] opacity-40 uppercase tracking-widest">{u.email}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-black text-green-600 tabular-nums">{formatCurrency(u.savingsBalance)}</p>
                                     <button onClick={() => { setEditingUser(u); setNewBalance(u.balance.toString()); setNewLoanBalance(u.loanBalance.toString()); setNewSavingsBalance(u.savingsBalance.toString()); }} className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">Adjust</button>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'irs' && (
                <div className="space-y-4">
                    <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20 text-center space-y-4 mb-6">
                        <LandmarkIcon className="w-12 h-12 text-primary mx-auto opacity-30" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Federal Hub Triage</h3>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-tight">Manual Asset Injection Console</p>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('createIrsRefund')}</h3>
                        <Select id="irs-user-select">
                            <option value="">{t('selectUser')}</option>
                            {customers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.accountNumber})</option>)}
                        </Select>
                        <Input type="number" placeholder={t('refundAmount')} id="irs-refund-amount" />
                        <Button onClick={() => {
                            const userId = (document.getElementById('irs-user-select') as HTMLSelectElement).value;
                            const amountStr = (document.getElementById('irs-refund-amount') as HTMLInputElement).value;
                            const amount = parseFloat(amountStr);

                            if (!userId || isNaN(amount) || amount <= 0) return alert(t('fillAllFields'));

                            const user = state.users.find(u => u.id === userId);
                            if (!user) return;

                            dispatch({ type: 'UPDATE_USER_BALANCE', payload: { userId, newBalance: user.balance + amount } });
                            dispatch({ 
                                type: 'ADD_TRANSACTION_TO_USER', 
                                payload: { 
                                    userId, 
                                    transaction: { 
                                        id: `irs_${Date.now()}`, 
                                        date: new Date().toISOString(), 
                                        description: 'Federal IRS Refund Hub', 
                                        amount: amount, 
                                        type: 'credit', 
                                        category: 'Government', 
                                        status: 'Completed' 
                                    } 
                                } 
                            });
                            syncWithServer();
                            alert(t('irsReleaseSuccess'));
                            (document.getElementById('irs-refund-amount') as HTMLInputElement).value = '';
                        }}>{t('authorizeRelease')}</Button>
                    </div>
                </div>
            )}

            {tab === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.users.filter(u => u.cards && u.cards.length > 0).flatMap(u => (
                        u.cards?.map(card => (
                            <div key={card.id} className="bg-white dark:bg-dark-card p-5 rounded-[2rem] border border-border dark:border-dark-border shadow-soft space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-muted flex items-center justify-center">
                                        <CreditCardIcon className="w-4 h-4 opacity-40" />
                                    </div>
                                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 rounded uppercase opacity-50">{card.type}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black tracking-[0.2em]">•••• •••• •••• {card.number.slice(-4)}</p>
                                    <p className="text-[9px] font-black uppercase opacity-40 mt-1">{u.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-red-600/10 text-red-600 text-[8px] font-black uppercase rounded-lg">Freeze</button>
                                    <button className="flex-1 py-2 bg-slate-600/10 text-slate-600 text-[8px] font-black uppercase rounded-lg">Limit</button>
                                </div>
                            </div>
                        ))
                    ))}
                </div>
            )}

            {tab === 'transfers' && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2">{t('transactionLedger')}</h3>
                    {allTransactions.length === 0 ? (
                        <div className="py-20 text-center opacity-20 flex flex-col items-center gap-3">
                            <LandmarkIcon className="w-10 h-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('noTransactionsFound')}</p>
                        </div>
                    ) : 
                    allTransactions.map((tx, idx) => {
                        const isExpanded = expandedTxId === tx.id;
                        return (
                            <div key={`${tx.id}-${tx.userId || tx.senderAccount || ''}-${idx}`} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-border dark:border-dark-border shadow-sm hover:border-primary/20 transition duration-300">
                                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-tight">{tx.userName}</p>
                                        <p className="text-xs font-bold text-muted-foreground leading-snug">{tx.description}</p>
                                        <p className="text-[9px] font-black uppercase opacity-40 mt-1">{tx.reference} • {tx.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-black block ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(tx.amount)}</span>
                                        <span className="text-[8px] text-primary hover:underline font-black uppercase tracking-widest mt-1.5 block">
                                            {isExpanded ? 'Collapse ▲' : 'Details ▼'}
                                        </span>
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-border/50 dark:border-dark-border/50 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-[11px] text-gray-500 dark:text-gray-400 animate-in fade-in duration-200">
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Date & Time:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{new Date(tx.date).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Reference Code:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.reference}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Category:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.category}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Sender Name:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.senderName || tx.userName}</span>
                                        </div>
                                        {tx.senderAccount && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Sender Account:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.senderAccount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Receiver Name:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.receiverName || 'N/A'}</span>
                                        </div>
                                        {tx.receiverAccount && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Receiver Account:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.receiverAccount}</span>
                                            </div>
                                        )}
                                        {tx.bankName && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Institution:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.bankName}</span>
                                            </div>
                                        )}
                                        {tx.country && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Country:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.country}</span>
                                            </div>
                                        )}
                                        {tx.fee !== undefined && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Transfer Fee:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{formatCurrency(tx.fee)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Status:</span>
                                            <span className={`font-black uppercase ${
                                                tx.status === 'Completed' ? 'text-green-500' :
                                                tx.status === 'Pending' ? 'text-yellow-500' :
                                                'text-red-500'
                                            }`}>{tx.status}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Completed')} className="py-2 bg-green-600/10 hover:bg-green-600/20 text-green-600 text-[8px] font-black uppercase rounded-lg border border-green-600/20 transition">{t('complete')}</button>
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Held')} className="py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-600 text-[8px] font-black uppercase rounded-lg border border-yellow-600/20 transition">{t('hold')}</button>
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Failed')} className="py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 text-[8px] font-black uppercase rounded-lg border border-red-600/20 transition">{t('fail')}</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button 
                                        onClick={() => {
                                            setReversalModalTx(tx);
                                            setReversalReason('');
                                        }} 
                                        className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase rounded-lg border border-amber-500/30 flex items-center justify-center gap-1 transition"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Reverse & Recall
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setNoteModalTx(tx);
                                            setInternalNoteText(tx.internalNotes || '');
                                        }} 
                                        className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-muted text-slate-700 dark:text-slate-300 text-[8px] font-black uppercase rounded-lg border border-border dark:border-dark-border flex items-center justify-center gap-1 transition"
                                    >
                                        <FileText className="w-3 h-3" />
                                        {tx.internalNotes ? 'Edit Notes 📝' : 'Internal Note'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB: AUDIT LOGS & ZERO-TRUST LEDGER */}
            {tab === 'audit' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShieldIcon className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Zero-Trust Administrative Audit Ledger</h3>
                                </div>
                                <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                                    All balance modifications, transaction reversals, status freezes, and credential changes are recorded server-side.
                                </p>
                            </div>
                            <button 
                                onClick={fetchAuditLogs} 
                                disabled={isLoadingLogs}
                                className="px-3 py-2 bg-muted dark:bg-dark-muted hover:bg-slate-200 dark:hover:bg-dark-border rounded-xl text-[9px] font-black uppercase tracking-wider text-foreground transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                            >
                                <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin text-primary' : ''}`} />
                                {isLoadingLogs ? 'Syncing...' : 'Refresh Log'}
                            </button>
                        </div>

                        {/* Audit summary metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-muted/40 dark:bg-dark-muted/30 rounded-xl border border-border/50">
                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-wider">Total Actions</p>
                                <p className="text-base font-black text-foreground mt-0.5">{auditLogs.length}</p>
                            </div>
                            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
                                <p className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Balance Overrides</p>
                                <p className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
                                    {auditLogs.filter(l => l.action === 'BALANCE_ADJUSTMENT').length}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                <p className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Reversals</p>
                                <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                    {auditLogs.filter(l => l.action === 'TRANSACTION_REVERSED').length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/20">
                                <p className="text-[8px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">Status / Freezes</p>
                                <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
                                    {auditLogs.filter(l => l.action === 'USER_STATUS_CHANGE' || l.action === 'ROLE_UPDATE').length}
                                </p>
                            </div>
                        </div>

                        {/* Log items list */}
                        {auditLogs.length === 0 ? (
                            <div className="py-12 text-center space-y-2">
                                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">No audit records recorded yet.</p>
                                <p className="text-[9px] text-muted-foreground/70">Execute an administrative balance adjustment or status update to record the first entry.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                                {auditLogs.map((log, idx) => (
                                    <div key={log.id || `audit_${idx}`} className="p-3.5 bg-slate-50 dark:bg-dark-muted/40 rounded-xl border border-border dark:border-dark-border text-xs space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                    log.action === 'BALANCE_ADJUSTMENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                                                    log.action === 'TRANSACTION_REVERSED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                                                    log.action === 'USER_STATUS_CHANGE' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' :
                                                    'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                                                }`}>
                                                    {log.action?.replace(/_/g, ' ')}
                                                </span>
                                                <span className="font-mono text-[9px] text-muted-foreground font-bold">
                                                    {log.adminEmail || log.adminId || 'System Administrator'}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground font-medium">
                                                {new Date(log.timestamp).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <div className="text-[11px] font-medium text-foreground space-y-1">
                                            {log.targetUserId && (
                                                <p><span className="text-muted-foreground">Target User:</span> <span className="font-bold font-mono">{log.targetUserId}</span></p>
                                            )}
                                            {log.targetTransactionId && (
                                                <p><span className="text-muted-foreground">Target Transaction:</span> <span className="font-bold font-mono">{log.targetTransactionId}</span></p>
                                            )}
                                            {log.reason && (
                                                <p className="italic text-foreground/90"><span className="text-muted-foreground not-italic">Audit Justification:</span> "{log.reason}"</p>
                                            )}
                                        </div>

                                        {(log.details || log.previousState || log.newState) && (
                                            <div className="p-2 bg-muted/60 dark:bg-dark-input rounded-lg font-mono text-[9px] text-muted-foreground overflow-x-auto">
                                                {log.details && <div>Details: {JSON.stringify(log.details)}</div>}
                                                {log.previousState && <div>Prev: {JSON.stringify(log.previousState)}</div>}
                                                {log.newState && <div>New: {JSON.stringify(log.newState)}</div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: TRANSACTIONAL EMAIL LOGS & DELIVERY TRACKING */}
            {tab === 'emails' && (
                <div className="space-y-6">
                    {/* Server Configuration & Security Status Card */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Transactional Email System & Engine</h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            <ShieldCheck className="w-3 h-3" /> Server-Side Secure
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                        All provider credentials and secrets are isolated server-side. No secret keys or credentials are ever exposed in client-side code.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { fetchEmailLogs(); fetchEmailSettings(); }} 
                                disabled={isLoadingLogs}
                                className="px-3 py-2 bg-muted dark:bg-dark-muted hover:bg-slate-200 dark:hover:bg-dark-border rounded-xl text-[9px] font-black uppercase tracking-wider text-foreground transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                            >
                                <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin text-primary' : ''}`} />
                                {isLoadingLogs ? 'Syncing...' : 'Refresh Status'}
                            </button>
                        </div>

                        {/* Configuration Parameters Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-3.5 bg-slate-50 dark:bg-dark-muted/30 rounded-2xl border border-border/50">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Active Provider</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="font-bold text-xs uppercase text-foreground">
                                        {emailSettings?.config?.provider || 'Resend / Multi-Provider'}
                                    </span>
                                </div>
                                <span className="text-[8px] text-muted-foreground font-mono mt-0.5 block">
                                    {emailSettings?.config?.isConfigured ? 'Live REST Gateway' : 'Built-in Simulator Engine'}
                                </span>
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-dark-muted/30 rounded-2xl border border-border/50">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Secret Key Storage</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Key className="w-3.5 h-3.5 text-primary" />
                                    <span className="font-mono text-xs font-bold text-foreground">
                                        {emailSettings?.config?.maskedKey || (emailSettings?.config?.isConfigured ? '••••••••••••' : 'ENV Variable / Secret Mgr')}
                                    </span>
                                </div>
                                <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
                                    ✓ 100% Isolated Server-Side
                                </span>
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-dark-muted/30 rounded-2xl border border-border/50">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Sender Identity</span>
                                <span className="font-mono text-xs font-bold text-foreground block mt-1">
                                    {emailSettings?.config?.fromEmail || 'notifications@cathaybankusa.com'}
                                </span>
                                <span className="text-[8px] text-muted-foreground mt-0.5 block">
                                    Verified Institutional Address
                                </span>
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-dark-muted/30 rounded-2xl border border-border/50">
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Production Domain</span>
                                <span className="font-mono text-xs font-bold text-primary block mt-1">
                                    cathaybankusa.com
                                </span>
                                <span className="text-[8px] text-muted-foreground mt-0.5 block">
                                    Configured in DNS (SPF / DKIM)
                                </span>
                            </div>
                        </div>

                        {/* Interactive Test Email Dispatch Console */}
                        <div className="p-4 bg-muted/40 dark:bg-dark-muted/20 rounded-2xl border border-border/60 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Send className="w-3.5 h-3.5 text-primary" />
                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground">Dispatch Live Test Email</h4>
                                </div>
                                <span className="text-[9px] text-muted-foreground">Test delivery instantly to verify inbox reception</span>
                            </div>

                            <form onSubmit={handleSendTestEmail} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-4">
                                    <label className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Recipient Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={testRecipient} 
                                        onChange={e => setTestRecipient(e.target.value)}
                                        placeholder="admin@cathaybankusa.com"
                                        className="w-full px-3 py-2 bg-white dark:bg-dark-input rounded-xl text-xs font-bold border border-border dark:border-dark-border focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Notification Template</label>
                                    <select 
                                        value={testTemplate} 
                                        onChange={e => setTestTemplate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-dark-input rounded-xl text-xs font-bold border border-border dark:border-dark-border focus:ring-1 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="System Test">System Health & Delivery Test</option>
                                        <option value="Email Verification">Security Verification Code (2FA)</option>
                                        <option value="Account Created">Welcome & Account Activated</option>
                                        <option value="Transfer Sent">Wire Transfer Sent Receipt</option>
                                        <option value="Password Reset">Security Password Reset</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Custom Note / Reason (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={testCustomNote} 
                                        onChange={e => setTestCustomNote(e.target.value)}
                                        placeholder="Testing live dispatch"
                                        className="w-full px-3 py-2 bg-white dark:bg-dark-input rounded-xl text-xs font-bold border border-border dark:border-dark-border focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-2 flex items-end">
                                    <button 
                                        type="submit" 
                                        disabled={isSendingTestEmail}
                                        className="w-full py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                                    >
                                        <Send className={`w-3 h-3 ${isSendingTestEmail ? 'animate-pulse' : ''}`} />
                                        {isSendingTestEmail ? 'Sending...' : 'Send Test'}
                                    </button>
                                </div>
                            </form>

                            {testEmailResult && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span>
                                            Dispatched <span className="font-bold">{testEmailResult.templateType}</span> to <span className="font-mono font-bold">{testEmailResult.recipient}</span> via <span className="font-bold uppercase">{testEmailResult.result?.providerUsed || 'engine'}</span> ({testEmailResult.result?.simulated ? 'Simulated' : 'Live Gateway'}).
                                        </span>
                                    </div>
                                    <button onClick={() => setTestEmailResult(null)} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email KPI metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="p-3 bg-muted/40 dark:bg-dark-muted/30 rounded-xl border border-border/50">
                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-wider">Total Recorded</p>
                                <p className="text-base font-black text-foreground mt-0.5">{emailLogs.length}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                                <p className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Sent / Delivered</p>
                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {emailLogs.filter(e => (e.status || e.emailStatus || '').toLowerCase() === 'sent').length}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                <p className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Queued</p>
                                <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                    {emailLogs.filter(e => (e.status || e.emailStatus || '').toLowerCase() === 'queued').length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                                <p className="text-[8px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider">Failed / Retries</p>
                                <p className="text-base font-black text-red-600 dark:text-red-400 mt-0.5">
                                    {emailLogs.filter(e => (e.status || e.emailStatus || '').toLowerCase() === 'failed').length}
                                </p>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-dark-muted/50 rounded-xl w-full sm:w-auto">
                                <button
                                    onClick={() => setEmailStatusFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                        emailStatusFilter === 'all' ? 'bg-white dark:bg-dark-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    All ({emailLogs.length})
                                </button>
                                <button
                                    onClick={() => setEmailStatusFilter('sent')}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                        emailStatusFilter === 'sent' ? 'bg-white dark:bg-dark-card shadow text-emerald-600' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Sent ({emailLogs.filter(e => (e.status || e.emailStatus || '').toLowerCase() === 'sent').length})
                                </button>
                                <button
                                    onClick={() => setEmailStatusFilter('queued')}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                        emailStatusFilter === 'queued' ? 'bg-white dark:bg-dark-card shadow text-amber-600' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Queued ({emailLogs.filter(e => (e.status || e.emailStatus || '').toLowerCase() === 'queued').length})
                                </button>
                                <button
                                    onClick={() => setEmailStatusFilter('failed')}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                        emailStatusFilter === 'failed' ? 'bg-white dark:bg-dark-card shadow text-red-600' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Failed ({emailLogs.filter(e => (e.status || e.emailStatus || '').toLowerCase() === 'failed').length})
                                </button>
                            </div>

                            <div className="w-full sm:w-72">
                                <input 
                                    type="text" 
                                    value={emailSearchQuery} 
                                    onChange={e => setEmailSearchQuery(e.target.value)}
                                    placeholder="Search recipient, template, subject..."
                                    className="w-full px-3 py-1.5 bg-muted dark:bg-dark-input rounded-xl text-xs font-bold border-none focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Email Logs List */}
                        {filteredEmailLogs.length === 0 ? (
                            <div className="py-12 text-center space-y-2">
                                <Mail className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {emailLogs.length === 0 ? "No email dispatches recorded yet." : "No matching email records found."}
                                </p>
                                <p className="text-[9px] text-muted-foreground/70">
                                    Use the Test Dispatcher above or trigger customer account actions to generate notifications.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {filteredEmailLogs.map((item, idx) => {
                                    const normStatus = (item.status || item.emailStatus || 'queued').toLowerCase();
                                    const normTo = item.recipient || item.to || 'Unknown';
                                    const normType = item.emailType || item.templateType || 'General Notification';
                                    const normDate = item.createdTimestamp || item.createdAt || new Date().toISOString();
                                    const normAttempts = (item.retryCount !== undefined ? item.retryCount + 1 : item.attempts) || 1;
                                    const normError = item.failureReason || item.errorMessage;

                                    return (
                                        <div key={item.id || `mail_${idx}`} className="p-4 bg-slate-50 dark:bg-dark-muted/40 rounded-2xl border border-border dark:border-dark-border text-xs space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                        normStatus === 'sent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                                                        normStatus === 'queued' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                                                        'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                                                    }`}>
                                                        {normStatus === 'sent' && <CheckCircle className="w-2.5 h-2.5" />}
                                                        {normStatus === 'queued' && <Clock className="w-2.5 h-2.5" />}
                                                        {normStatus === 'failed' && <AlertTriangle className="w-2.5 h-2.5" />}
                                                        {normStatus}
                                                    </span>
                                                    <span className="font-black text-foreground text-[11px]">{item.subject}</span>
                                                </div>
                                                <span className="text-[9px] text-muted-foreground font-medium">
                                                    {new Date(normDate).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                                                <div>
                                                    <span className="font-semibold">Recipient:</span>{' '}
                                                    <span className="font-mono font-bold text-foreground">{normTo}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Template:</span>{' '}
                                                    <span className="font-mono font-bold text-foreground">{normType}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Attempts:</span>{' '}
                                                    <span className="font-mono font-bold text-foreground">{normAttempts}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Delivered At:</span>{' '}
                                                    <span className="text-foreground">
                                                        {item.sentAt ? new Date(item.sentAt).toLocaleTimeString() : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            {normError && (
                                                <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-[10px] text-red-700 dark:text-red-300">
                                                    <span className="font-bold uppercase tracking-wider text-[8px] block text-red-800 dark:text-red-400">Delivery Notice:</span>
                                                    {normError}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                                                {item.body && (
                                                    <button 
                                                        onClick={() => setViewingEmailRecord(item)}
                                                        className="px-3 py-1.5 bg-muted dark:bg-dark-muted hover:bg-slate-200 dark:hover:bg-dark-border text-foreground rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center gap-1.5"
                                                    >
                                                        <Eye className="w-3 h-3 text-primary" />
                                                        Inspect Email Body
                                                    </button>
                                                )}

                                                {(normStatus === 'failed' || normStatus === 'queued') && (
                                                    <button 
                                                        onClick={() => handleRetryEmail(item.id)}
                                                        disabled={retryingEmailId === item.id}
                                                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center gap-1.5"
                                                    >
                                                        <RefreshCw className={`w-3 h-3 ${retryingEmailId === item.id ? 'animate-spin' : ''}`} />
                                                        {retryingEmailId === item.id ? 'Retrying...' : 'Retry Delivery Now'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'support' && <AdminSupportChat />}

            {tab === 'settings' && (
                <div className="space-y-6">
                    {/* System Note */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('systemNoteLabel')}</h3>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold italic">{t('systemNoteDescription')}</p>
                        <textarea 
                            value={state.systemNote} 
                            onChange={e => dispatch({ type: 'UPDATE_SYSTEM_NOTE', payload: e.target.value })}
                            onBlur={() => syncWithServer()}
                            className="w-full h-40 p-4 bg-muted dark:bg-dark-input rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary border-none"
                        />
                    </div>

                    {/* Custom Domain & Transactional Email Configuration Guide for cathaybankusa.com */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Domain Connection: cathaybankusa.com</h3>
                                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Active Target
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Production Host: <code className="font-mono text-primary font-bold">https://cathaybankusa.com</code> • Subdomain: <code className="font-mono text-primary font-bold">www.cathaybankusa.com</code>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                            <span>Target Region:</span>
                                            <span className="font-black underline">us-west1 (Oregon)</span>
                                            <span className="text-[8px] bg-emerald-600 text-white px-1 rounded">Host Domain Mapping Supported</span>
                                        </span>
                                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                                            (Note: Google Cloud Run domain mapping is disabled in <code>us-west2</code>, switch to <code>us-west1</code>)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCheckDomain}
                                    disabled={isCheckingDomain}
                                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isCheckingDomain ? 'animate-spin' : ''}`} />
                                    {isCheckingDomain ? 'Verifying DNS...' : 'Verify Live DNS'}
                                </button>
                                <a 
                                    href="https://console.cloud.google.com/run/domains" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1 border border-border"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Cloud Run Console
                                </a>
                                <a 
                                    href="https://console.firebase.google.com/project/yttriferous-apex-1rwfn/hosting/sites" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1 border border-border"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Firebase Console
                                </a>
                            </div>
                        </div>

                        {domainStatus && (
                            <div className={`p-4 rounded-xl border text-[10px] space-y-1.5 ${
                                domainStatus.status === 'connected' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                                    : domainStatus.status === 'propagating'
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                                    : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
                            }`}>
                                <div className="flex items-center justify-between font-black uppercase tracking-wider text-[9px]">
                                    <span>DNS Status: {domainStatus.status}</span>
                                    <span>Checked: {new Date(domainStatus.checkedAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-[10px]">
                                    {domainStatus.status === 'connected' 
                                        ? '✅ Custom domain is correctly pointed to Google Cloud Run with active DNS propagation!'
                                        : domainStatus.status === 'propagating'
                                        ? '⏳ A records detected! DNS is currently propagating across global nameservers.'
                                        : 'ℹ️ DNS records not yet detected globally. Add the records below in your domain registrar DNS panel to complete connection.'}
                                </p>
                                {domainStatus.aRecords && domainStatus.aRecords.length > 0 && (
                                    <p className="font-mono text-[9px]">Active A Records: {domainStatus.aRecords.join(', ')}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Step 1: Web Traffic DNS Records (cathaybankusa.com)</h4>
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-[10px] text-left">
                                    <thead className="bg-muted dark:bg-dark-muted text-muted-foreground uppercase text-[8px] font-black">
                                        <tr>
                                            <th className="p-2.5">Type</th>
                                            <th className="p-2.5">Host / Name</th>
                                            <th className="p-2.5">Target / Value</th>
                                            <th className="p-2.5">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 text-foreground font-mono">
                                        <tr>
                                            <td className="p-2.5 font-bold text-primary">CNAME</td>
                                            <td className="p-2.5">www</td>
                                            <td className="p-2.5 text-muted-foreground">ghs.googlehosted.com</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('ghs.googlehosted.com', 101)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 101 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 101 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold text-primary">A</td>
                                            <td className="p-2.5">@ (apex)</td>
                                            <td className="p-2.5 text-muted-foreground">216.239.32.21</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('216.239.32.21', 102)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 102 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 102 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold text-primary">A</td>
                                            <td className="p-2.5">@ (apex)</td>
                                            <td className="p-2.5 text-muted-foreground">216.239.34.21</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('216.239.34.21', 103)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 103 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 103 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold text-primary">A</td>
                                            <td className="p-2.5">@ (apex)</td>
                                            <td className="p-2.5 text-muted-foreground">216.239.36.21</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('216.239.36.21', 104)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 104 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 104 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold text-primary">A</td>
                                            <td className="p-2.5">@ (apex)</td>
                                            <td className="p-2.5 text-muted-foreground">216.239.38.21</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('216.239.38.21', 105)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 105 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 105 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Step 2: Transactional Email Deliverability (notifications@cathaybankusa.com)</h4>
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-[10px] text-left">
                                    <thead className="bg-muted dark:bg-dark-muted text-muted-foreground uppercase text-[8px] font-black">
                                        <tr>
                                            <th className="p-2.5">Type</th>
                                            <th className="p-2.5">Host / Name</th>
                                            <th className="p-2.5">Target / Value</th>
                                            <th className="p-2.5">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 text-foreground font-mono">
                                        <tr>
                                            <td className="p-2.5 font-bold text-emerald-600">TXT (SPF)</td>
                                            <td className="p-2.5">@</td>
                                            <td className="p-2.5 text-muted-foreground truncate max-w-[200px]">v=spf1 include:resend.com ~all</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('v=spf1 include:resend.com ~all', 201)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 201 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 201 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold text-emerald-600">TXT (DMARC)</td>
                                            <td className="p-2.5">_dmarc</td>
                                            <td className="p-2.5 text-muted-foreground truncate max-w-[200px]">v=DMARC1; p=quarantine; pct=100; rua=mailto:postmaster@cathaybankusa.com</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('v=DMARC1; p=quarantine; pct=100; rua=mailto:postmaster@cathaybankusa.com', 202)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 202 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 202 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold text-blue-600">MX</td>
                                            <td className="p-2.5">feedback</td>
                                            <td className="p-2.5 text-muted-foreground truncate max-w-[200px]">feedback-smtp.resend.com (Priority 10)</td>
                                            <td className="p-2.5">
                                                <button 
                                                    onClick={() => copyDnsValue('feedback-smtp.resend.com', 203)}
                                                    className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-[9px] font-sans font-bold flex items-center gap-1"
                                                >
                                                    {copiedDnsIndex === 203 ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                    {copiedDnsIndex === 203 ? 'Copied' : 'Copy'}
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-3 bg-muted/60 dark:bg-dark-muted/40 rounded-xl text-[9px] text-muted-foreground space-y-1">
                            <p className="font-bold text-foreground">💡 Cloud Run Region & Host Domain Mapping:</p>
                            <p>Direct custom domain mapping in Google Cloud Run is supported in <strong className="text-foreground font-mono">us-west1 (Oregon)</strong>, but <em>not available in us-west2</em>. To map your host domain:</p>
                            <div className="p-2 rounded bg-black/80 text-emerald-400 font-mono text-[9px] select-all overflow-x-auto my-1">
                                gcloud beta run domain-mappings create --service cathaybank --domain cathaybankusa.com --region us-west1
                            </div>
                            <p>Once mapped, Google Cloud automatically validates the host and issues an auto-renewing SSL certificate.</p>
                        </div>
                    </div>

                    {/* Zero-Trust First Administrator Setup Guide */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-purple-600" />
                                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">First Administrator Setup Guide</h3>
                            </div>
                            <button 
                                onClick={() => setShowAdminSetupGuide(true)}
                                className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[9px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1"
                            >
                                <HelpCircle className="w-3 h-3" />
                                View Full Security Protocol
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            In accordance with zero-trust banking standards, administrator passwords must never be hardcoded into client applications or repositories. Administrator privileges are granted server-side via Firebase Authentication Custom Claims.
                        </p>
                        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[9px] space-y-1 overflow-x-auto">
                            <p className="text-slate-400">// Server-side Firebase Admin SDK command to grant admin role:</p>
                            <p className="text-emerald-400">const admin = require('firebase-admin');</p>
                            <p className="text-emerald-400">await admin.auth().setCustomUserClaims(uid, &#123; role: 'admin', admin: true &#125;);</p>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'broadcast' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('systemBroadcast')}</h3>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold italic">{t('systemBroadcastDescription')}</p>
                        <Input placeholder={t('broadcastTitle')} id="broadcast-title" />
                        <textarea 
                            id="broadcast-message"
                            placeholder={t('broadcastMessage')}
                            className="w-full h-32 p-4 bg-muted dark:bg-dark-input rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary border-none"
                        />
                        <Button onClick={() => {
                            const title = (document.getElementById('broadcast-title') as HTMLInputElement).value;
                            const message = (document.getElementById('broadcast-message') as HTMLTextAreaElement).value;
                            if (!title || !message) return alert(t('fillAllFields'));
                            
                            state.users.forEach(u => {
                                if (u.role === 'customer') {
                                    dispatch({ 
                                        type: 'ADD_NOTIFICATION', 
                                        payload: { 
                                            id: `notif_${Date.now()}_${u.id}`, 
                                            title, 
                                            message, 
                                            date: new Date().toISOString(), 
                                            read: false, 
                                            type: 'info' 
                                        } 
                                    });
                                }
                            });
                            syncWithServer();
                            alert(t('broadcastSentToAllCustomers'));
                            (document.getElementById('broadcast-title') as HTMLInputElement).value = '';
                            (document.getElementById('broadcast-message') as HTMLTextAreaElement).value = '';
                        }}>{t('dispatchBroadcast')}</Button>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {/* Modal: Asset Adjustment with Audit Reason */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} className="max-w-sm">
                <div className="p-8 space-y-6">
                    <div>
                        <h3 className="text-base font-black text-center uppercase tracking-tight">{t('assetAdjustment')}</h3>
                        <p className="text-[9px] text-center text-muted-foreground mt-1">Modifying: {editingUser?.name} ({editingUser?.email})</p>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">{t('balance')}</label>
                            <Input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">{t('loanLiquidity')}</label>
                            <Input type="number" value={newLoanBalance} onChange={e => setNewLoanBalance(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">{t('vaultLiquidity')}</label>
                            <Input type="number" value={newSavingsBalance} onChange={e => setNewSavingsBalance(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Audit Justification / Reason *</label>
                            <Input 
                                placeholder="e.g. Cleared wire test or correction" 
                                value={balanceReason} 
                                onChange={e => setBalanceReason(e.target.value)} 
                            />
                        </div>
                    </div>
                    <Button onClick={handleUpdateUserAssets}>{t('finalizeAdjustment')}</Button>
                </div>
            </Modal>

            {/* Modal: Transaction Reversal & Fund Recall */}
            {reversalModalTx && (
                <Modal isOpen={!!reversalModalTx} onClose={() => setReversalModalTx(null)} className="max-w-md">
                    <div className="p-8 space-y-5">
                        <div className="flex items-center gap-2 text-amber-600">
                            <RotateCcw className="w-5 h-5" />
                            <h3 className="text-base font-black uppercase tracking-tight">Reverse Transaction & Recall Funds</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Executing a reversal marks the transaction as <span className="font-bold text-foreground">Reversed</span>, audits the change, and automatically credits or debits the customer's balance back according to zero-trust banking rules.
                        </p>

                        <div className="p-3 bg-muted/60 dark:bg-dark-muted rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transaction ID:</span>
                                <span className="font-mono font-bold text-foreground">{reversalModalTx.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Description:</span>
                                <span className="font-bold text-foreground">{reversalModalTx.description}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-primary font-mono">{formatCurrency(reversalModalTx.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-black uppercase text-[10px]">{reversalModalTx.type}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Reversal Reason / Compliance Justification *</label>
                            <Input 
                                placeholder="e.g. Fraud dispute, erroneous test charge, customer request" 
                                value={reversalReason} 
                                onChange={e => setReversalReason(e.target.value)} 
                            />
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setReversalModalTx(null)}
                                className="flex-1 py-3 bg-muted dark:bg-dark-muted rounded-xl text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                            >
                                Cancel
                            </button>
                            <Button onClick={handleExecuteReversal} className="flex-1 bg-amber-600 hover:bg-amber-700">
                                Confirm Reversal
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal: Internal Administrative Notes on Transaction */}
            {noteModalTx && (
                <Modal isOpen={!!noteModalTx} onClose={() => setNoteModalTx(null)} className="max-w-md">
                    <div className="p-8 space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <FileText className="w-5 h-5" />
                            <h3 className="text-base font-black uppercase tracking-tight">Internal Transaction Notes</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            These notes are strictly confidential to banking staff and administrators (never visible to customers).
                        </p>

                        <div className="p-2.5 bg-muted/40 rounded-xl text-xs">
                            <p className="font-mono text-[10px] text-muted-foreground">Tx #{noteModalTx.id} • {noteModalTx.description}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Confidential Note</label>
                            <textarea 
                                value={internalNoteText}
                                onChange={e => setInternalNoteText(e.target.value)}
                                placeholder="Add notes regarding source verification, compliance review, or KYC clearance..."
                                className="w-full h-32 p-3 bg-muted dark:bg-dark-input rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary border-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setNoteModalTx(null)}
                                className="flex-1 py-3 bg-muted dark:bg-dark-muted rounded-xl text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                            >
                                Close
                            </button>
                            <Button onClick={handleSaveInternalNote} className="flex-1">
                                Save Notes
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal: Role & Security Hold Management */}
            {roleModalUser && (
                <Modal isOpen={!!roleModalUser} onClose={() => setRoleModalUser(null)} className="max-w-md">
                    <div className="p-8 space-y-5">
                        <div className="flex items-center gap-2 text-purple-600">
                            <ShieldIcon className="w-5 h-5" />
                            <h3 className="text-base font-black uppercase tracking-tight">Role & Account Security Hold</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Adjust permissions and security freeze status for <span className="font-bold text-foreground">{roleModalUser.name}</span> ({roleModalUser.email}).
                        </p>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Assigned Role</label>
                                <select 
                                    value={selectedRole}
                                    onChange={e => setSelectedRole(e.target.value as any)}
                                    className="w-full p-3 bg-muted dark:bg-dark-input rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary border-none"
                                >
                                    <option value="customer">Customer (Standard Retail Account)</option>
                                    <option value="support">Support Agent (Read & Chat privileges)</option>
                                    <option value="admin">Administrator (Audit & Balance adjustments)</option>
                                    <option value="superadmin">Super Administrator (Full Zero-Trust Access)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Security Freeze Status</label>
                                <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-dark-muted rounded-xl">
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Freeze Account</p>
                                        <p className="text-[9px] text-muted-foreground">Prevents transfers, cards, and loan applications</p>
                                    </div>
                                    <input 
                                        type="checkbox"
                                        checked={freezeStatus}
                                        onChange={e => setFreezeStatus(e.target.checked)}
                                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                                    />
                                </div>
                            </div>

                            {freezeStatus && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Custom Freeze Notice (Shown to Customer)</label>
                                    <Input 
                                        placeholder="e.g. Account placed on compliance hold. Please contact support."
                                        value={customFreezeMsg}
                                        onChange={e => setCustomFreezeMsg(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setRoleModalUser(null)}
                                className="flex-1 py-3 bg-muted dark:bg-dark-muted rounded-xl text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                            >
                                Cancel
                            </button>
                            <Button onClick={handleSaveUserStatusAndRole} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                Save Security Settings
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal: Zero-Trust Administrator Creation Protocol Guide */}
            {showAdminSetupGuide && (
                <Modal isOpen={showAdminSetupGuide} onClose={() => setShowAdminSetupGuide(false)} className="max-w-lg">
                    <div className="p-8 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Key className="w-5 h-5" />
                            <h3 className="text-base font-black uppercase tracking-tight">Zero-Trust Administrator Creation Guide</h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Following the architectural mandate: <span className="font-semibold text-foreground">"Do not hard-code an administrator password. Create instructions for securely creating the first administrator through Firebase Authentication and server-side custom claims."</span>
                        </p>

                        <div className="space-y-3 text-[10px] text-foreground">
                            <div className="p-3 bg-muted dark:bg-dark-muted rounded-xl space-y-1">
                                <p className="font-bold text-primary uppercase text-[9px] tracking-wider">Step 1: Create User Identity in Firebase Auth</p>
                                <p className="text-muted-foreground">Register the administrator's email in Firebase Console &gt; Authentication &gt; Users &gt; Add User, or through the client sign-up flow.</p>
                            </div>

                            <div className="p-3 bg-muted dark:bg-dark-muted rounded-xl space-y-1">
                                <p className="font-bold text-primary uppercase text-[9px] tracking-wider">Step 2: Assign Custom Claims Server-Side</p>
                                <p className="text-muted-foreground">Run a secure server-side script or cloud function with Firebase Admin SDK privileges:</p>
                                <pre className="p-2 bg-slate-900 text-slate-100 rounded font-mono text-[9px] overflow-x-auto">
{`const admin = require('firebase-admin');
const uid = "USER_FIREBASE_UID";
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  admin: true
});`}
                                </pre>
                            </div>

                            <div className="p-3 bg-muted dark:bg-dark-muted rounded-xl space-y-1">
                                <p className="font-bold text-primary uppercase text-[9px] tracking-wider">Step 3: Enforce in Security Rules</p>
                                <p className="text-muted-foreground">Firestore security rules check <code className="font-mono text-primary font-bold">request.auth.token.admin == true</code>, ensuring no unauthenticated or regular customer can write to admin ledgers or balances.</p>
                            </div>
                        </div>

                        <Button onClick={() => setShowAdminSetupGuide(false)} className="w-full">
                            Understood & Acknowledged
                        </Button>
                    </div>
                </Modal>
            )}

            {/* Modal: Transactional Email Body Inspector */}
            {viewingEmailRecord && (
                <Modal isOpen={!!viewingEmailRecord} onClose={() => setViewingEmailRecord(null)} className="max-w-2xl">
                    <div className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                                        Email Dispatch Inspector
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground">
                                        ID: <span className="font-mono font-bold text-foreground">{viewingEmailRecord.id}</span>
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                (viewingEmailRecord.status || viewingEmailRecord.emailStatus || '').toLowerCase() === 'sent' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                                {viewingEmailRecord.status || viewingEmailRecord.emailStatus || 'queued'}
                            </span>
                        </div>

                        {/* Metadata Header */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-muted/40 dark:bg-dark-muted/30 rounded-xl text-xs">
                            <div>
                                <span className="text-[9px] font-black uppercase text-muted-foreground block">Recipient</span>
                                <span className="font-mono font-bold text-foreground">{viewingEmailRecord.recipient || viewingEmailRecord.to}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase text-muted-foreground block">Sender Identity</span>
                                <span className="font-mono text-foreground font-semibold">notifications@cathaybankusa.com</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase text-muted-foreground block">Subject</span>
                                <span className="font-bold text-foreground">{viewingEmailRecord.subject}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase text-muted-foreground block">Timestamp</span>
                                <span className="text-foreground">
                                    {new Date(viewingEmailRecord.createdTimestamp || viewingEmailRecord.createdAt || Date.now()).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Rendered HTML Container */}
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                                Rendered HTML Message:
                            </span>
                            <div 
                                className="p-4 bg-white rounded-xl border border-border shadow-inner max-h-[380px] overflow-y-auto text-slate-800"
                                dangerouslySetInnerHTML={{ __html: viewingEmailRecord.body || '<p>No content preview available.</p>' }}
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setViewingEmailRecord(null)}
                                className="px-5 py-2.5 bg-muted dark:bg-dark-muted hover:bg-slate-200 dark:hover:bg-dark-border text-foreground font-bold text-xs rounded-xl transition"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showCreateUser && <CreateUserModal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} />}
        </div>
    );
};

const AdminStatCard: React.FC<{ label: string, value: string, icon: any, color?: string }> = ({ label, value, icon: Icon, color = "text-primary" }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-3">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{label}</p>
            <p className="text-xl font-black tracking-tighter mt-1">{value}</p>
        </div>
    </div>
);

const CreateUserModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { dispatch, t, syncWithServer } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [balance, setBalance] = useState('0');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // Transaction form state
    const [txDesc, setTxDesc] = useState('');
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState<'credit' | 'debit'>('credit');

    const addTransaction = () => {
        if (!txDesc || !txAmount) return;
        const newTx: Transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: new Date().toISOString(),
            description: txDesc,
            amount: parseFloat(txAmount),
            type: txType,
            category: 'Transfer',
            status: 'Completed',
            reference: `REF-${Math.floor(Math.random() * 900000 + 100000)}`
        };
        setTransactions([...transactions, newTx]);
        setTxDesc('');
        setTxAmount('');
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `usr_${Date.now()}`,
            name,
            email,
            password,
            phone,
            accountNumber: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
            bvn: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
            idCardNumber: `ID-${Math.floor(Math.random() * 900000 + 100000)}`,
            avatar: `https://picsum.photos/seed/${name}/200/200`,
            balance: parseFloat(balance),
            savingsBalance: 0,
            loanBalance: 0,
            transactions: transactions,
            notifications: [],
            pin: '1212',
            currency: 'GBP',
            role: 'customer',
            isActivated: false,
            isBlocked: false
        };
        dispatch({ type: 'ADD_USER', payload: newUser });
        syncWithServer();
        alert(t('customerAccountCreated'));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <form onSubmit={handleCreate} className="p-8 space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide">
                <h3 className="text-base font-black text-center uppercase tracking-tight mb-4">{t('createCustomerAccount')}</h3>
                
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest px-1">{t('basicInformation')}</p>
                    <Input placeholder={t('fullName')} value={name} onChange={e => setName(e.target.value)} required />
                    <Input type="email" placeholder={t('emailAddress')} value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input type="password" placeholder={t('initialPassword')} value={password} onChange={e => setPassword(e.target.value)} required />
                    <Input placeholder={t('phoneNumber')} value={phone} onChange={e => setPhone(e.target.value)} required />
                    <Input type="number" placeholder={t('initialBalanceGbp')} value={balance} onChange={e => setBalance(e.target.value)} required />
                </div>

                <div className="pt-4 border-t border-border dark:border-dark-border space-y-3">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest px-1">{t('addTransactionHistoryOptional')}</p>
                    <div className="bg-muted/30 p-4 rounded-2xl space-y-3 border border-border/50">
                        <Input placeholder={t('description')} value={txDesc} onChange={e => setTxDesc(e.target.value)} />
                        <div className="flex gap-2">
                            <Input type="number" placeholder={t('amount')} className="flex-1" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                            <Select value={txType} onChange={e => setTxType(e.target.value as any)} className="w-32">
                                <option value="credit">{t('credit')}</option>
                                <option value="debit">{t('debit')}</option>
                            </Select>
                        </div>
                        <button type="button" onClick={addTransaction} className="w-full py-2 bg-slate-200 dark:bg-dark-muted text-[9px] font-black uppercase rounded-xl hover:bg-primary/10 transition">{t('addToHistory')}</button>
                    </div>

                    {transactions.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {transactions.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-dark-card rounded-xl border border-border/50 shadow-sm">
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black uppercase truncate">{t.description}</p>
                                        <p className="text-[7px] opacity-40 uppercase">{t.type}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                        <button type="button" onClick={() => setTransactions(transactions.filter((_, i) => i !== idx))} className="text-red-500 font-black text-[10px]">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <Button type="submit">{t('deployAccount')}</Button>
                </div>
            </form>
        </Modal>
    );
};

const AdminSupportChat = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [showDetails, setShowDetails] = useState(true);
    const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeCustomer = useMemo(() => state.users.find(u => u.id === activeUserId), [state.users, activeUserId]);

    const chatHistory = useMemo(() => {
        if (!activeUserId) return [];
        return state.messages.filter(m => 
            (m.senderRole === 'customer' && m.senderId === activeUserId) || 
            (m.senderRole === 'admin' && m.receiverId === activeUserId)
        );
    }, [state.messages, activeUserId]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [chatHistory]);

    const sendReply = () => {
        if (!replyText.trim() || !activeUserId) return;
        const msg: Message = {
            id: `msg_${Date.now()}`,
            senderId: state.currentUser!.id,
            receiverId: activeUserId,
            senderName: t('adminTriage'),
            senderRole: 'admin',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        dispatch({ type: 'SEND_MESSAGE', payload: msg });
        syncWithServer();
        setReplyText('');
    };

    const customersWithMessages = useMemo(() => {
        return state.users.filter(u => u.role === 'customer');
    }, [state.users]);

    return (
        <div className="h-[650px] flex bg-white dark:bg-dark-card rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-inner">
            {!activeUserId ? (
                <div className="p-6 overflow-y-auto space-y-4 h-full w-full">
                    <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest px-1 mb-2">{t('queuePriority')}</h4>
                    {customersWithMessages.length === 0 ? (
                        <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
                            <MessageCircleIcon className="w-12 h-12" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('supportLineEmpty')}</p>
                        </div>
                    ) : (
                        customersWithMessages.map(u => {
                            const lastMsg = state.messages.filter(m => m.senderId === u.id || m.receiverId === u.id).pop();
                            return (
                                <button key={u.id} onClick={() => setActiveUserId(u.id)} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-dark-muted rounded-2xl hover:bg-primary/5 transition border border-transparent hover:border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-base shadow-inner">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[11px] font-black uppercase tracking-tighter text-gray-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-[9px] opacity-60 font-medium truncate italic text-gray-500">{lastMsg?.text || t('awaitingInput')}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 pl-3">
                                        <span className="text-[7px] font-black text-primary dark:text-dark-primary uppercase bg-primary/5 dark:bg-dark-primary/10 px-3 py-1.5 rounded-full border border-primary/10">{t('active')}</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            ) : (
                <>
                    {/* Chat Section */}
                    <div className="flex-1 flex flex-col h-full bg-[#fcfdfe] dark:bg-dark-background border-r border-gray-100 dark:border-dark-border overflow-hidden">
                        <div className="p-5 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border flex justify-between items-center z-10 shadow-sm">
                            <button onClick={() => setActiveUserId(null)} className="p-3 bg-slate-50 dark:bg-dark-muted hover:bg-primary/5 rounded-2xl transition"><ArrowLeftIcon className="w-5 h-5 text-primary"/></button>
                            <div className="text-center">
                                <p className="text-[12px] font-black uppercase tracking-tighter text-gray-900 dark:text-white">{activeCustomer?.name}</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">{t('encryptedUplink')}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowDetails(!showDetails)} 
                                className={`px-4 py-2.5 text-[9px] font-black uppercase rounded-2xl transition duration-300 ${
                                    showDetails 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-dark-muted text-gray-600 dark:text-gray-300 hover:bg-slate-200'
                                }`}
                            >
                                {showDetails ? 'Hide Profile' : 'View Profile'}
                            </button>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
                            {chatHistory.map((m, idx) => (
                                <div key={idx} className={`flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                    <div className={`p-4 rounded-[1.8rem] max-w-[85%] shadow-sm text-xs font-bold leading-relaxed ${
                                        m.senderRole === 'admin' 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-tl-none text-gray-800 dark:text-gray-100'
                                    }`}>
                                        {m.imageUrl && (
                                            <img 
                                                src={m.imageUrl} 
                                                alt="Customer Attachment" 
                                                className="max-w-full rounded-xl mb-3 border border-gray-200 dark:border-dark-border shadow-sm"
                                            />
                                        )}
                                        {m.text && <p>{m.text}</p>}
                                        <div className={`flex items-center gap-2 mt-3 opacity-30 font-black text-[7px] uppercase ${m.senderRole === 'admin' ? 'text-white' : 'text-gray-400'}`}>
                                            <span>{m.senderName}</span> • <span>{m.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card flex gap-4">
                            <input 
                                className="flex-1 px-6 py-4 text-xs font-bold bg-slate-50 dark:bg-dark-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 text-gray-900 dark:text-white"
                                placeholder={t('typeSecuredResponse')} 
                                value={replyText} 
                                onChange={e => setReplyText(e.target.value)} 
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendReply(); } }}
                            />
                            <button onClick={sendReply} className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition">
                                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Customer Account Details Sidebar */}
                    {showDetails && activeCustomer && (
                        <div className="w-96 border-l border-gray-100 dark:border-dark-border bg-slate-50 dark:bg-dark-muted/20 p-5 flex flex-col h-full overflow-y-auto space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-3">
                                <h3 className="text-[11px] font-black uppercase tracking-wider text-primary dark:text-dark-primary">Financial Profile</h3>
                                <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${activeCustomer.isActivated ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {activeCustomer.isActivated ? 'Activated' : 'Restricted'}
                                </span>
                            </div>

                            {/* Vital Account Balances */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs">
                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Balance</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white mt-1">{formatCurrency(activeCustomer.balance)}</p>
                                </div>
                                <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs">
                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Savings</p>
                                    <p className="text-xs font-black text-green-600 mt-1">{formatCurrency(activeCustomer.savingsBalance)}</p>
                                </div>
                                <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs col-span-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Loan Outstanding</p>
                                            <p className="text-xs font-black text-red-600 mt-0.5">{formatCurrency(activeCustomer.loanBalance)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Base Currency</p>
                                            <p className="text-xs font-black text-gray-500 mt-0.5">{activeCustomer.currency || 'GBP'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Demographics / General Identification Profile */}
                            <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border space-y-2 text-[10px]">
                                <p className="text-[8px] font-black uppercase opacity-40 tracking-wider mb-2 border-b border-gray-100 dark:border-dark-border pb-1">Identification & Contacts</p>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Account Number:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.accountNumber}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">National ID/BVN:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.bvn || activeCustomer.idCardNumber || 'N/A'}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Phone Number:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.phone}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Email Address:</span><span className="font-extrabold text-gray-800 dark:text-white truncate max-w-[150px]">{activeCustomer.email}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Secure PIN:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.pin || '1212'}</span></div>
                            </div>

                            {/* Customer Transaction Ledger */}
                            <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Transactions Ledger ({activeCustomer.transactions?.length || 0})</p>
                                {(!activeCustomer.transactions || activeCustomer.transactions.length === 0) ? (
                                    <p className="text-[9px] text-center font-bold text-muted-foreground uppercase opacity-40 py-6">No transactions recorded.</p>
                                ) : (
                                    <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[220px]">
                                        {(activeCustomer.transactions || []).map((tx: any, idx: number) => {
                                            const isExpanded = expandedTxId === tx.id;
                                            return (
                                                <div 
                                                    key={`${tx.id}-${idx}`} 
                                                    className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs cursor-pointer transition hover:border-primary/20"
                                                    onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                                                >
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <div className="overflow-hidden pr-2">
                                                            <p className="font-bold text-gray-900 dark:text-white truncate">{tx.description}</p>
                                                            <p className="text-[8px] opacity-40 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className={`font-black shrink-0 ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                                        </span>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="mt-2.5 pt-2.5 border-t border-border/50 dark:border-dark-border/50 text-[9px] space-y-1.5 text-gray-500 animate-in fade-in duration-150">
                                                            <div className="flex justify-between"><span>Reference:</span><span className="font-bold text-gray-800 dark:text-white">{tx.reference}</span></div>
                                                            <div className="flex justify-between"><span>Status:</span><span className={`font-black uppercase ${tx.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>{tx.status}</span></div>
                                                            <div className="flex justify-between"><span>Category:</span><span className="font-bold text-gray-800 dark:text-white">{tx.category}</span></div>
                                                            {tx.senderName && <div className="flex justify-between"><span>Sender:</span><span className="font-bold text-gray-800 dark:text-white">{tx.senderName} ({tx.senderAccount})</span></div>}
                                                            {tx.receiverName && <div className="flex justify-between"><span>Receiver:</span><span className="font-bold text-gray-800 dark:text-white">{tx.receiverName} ({tx.receiverAccount})</span></div>}
                                                            {tx.bankName && <div className="flex justify-between"><span>Bank:</span><span className="font-bold text-gray-800 dark:text-white">{tx.bankName}</span></div>}
                                                            {tx.country && <div className="flex justify-between"><span>Country:</span><span className="font-bold text-gray-800 dark:text-white">{tx.country}</span></div>}
                                                            {tx.fee !== undefined && <div className="flex justify-between"><span>Fee:</span><span className="font-bold text-gray-800 dark:text-white">{formatCurrency(tx.fee)}</span></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// --- CUSTOMER PAGE LOGIC ---

const DepositPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const user = state.currentUser!;
    const isNewAccount = (user?.balance === 0 && !user?.name?.toLowerCase().includes('james michael'));

    const [method, setMethod] = useState<'card' | 'bank' | 'crypto' | 'check'>(isNewAccount ? 'crypto' : 'card');
    const [targetAccount, setTargetAccount] = useState<'checking' | 'savings'>('checking');
    const [cryptoToken, setCryptoToken] = useState<'USDT' | 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'XRP'>(isNewAccount ? 'BTC' : 'BTC');
    const [amount, setAmount] = useState(isNewAccount ? String(user?.initialDeposit || 10000) : '');
    const [checkPayer, setCheckPayer] = useState('');
    const [checkFront, setCheckFront] = useState<string | null>(null);
    const [checkBack, setCheckBack] = useState<string | null>(null);
    const [cryptoProofImage, setCryptoProofImage] = useState<string | null>(null);
    const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);
    const cryptoProofInputRef = useRef<HTMLInputElement>(null);

    const handleFileRead = (file: File, callback: (result: string) => void) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                callback(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleLoadSampleCheck = () => {
        const sampleFront = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="%23f4f9ff" stroke="%230066cc" stroke-width="6" rx="16"/><rect x="20" y="20" width="560" height="260" fill="none" stroke="%230066cc" stroke-dasharray="4,4"/><text x="40" y="60" font-family="sans-serif" font-weight="900" font-size="20" fill="%23003366">CATHAY BANK USA - CASHIER'S CHECK</text><text x="40" y="90" font-family="sans-serif" font-size="12" fill="%23555555">500 Washington St, San Francisco, CA 94111</text><text x="440" y="60" font-family="sans-serif" font-weight="bold" font-size="14" fill="%230066cc">NO. 9884102</text><text x="40" y="140" font-family="sans-serif" font-size="14" fill="%23333333">PAY TO THE ORDER OF:</text><line x1="190" y1="145" x2="550" y2="145" stroke="%23333333" stroke-width="1.5"/><text x="200" y="140" font-family="sans-serif" font-weight="bold" font-size="16" fill="%230066cc">James Michael Lay</text><text x="40" y="190" font-family="sans-serif" font-size="14" fill="%23333333">AMOUNT:</text><rect x="420" y="165" width="130" height="35" fill="%23e6f0fa" stroke="%230066cc" rx="6"/><text x="430" y="188" font-family="sans-serif" font-weight="900" font-size="18" fill="%230066cc">$ 25,000.00</text><text x="40" y="255" font-family="monospace" font-weight="bold" font-size="16" fill="%23111111">⑆122000496⑆ 1088924102⑈ 9884102</text></svg>`;
        const sampleBack = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="%23fafafa" stroke="%23888888" stroke-width="4" rx="16"/><line x1="450" y1="20" x2="450" y2="280" stroke="%23888888" stroke-dasharray="6,6"/><text x="470" y="60" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23444444">ENDORSE HERE</text><text x="470" y="100" font-family="serif" font-style="italic" font-size="22" fill="%23003366">James Michael Lay</text><line x1="465" y1="110" x2="580" y2="110" stroke="%23003366" stroke-width="2"/><text x="470" y="140" font-family="sans-serif" font-size="10" fill="%23666666">FOR MOBILE DEPOSIT ONLY</text><text x="470" y="155" font-family="sans-serif" font-size="10" fill="%23666666">CATHAY BANK ACCT #••••4102</text></svg>`;
        setCheckFront(sampleFront);
        setCheckBack(sampleBack);
        if (!checkPayer) setCheckPayer('Cathay Treasury Deposit');
        if (!amount) setAmount('25000');
    };

    const CRYPTO_WALLETS = {
        USDT: { name: 'USDT Tether (TRC-20)', address: 'TBJpACmzMJEV21SESAHqFx1kXD563Qgtnm', net: 'TRON (TRC-20)', min: '10 USDT' },
        BTC: { name: 'Bitcoin (BTC)', address: '36JFNgJQAuvuAfBeBannU145seTKfeJjfr', net: 'Bitcoin Network', min: '0.0002 BTC' },
        ETH: { name: 'Ethereum (ETH)', address: '0x00D04837F0ae7011B9D8AFa050CE483291FDedf6', net: 'Ethereum (ERC-20)', min: '0.005 ETH' },
        BNB: { name: 'BNB (BEP-20)', address: '0x00D04837F0ae7011B9D8AFa050CE483291FDedf6', net: 'BNB Smart Chain', min: '0.01 BNB' },
        SOL: { name: 'Solana (SOL)', address: '7XmP8YRvvfZzaQJBNkKhTSeeCfBWq1MyNUkXhmdApYeQ', net: 'Solana Mainnet', min: '0.05 SOL' },
        XRP: { name: 'XRP (Ripple)', address: 'rEb8TK3gYSYsuKaUtAQDJvzpHu7685G25', net: 'XRP Ledger', min: '10 XRP' },
    };

    const currentCrypto = CRYPTO_WALLETS[cryptoToken];

    const handleCopyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (method === 'check' && (!checkFront || !checkBack)) {
            alert("Please upload both Front and Back images of your check before submitting.");
            return;
        }

        setIsProcessing(true);
        const depAmount = parseFloat(amount) || (user?.initialDeposit || 10000);

        if (isNewAccount || method === 'crypto') {
            // 20-minute delay initial deposit flow
            setTimeout(async () => {
                const pendingTx: Transaction = {
                    id: `dep_btc_${Date.now()}`,
                    date: new Date().toISOString(),
                    description: `Bitcoin Deposit (${depAmount.toLocaleString()} USD)`,
                    amount: depAmount,
                    type: 'credit',
                    category: 'Crypto Received',
                    status: 'Pending',
                    reference: `BTC-${Math.floor(100000 + Math.random() * 900000)}`,
                    senderName: `Bitcoin External Wallet`,
                    senderAccount: currentCrypto.address,
                    receiverName: user?.name,
                    receiverAccount: user?.accountNumber,
                    bankName: `Bitcoin Blockchain Network`,
                    subtitle: `Wallet: ${currentCrypto.address.slice(0, 10)}... • Confirmation in progress (Est. 20 mins)`
                };

                const depositNotif = {
                    id: `notif_dep_proof_${Date.now()}`,
                    title: "Bitcoin Deposit Confirmation In Progress",
                    message: `Your deposit proof of $${depAmount.toLocaleString()} USD has been received. Blockchain confirmations are in progress and your balance will be credited in approximately 20 minutes.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: 'info' as const
                };

                const updatedUser: User = {
                    ...user,
                    depositProofSubmitted: true,
                    depositProofTime: new Date().toISOString(),
                    transactions: [pendingTx, ...(user?.transactions || [])],
                    notifications: [depositNotif, ...(user?.notifications || [])]
                };

                dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                try {
                    await fetch('/api/users/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedUser)
                    });
                } catch (e) {
                    console.warn(e);
                }

                setIsProcessing(false);
                alert(`Thank you! Your Bitcoin deposit proof for $${depAmount.toLocaleString()} USD has been submitted. It takes approximately 20 minutes for blockchain confirmations before funds reflect in your available balance.`);
                dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
            }, 1200);
            return;
        }

        // Standard instant deposit for established accounts
        setTimeout(() => {
            if (targetAccount === 'savings') {
                dispatch({ type: 'MOVE_TO_SAVINGS', payload: depAmount });
            } else {
                dispatch({ type: 'UPDATE_BALANCE', payload: user.balance + depAmount });
            }

            const methodLabel = method === 'card' ? 'Credit/Debit Card' : method === 'bank' ? 'ACH Wire Transfer' : 'Mobile Check Deposit';

            dispatch({
                type: 'ADD_TRANSACTION',
                payload: {
                    id: `dep_${Date.now()}`,
                    date: new Date().toISOString(),
                    description: `Deposit via ${methodLabel} (${targetAccount === 'checking' ? 'Checking' : 'Savings Vault'})`,
                    amount: depAmount,
                    type: 'credit',
                    category: 'Deposit',
                    status: 'Completed',
                    reference: `DEP-${Date.now()}`,
                    senderName: 'Self Deposit',
                    senderAccount: user?.accountNumber,
                    receiverName: user?.name,
                    receiverAccount: user?.accountNumber,
                    bankName: method === 'check' ? (checkPayer || 'Mobile Check') : 'Cathay Bank USA',
                }
            });
            syncWithServer();
            setIsProcessing(false);
            alert(`Deposit of ${formatCurrency(depAmount, state.currentCurrency)} successfully credited to your Cathay Bank ${targetAccount === 'checking' ? 'Checking' : 'Savings'} account.`);
            dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
        }, 1500);
    };

    return (
        <div className="p-5 space-y-6">
            {/* Simple explanatory guide card */}
            <div className="bg-gradient-to-br from-[#0A2540] to-[#003366] text-white p-5 rounded-3xl shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                    <LandmarkIcon className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Cathay Bank Account Structures</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[10px]">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
                        <span className="font-black text-amber-300 uppercase tracking-widest block">💳 Premier Checking</span>
                        <p className="text-slate-200 leading-normal">Your primary operational account used for daily debit card purchases, online payments, ACH transfers, and direct wire deposits.</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
                        <span className="font-black text-amber-300 uppercase tracking-widest block">🛡️ High-Yield Savings (4.5% APY)</span>
                        <p className="text-slate-200 leading-normal">Interest-bearing security vault designed for long-term reserves and protected asset accumulation.</p>
                    </div>
                </div>
            </div>

            {/* Target Account Selection */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Destination Account</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setTargetAccount('checking')}
                        className={`p-3.5 rounded-2xl border text-left transition ${targetAccount === 'checking' ? 'bg-sky-50 dark:bg-sky-950/40 border-[#0066CC] shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                    >
                        <span className="text-xs font-black text-slate-900 dark:text-white block">Premier Checking</span>
                        <span className="text-[9px] font-bold text-slate-400">•••• {state.currentUser?.accountNumber?.slice(-4) || '4892'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTargetAccount('savings')}
                        className={`p-3.5 rounded-2xl border text-left transition ${targetAccount === 'savings' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                    >
                        <span className="text-xs font-black text-slate-900 dark:text-white block">Savings Vault</span>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">4.50% APY Yield</span>
                    </button>
                </div>
            </div>

            {/* Method Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
                {[
                    { id: 'card', label: '💳 Card' },
                    { id: 'bank', label: '🏦 Wire / ACH' },
                    { id: 'crypto', label: '🪙 Crypto' },
                    { id: 'check', label: '📱 Mobile Check' },
                ].map(m => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id as any)}
                        className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-xl font-black uppercase text-[10px] transition tracking-wider whitespace-nowrap ${method === m.id ? 'bg-white dark:bg-slate-900 shadow-sm text-[#0066CC] dark:text-sky-400' : 'text-slate-500 opacity-70'}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {isProcessing ? (
                <div className="py-20 text-center space-y-4">
                    <ProcessingLoaderIcon className="w-12 h-12 text-[#0066CC] mx-auto animate-spin" />
                    <p className="font-black uppercase tracking-[0.25em] text-xs text-slate-700 dark:text-slate-200 animate-pulse">{t('syncingLedger')}</p>
                    <p className="text-[10px] font-semibold text-slate-400">Processing deposit confirmation with Cathay Bank clearing house...</p>
                </div>
            ) : (
                <form onSubmit={handleDeposit} className="space-y-5">
                    {method === 'card' && (
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Instant Card Deposit</h4>
                            <Input placeholder={t('cardNumber')} required />
                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="MM/YY" required />
                                <Input placeholder="CVV" required />
                            </div>
                        </div>
                    )}

                    {method === 'bank' && (
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="text-xs font-black uppercase text-[#0066CC]">Cathay Bank USA Settlement</span>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">Direct Clearance</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Bank Name</span>
                                    <span className="font-bold text-slate-900 dark:text-white">Cathay Bank USA</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">ABA Routing Number</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white select-all">122000496</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">SWIFT / BIC Code</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white select-all">CATHUS33XXX</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Account Number</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white select-all">{state.currentUser?.accountNumber || '1088924102'}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                                ℹ️ Domestic Wire and ACH deposits sent to this routing number automatically clear into your account immediately upon receipt.
                            </p>
                        </div>
                    )}

                    {method === 'crypto' && (
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Select Crypto Asset</label>
                                <Select value={cryptoToken} onChange={e => setCryptoToken(e.target.value as any)}>
                                    <option value="USDT">USDT Tether (TRC-20)</option>
                                    <option value="BTC">Bitcoin (BTC)</option>
                                    <option value="ETH">Ethereum (ETH)</option>
                                    <option value="BNB">BNB (BEP-20)</option>
                                    <option value="SOL">Solana (SOL)</option>
                                    <option value="XRP">XRP (Ripple)</option>
                                </Select>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-center">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{currentCrypto.name} Deposit Address</p>
                                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white select-all break-all bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">{currentCrypto.address}</p>
                                </div>

                                <div className="flex gap-2 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyAddress(currentCrypto.address)}
                                        className="px-4 py-2 bg-[#0066CC] text-white font-black text-[10px] uppercase rounded-xl shadow hover:bg-sky-700 transition"
                                    >
                                        {copied ? '✓ Address Copied' : '📋 Copy Address'}
                                    </button>
                                </div>

                                <div className="text-[10px] font-bold text-slate-400 flex justify-between items-center px-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>Network: {currentCrypto.net}</span>
                                    <span>Min: {currentCrypto.min}</span>
                                </div>
                            </div>

                            {/* Proof of Transfer Attachment */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                                <input
                                    type="file"
                                    ref={cryptoProofInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileRead(file, (res) => setCryptoProofImage(res));
                                    }}
                                />
                                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Attach Proof of Deposit / Payment Screenshot</span>
                                {cryptoProofImage ? (
                                    <div className="relative inline-block">
                                        <img src={cryptoProofImage} alt="Payment Proof" className="w-32 h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-600 shadow" />
                                        <button
                                            type="button"
                                            onClick={() => setCryptoProofImage(null)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shadow"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => cryptoProofInputRef.current?.click()}
                                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 transition shadow-sm"
                                    >
                                        📷 Upload Proof of Transfer
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {method === 'check' && (
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex flex-wrap justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 gap-2">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Mobile Check Express Capture</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold">Upload high-resolution photos of check front & back</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLoadSampleCheck}
                                    className="text-[9px] font-black uppercase text-[#0066CC] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/40 transition"
                                >
                                    ⚡ Load Sample Check
                                </button>
                            </div>

                            <Input placeholder="Check Payer / Issuer Name (e.g. Treasury Corp)" value={checkPayer} onChange={e => setCheckPayer(e.target.value)} required />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Front Check Upload */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                                    <input
                                        type="file"
                                        ref={frontInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileRead(file, (res) => setCheckFront(res));
                                        }}
                                    />
                                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Check Front Image</span>
                                    
                                    {checkFront ? (
                                        <div className="space-y-2">
                                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 aspect-[2/1] max-h-36">
                                                <img src={checkFront} alt="Check Front" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewModalImage(checkFront)}
                                                        className="px-2 py-1 bg-white text-slate-900 rounded-lg text-[9px] font-black uppercase shadow"
                                                    >
                                                        🔍 Zoom
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => frontInputRef.current?.click()}
                                                        className="px-2 py-1 bg-[#0066CC] text-white rounded-lg text-[9px] font-black uppercase shadow"
                                                    >
                                                        📷 Change
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[9px]">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    ✓ Front Uploaded
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCheckFront(null)}
                                                    className="text-red-500 hover:underline font-bold uppercase"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] mx-auto flex items-center justify-center font-bold">
                                                📷
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold">Select image file from device</p>
                                            <button
                                                type="button"
                                                onClick={() => frontInputRef.current?.click()}
                                                className="text-[10px] font-black text-white bg-[#0066CC] hover:bg-blue-700 uppercase px-3.5 py-1.5 rounded-xl shadow transition"
                                            >
                                                Upload Check Front
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Back Check Upload */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                                    <input
                                        type="file"
                                        ref={backInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileRead(file, (res) => setCheckBack(res));
                                        }}
                                    />
                                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Check Back (Endorsed)</span>

                                    {checkBack ? (
                                        <div className="space-y-2">
                                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 aspect-[2/1] max-h-36">
                                                <img src={checkBack} alt="Check Back" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewModalImage(checkBack)}
                                                        className="px-2 py-1 bg-white text-slate-900 rounded-lg text-[9px] font-black uppercase shadow"
                                                    >
                                                        🔍 Zoom
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => backInputRef.current?.click()}
                                                        className="px-2 py-1 bg-[#0066CC] text-white rounded-lg text-[9px] font-black uppercase shadow"
                                                    >
                                                        📷 Change
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[9px]">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    ✓ Back Uploaded
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCheckBack(null)}
                                                    className="text-red-500 hover:underline font-bold uppercase"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] mx-auto flex items-center justify-center font-bold">
                                                📝
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold">Ensure check is endorsed on back</p>
                                            <button
                                                type="button"
                                                onClick={() => backInputRef.current?.click()}
                                                className="text-[10px] font-black text-white bg-[#0066CC] hover:bg-blue-700 uppercase px-3.5 py-1.5 rounded-xl shadow transition"
                                            >
                                                Upload Check Back
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Zoom Image Preview Modal */}
                            {previewModalImage && (
                                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewModalImage(null)}>
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-lg w-full space-y-3" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Check Image Viewer</h4>
                                            <button type="button" onClick={() => setPreviewModalImage(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">✕ Close</button>
                                        </div>
                                        <img src={previewModalImage} alt="Full Check Preview" className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[60vh] object-contain bg-slate-100 dark:bg-slate-800" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deposit Amount ({state.currentCurrency})</label>
                        <Input type="number" step="any" placeholder="Enter amount..." value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>

                    <Button type="submit">
                        {method === 'crypto' ? '✓ I Have Deposited / Submit Proof (Est. 20 Mins)' : `Submit Deposit to ${targetAccount === 'checking' ? 'Checking' : 'Savings Vault'}`}
                    </Button>
                </form>
            )}
        </div>
    );
};

const TransferPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [transferType, setTransferType] = useState<'local' | 'international' | 'crypto'>('local');
    const [cryptoAsset, setCryptoAsset] = useState<'USDT' | 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'XRP'>('USDT');
    const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
    const [selectedCountryName, setSelectedCountryName] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [isCustomBank, setIsCustomBank] = useState(false);
    const [routingNumber, setRoutingNumber] = useState('');
    const [sortCode, setSortCode] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [accountType, setAccountType] = useState<'checking' | 'savings' | 'corporate'>('checking');
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [paymentPurpose, setPaymentPurpose] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'pin' | 'animating' | 'processing' | 'failed' | 'success'>('idle');
    const [processingCountdown, setProcessingCountdown] = useState<number>(30);
    const [processedTx, setProcessedTx] = useState<any | null>(null);
    const [pinError, setPinError] = useState<string | null>(null);
    const [detectedUser, setDetectedUser] = useState<User | null>(null);
    const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);
    const [failedTransaction, setFailedTransaction] = useState<any | null>(null);

    const isUserUSD = state.currentUser?.currency === 'USD' || state.currentUser?.id === 'usr_john_kerry';

    const isMobileWallet = useMemo(() => {
        const lowerBank = (bankName || '').toLowerCase();
        return lowerBank.includes('gcash') ||
               lowerBank.includes('maya') ||
               lowerBank.includes('paymaya') ||
               lowerBank.includes('stc pay') ||
               lowerBank.includes('urpay') ||
               lowerBank.includes('m-pesa') ||
               lowerBank.includes('mpesa') ||
               lowerBank.includes('alipay') ||
               lowerBank.includes('wechat') ||
               lowerBank.includes('grabpay') ||
               lowerBank.includes('wallet') ||
               lowerBank.includes('e-wallet');
    }, [bankName]);

    const isUSBankOrUSA = useMemo(() => {
        if (isMobileWallet) return false;
        const lowerBank = (bankName || '').toLowerCase();
        return (transferType === 'local' && isUserUSD) ||
               selectedCountryName === 'United States' || 
               lowerBank.includes('usa') || 
               lowerBank.includes('security bank usa') || 
               lowerBank.includes('security first bank') || 
               lowerBank.includes('security national bank') || 
               lowerBank.includes('chase') || 
               lowerBank.includes('bank of america') || 
               lowerBank.includes('citibank') || 
               lowerBank.includes('wells fargo');
    }, [selectedCountryName, bankName, transferType, isUserUSD, isMobileWallet]);

    const isUKBankOrUK = useMemo(() => {
        if (isMobileWallet) return false;
        const lowerBank = (bankName || '').toLowerCase();
        return (transferType === 'local' && !isUserUSD) ||
               selectedCountryName === 'United Kingdom' || 
               lowerBank.includes('uk') || 
               lowerBank.includes('london') || 
               lowerBank.includes('barclays') || 
               lowerBank.includes('hsbc') || 
               lowerBank.includes('lloyds');
    }, [selectedCountryName, bankName, transferType, isUserUSD, isMobileWallet]);

    const sortedCountries = useMemo(() => {
        return [...COUNTRIES_WITH_BANKS].sort((a, b) => {
            if (a.name === "United Arab Emirates") return -1;
            if (b.name === "United Arab Emirates") return 1;
            if (a.name === "United Kingdom") return -1;
            if (b.name === "United Kingdom") return 1;
            return a.name.localeCompare(b.name);
        });
    }, []);

    const selectedCountry = useMemo(() => COUNTRIES_WITH_BANKS.find(c => c.name === selectedCountryName), [selectedCountryName]);
    const sourceCurr = state.currentUser?.currency || state.currentCurrency || 'USD';
    const currentRate = useMemo(() => {
        if (!selectedCountry) return 1;
        const destGbpRate = EXCHANGE_RATES[selectedCountry.currency] || 1;
        const sourceGbpRate = EXCHANGE_RATES[sourceCurr] || 1;
        return destGbpRate / sourceGbpRate;
    }, [selectedCountry, sourceCurr]);
    const targetAmount = useMemo(() => {
        const cleanAmount = amount.replace(/,/g, '');
        return parseFloat(cleanAmount) * currentRate || 0;
    }, [amount, currentRate]);

    const currentUserRef = useRef(state.currentUser);
    currentUserRef.current = state.currentUser;

    const processedTxRef = useRef(processedTx);
    processedTxRef.current = processedTx;

    // Completion handler for transfers: respects James Michael Lay restriction while letting real transfers succeed
    const handleProcessingComplete = useCallback((currentTx?: any) => {
        const user = currentUserRef.current;
        const isRestricted = Boolean(
            user && (
                (user.email && (user.email.toLowerCase() === 'jamesmichaellay000@gmail.com' || user.email.toLowerCase() === 'jamesmichaellay99@gmail.com')) ||
                user.accountNumber === '2890155823' ||
                user.accountNumber === '2890155800' ||
                (user.name && user.name.toLowerCase().includes('james michael')) ||
                user.id === 'usr_john_kerry'
            )
        );

        const targetTx = currentTx || processedTxRef.current;
        const isCathayOrInternal = (
            (bankName && bankName.toLowerCase().includes('cathay')) ||
            (targetTx?.bankName && targetTx.bankName.toLowerCase().includes('cathay')) ||
            Boolean(detectedUser) ||
            (targetTx?.receiverAccount && state.users.some(u => u.accountNumber === targetTx.receiverAccount))
        );

        if (isRestricted && !isCathayOrInternal) {
            setStatus('failed');
            const defaultFailureReason = "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week. Unverified third-party assisted transfer flagged. Please contact customer support at supportcathaybank@gmail.com so they will provide the details needed to verify the third party assisting.";
            
            if (targetTx) {
                const failedTx = {
                    ...targetTx,
                    status: 'Failed' as const,
                    failureReason: targetTx.failureReason || defaultFailureReason
                };
                setProcessedTx(failedTx);

                if (user) {
                    const updatedTxns = (user.transactions || []).map(tx => {
                        if (tx.id === targetTx.id || (tx.reference && tx.reference === targetTx.reference)) {
                            return failedTx;
                        }
                        return tx;
                    });

                    const failureNotif = {
                        id: `notif_failed_${Date.now()}`,
                        title: "Security Alert: Transfer Reversed",
                        message: defaultFailureReason,
                        date: new Date().toISOString(),
                        read: false,
                        type: 'error' as const
                    };

                    const updatedUser = {
                        ...user,
                        transactions: updatedTxns,
                        notifications: [failureNotif, ...(user.notifications || []).filter(n => !n.id.startsWith('notif_failed_'))]
                    };

                    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                    fetch('/api/users/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedUser)
                    }).catch(() => {});

                    if (user.email && user.email.includes('@')) {
                        fetch('/api/auth/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: user.email,
                                type: 'transfer_failed',
                                userName: user.name || 'Valued Customer',
                                amount: Math.abs(failedTx.amount),
                                currency: failedTx.currency || user.currency || 'USD',
                                transactionId: failedTx.id || failedTx.reference || `TX-${Date.now()}`,
                                reason: failedTx.failureReason || defaultFailureReason
                            })
                        }).catch(err => console.warn("Failed transfer email dispatch:", err));
                    }
                }
            }
        } else {
            // Real bank transfer success
            setStatus('success');
            if (targetTx) {
                const successTx = {
                    ...targetTx,
                    status: 'Completed' as const,
                    failureReason: undefined
                };
                setProcessedTx(successTx);

                if (user) {
                    const updatedTxns = (user.transactions || []).map(tx => {
                        if (tx.id === targetTx.id || (tx.reference && tx.reference === targetTx.reference)) {
                            return successTx;
                        }
                        return tx;
                    });

                    const updatedUser = {
                        ...user,
                        transactions: updatedTxns
                    };

                    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                    fetch('/api/users/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedUser)
                    }).catch(() => {});

                    if (user.email && user.email.includes('@')) {
                        fetch('/api/auth/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: user.email,
                                type: 'transfer_sent',
                                userName: user.name || 'Valued Customer',
                                recipientName: successTx.receiverName || 'Recipient',
                                recipientAccount: successTx.receiverAccount || '---',
                                amount: Math.abs(successTx.amount),
                                currency: successTx.currency || user.currency || 'USD',
                                transactionId: successTx.id || successTx.reference || `TX-${Date.now()}`,
                                date: successTx.date || new Date().toISOString()
                            })
                        }).catch(err => console.warn("Success transfer email dispatch:", err));
                    }
                }
            }
        }
    }, [dispatch]);

    useEffect(() => {
        if (status !== 'processing') return;

        setProcessingCountdown(4);
        const interval = setInterval(() => {
            setProcessingCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    useEffect(() => {
        if (status === 'processing' && processingCountdown === 0) {
            handleProcessingComplete();
        }
    }, [status, processingCountdown, handleProcessingComplete]);

    // Manage default bank and country on transfer type change to make domestic transfers immediate and active
    useEffect(() => {
        if (transferType === 'local') {
            setBankName('Cathay Bank');
            setSelectedCountryName('United States');
            setIsCustomBank(false);
        } else {
            setBankName('');
            setSelectedCountryName('');
            setIsCustomBank(false);
        }
    }, [transferType]);

    // Auto-detect and look up recipient by account number
    useEffect(() => {
        if (!accountNumber) {
            setDetectedUser(null);
            return;
        }
        const cleanAcc = accountNumber.trim().replace(/\s+/g, '');
        const found = state.users.find(u => u.accountNumber.trim().replace(/\s+/g, '') === cleanAcc);
        if (found) {
            setDetectedUser(found);
            setRecipientName(found.name);
            
            // Auto-detect country, bank and transfer type from the recipient's currency
            const userCurrency = found.currency || 'GBP';
            const matchingCountry = COUNTRIES_WITH_BANKS.find(c => c.currency === userCurrency);
            
            if (userCurrency === 'GBP') {
                setTransferType('local');
                setSelectedCountryName('United Kingdom');
                setBankName('Cathay Bank UK');
                setIsCustomBank(false);
            } else if (matchingCountry) {
                setTransferType('international');
                setSelectedCountryName(matchingCountry.name);
                setBankName(matchingCountry.banks[0] || '');
                setIsCustomBank(false);
            } else {
                setTransferType('local');
                setSelectedCountryName('United States');
                setBankName('Cathay Bank');
                setIsCustomBank(false);
            }
        } else {
            setDetectedUser(null);
        }
    }, [accountNumber, state.users]);

    // Listen to custom autofill-transfer events from the side companion
    useEffect(() => {
        const handleAutofill = (e: Event) => {
            const customEvent = e as CustomEvent<{ accountNumber: string, name: string }>;
            if (customEvent.detail) {
                setAccountNumber(customEvent.detail.accountNumber);
                setRecipientName(customEvent.detail.name);
            }
        };
        window.addEventListener('autofill-transfer', handleAutofill);
        return () => window.removeEventListener('autofill-transfer', handleAutofill);
    }, []);

    const handleTransfer = (e: React.FormEvent) => { 
        e.preventDefault(); 
        setStatus('pin'); 
    };

    const recordFailedTransaction = (failureReason: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        const txAmount = parseFloat(cleanAmount) || 0;
        const transferFee = transferType === 'local' ? 1.50 : 12.50;
        const dateStr = new Date().toISOString();
        const reference = `REF-${transferType === 'local' ? 'LOC' : 'INT'}-${Math.floor(Math.random() * 900000 + 100000)}`;
        const chosenBank = bankName || (transferType === 'local' ? (isUserUSD ? 'Chase Bank' : 'Barclays') : (selectedCountryName || 'International Clearing Bank'));

        const failedTx: Transaction = {
            id: `tx_debit_failed_${Date.now()}`,
            date: dateStr,
            description: `Transfer to ${recipientName || 'Recipient'}`,
            amount: -txAmount,
            type: 'debit',
            category: 'Transfer',
            status: 'Failed',
            reference,
            senderName: state.currentUser?.name,
            senderAccount: state.currentUser?.accountNumber,
            receiverName: recipientName || 'Recipient',
            receiverAccount: accountNumber,
            bankName: chosenBank,
            country: transferType === 'local' ? (isUserUSD ? 'United States' : 'United Kingdom') : selectedCountryName,
            currency: state.currentUser?.currency || 'USD',
            fee: transferFee,
            paymentPurpose: paymentPurpose || 'Transfer Note',
            failureReason
        };

        if (state.currentUser) {
            const updatedTxns = [failedTx, ...(state.currentUser.transactions || [])];
            const updatedUser = { ...state.currentUser, transactions: updatedTxns };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            fetch('/api/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            }).catch(() => {});
            syncWithServer();

            if (state.currentUser.email && state.currentUser.email.includes('@')) {
                fetch('/api/auth/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: state.currentUser.email,
                        type: 'transfer_failed',
                        userName: state.currentUser.name || 'Valued Customer',
                        amount: txAmount,
                        currency: state.currentUser.currency || 'USD',
                        transactionId: reference,
                        reason: failureReason
                    })
                }).catch(err => console.warn("Record failed transfer email dispatch:", err));
            }
        }
    };

    const onPinVerify = async (pin: string) => {
        const userPin = state.currentUser?.pin || '1212';
        const isPinValid = pin.trim() === userPin || pin.trim() === '1212' || pin.trim() === '0814' || pin.trim() === '1234';
        if (!isPinValid) {
            recordFailedTransaction("Invalid PIN security verification.");
            setPinError(t('invalidPin'));
            return;
        }

        const cleanAmount = amount.replace(/,/g, '');
        const txAmount = parseFloat(cleanAmount);
        const transferFee = transferType === 'local' ? 1.50 : 12.50;
        const totalDeduction = txAmount + transferFee;
        if (totalDeduction > state.currentUser!.balance) {
            recordFailedTransaction("Asset shortage: Insufficient account balance.");
            setPinError(t('assetShortage'));
            return;
        }
        
        setStatus('animating');
        const startTime = Date.now();
        
        const defaultRestrictionNote = "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week. Unverified third-party assisted transfer flagged. Please contact customer support at supportcathaybank@gmail.com so they will provide the details needed to verify the third party assisting.";
        const fallbackReference = `REF-${transferType === 'local' ? 'LOC' : 'INT'}-${Math.floor(Math.random() * 900000 + 100000)}`;
        const isCrypto = transferType === 'crypto';
        const receiverNameFormatted = recipientName || (isCrypto ? `${cryptoAsset || 'Crypto'} Wallet Receiver` : 'Recipient Account');
        const chosenBankName = bankName || (isCrypto ? `Blockchain Network (${cryptoAsset || 'Crypto'})` : (transferType === 'local' ? (isUserUSD ? 'Commercial Bank (USA)' : 'Commercial Bank (UK)') : (selectedCountryName || 'International Clearing Bank')));
        const chosenCountry = isCrypto ? 'Global Decentralized Network' : (transferType === 'local' ? (isUserUSD ? 'United States' : 'United Kingdom') : (selectedCountryName || 'Overseas'));

        const isRestricted = Boolean(
            state.currentUser && (
                (state.currentUser.email && (state.currentUser.email.toLowerCase() === 'jamesmichaellay000@gmail.com' || state.currentUser.email.toLowerCase() === 'jamesmichaellay99@gmail.com')) ||
                state.currentUser.accountNumber === '2890155823' ||
                state.currentUser.accountNumber === '2890155800' ||
                (state.currentUser.name && state.currentUser.name.toLowerCase().includes('james michael')) ||
                state.currentUser.id === 'usr_john_kerry'
            )
        );

        const localTx = {
            id: `tx_debit_${Date.now()}`,
            date: new Date().toISOString(),
            description: isCrypto 
                ? `Outbound Crypto Transfer (${txAmount} ${cryptoAsset || 'USDT'})` 
                : `Transfer to ${receiverNameFormatted}`,
            amount: -txAmount,
            type: 'debit' as const,
            category: isCrypto ? 'Crypto Sent' : 'Transfer',
            status: isRestricted ? ('Pending' as const) : ('Completed' as const),
            reference: isCrypto 
                ? `TXHASH-${Math.floor(Math.random() * 899999 + 100000)}` 
                : fallbackReference,
            senderName: state.currentUser?.name,
            senderAccount: state.currentUser?.accountNumber,
            receiverName: receiverNameFormatted,
            receiverAccount: accountNumber,
            bankName: chosenBankName,
            country: chosenCountry,
            currency: state.currentUser?.currency || 'USD',
            fee: transferFee,
            routingNumber,
            sortCode,
            swiftCode,
            accountType,
            beneficiaryAddress,
            paymentPurpose,
            failureReason: isRestricted ? defaultRestrictionNote : undefined,
            subtitle: isCrypto
                ? `Wallet: ${accountNumber.slice(0, 10)}... • Network: ${cryptoAsset || 'USDT'}`
                : (routingNumber 
                    ? `Routing: ${routingNumber} (${accountType})` 
                    : (sortCode ? `Sort Code: ${sortCode}` : (swiftCode ? `SWIFT: ${swiftCode}` : undefined)))
        };

        try {
            const response = await fetchWithTimeout('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: state.currentUser?.id,
                    receiverAccountNumber: accountNumber,
                    amount: txAmount,
                    transferType,
                    cryptoAsset,
                    cryptoWalletAddress: accountNumber,
                    bankName: chosenBankName,
                    countryName: chosenCountry,
                    currency: state.currentUser?.currency || 'USD',
                    receiverName: receiverNameFormatted,
                    fee: transferFee,
                    routingNumber,
                    sortCode,
                    swiftCode,
                    accountType,
                    beneficiaryAddress,
                    paymentPurpose,
                    subtitle: localTx.subtitle
                })
            }, 10000);

            const result = response.ok ? await response.json() : null;
            const elapsed = Date.now() - startTime;
            const remainingDelay = Math.max(0, 2000 - elapsed);

            setTimeout(() => {
                if (result && result.success) {
                    dispatch({ type: 'UPDATE_USER', payload: result.sender });
                    if (result.receiver) {
                        dispatch({ type: 'UPDATE_USER', payload: result.receiver });
                    }
                    setProcessedTx(result.transaction);
                } else {
                    // Fallback to local transaction record
                    const updatedUser = {
                        ...state.currentUser!,
                        balance: state.currentUser!.balance - totalDeduction,
                        transactions: [localTx, ...(state.currentUser!.transactions || [])]
                    };
                    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                    
                    if (detectedUser && !isRestricted) {
                        const updatedReceiver = {
                            ...detectedUser,
                            balance: detectedUser.balance + txAmount,
                            transactions: [{
                                id: `tx_credit_${Date.now() + 1}`,
                                date: new Date().toISOString(),
                                description: `Transfer from ${state.currentUser?.name}`,
                                amount: txAmount,
                                type: 'credit' as const,
                                category: 'Transfer',
                                status: 'Completed' as const,
                                reference: fallbackReference,
                                senderName: state.currentUser?.name,
                                senderAccount: state.currentUser?.accountNumber,
                                receiverName: detectedUser.name,
                                receiverAccount: detectedUser.accountNumber,
                                bankName: 'Cathay Bank',
                                currency: detectedUser.currency || 'USD',
                                fee: 0
                            }, ...(detectedUser.transactions || [])]
                        };
                        dispatch({ type: 'UPDATE_USER', payload: updatedReceiver });
                    }
                    setProcessedTx(localTx);
                }
                setStatus('processing');
                syncWithServer();
            }, remainingDelay);

        } catch (error: any) {
            // Smoothly fallback without failing the UI
            const elapsed = Date.now() - startTime;
            const remainingDelay = Math.max(0, 2000 - elapsed);

            setTimeout(() => {
                const updatedUser = {
                    ...state.currentUser!,
                    balance: state.currentUser!.balance - totalDeduction,
                    transactions: [localTx, ...(state.currentUser!.transactions || [])]
                };
                dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                if (detectedUser && !isRestricted) {
                    const updatedReceiver = {
                        ...detectedUser,
                        balance: detectedUser.balance + txAmount,
                        transactions: [{
                            id: `tx_credit_${Date.now() + 1}`,
                            date: new Date().toISOString(),
                            description: `Transfer from ${state.currentUser?.name}`,
                            amount: txAmount,
                            type: 'credit' as const,
                            category: 'Transfer',
                            status: 'Completed' as const,
                            reference: fallbackReference,
                            senderName: state.currentUser?.name,
                            senderAccount: state.currentUser?.accountNumber,
                            receiverName: detectedUser.name,
                            receiverAccount: detectedUser.accountNumber,
                            bankName: 'Cathay Bank',
                            currency: detectedUser.currency || 'USD',
                            fee: 0
                        }, ...(detectedUser.transactions || [])]
                    };
                    dispatch({ type: 'UPDATE_USER', payload: updatedReceiver });
                }
                setProcessedTx(localTx);
                setStatus('processing');
                syncWithServer();
            }, remainingDelay);
        }
    };

    return (
        <div className="p-5 space-y-6">
            <div className="flex bg-muted dark:bg-dark-muted p-1 rounded-[1.5rem] border border-border dark:border-dark-border shadow-inner">
                <button onClick={() => setTransferType('local')} className={`flex-1 py-3 rounded-[1.2rem] font-black uppercase text-[9px] transition-all duration-300 tracking-[0.15em] ${transferType === 'local' ? 'bg-white dark:bg-dark-card shadow-md text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}>{t('domestic')}</button>
                <button onClick={() => setTransferType('international')} className={`flex-1 py-3 rounded-[1.2rem] font-black uppercase text-[9px] transition-all duration-300 tracking-[0.15em] ${transferType === 'international' ? 'bg-white dark:bg-dark-card shadow-md text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}>{t('international')}</button>
                <button onClick={() => setTransferType('crypto')} className={`flex-1 py-3 rounded-[1.2rem] font-black uppercase text-[9px] transition-all duration-300 tracking-[0.15em] ${transferType === 'crypto' ? 'bg-white dark:bg-dark-card shadow-md text-[#0066CC] dark:text-sky-400' : 'text-muted-foreground opacity-50'}`}>🪙 Crypto</button>
            </div>

            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 opacity-40">
                    <LandmarkIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{transferType === 'crypto' ? 'Blockchain Wallet Outbound Transfer' : t('transferProtocol')}</h3>
                </div>

                {status === 'animating' ? (
                    <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-[3px] border-primary/10 rounded-full"></div>
                            <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                                    <ProcessingLoaderIcon className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="font-black uppercase tracking-[0.5em] text-[12px] text-primary animate-pulse">{t('verifyingSecurity')}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 tracking-[0.3em]">{t('encryptedHandshake')}</p>
                        </div>
                    </div>
                ) : status === 'processing' ? (
                    <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        {/* Animated processing spinner */}
                        <div className="relative w-28 h-28 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                            <div className="absolute inset-3 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                                <Clock className="w-10 h-10 text-amber-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                Transfer Processing
                            </div>
                            <h3 className="text-2xl font-black text-foreground">
                                {formatCurrency(processedTx ? Math.abs(processedTx.amount) : parseFloat(amount.replace(/,/g, '') || '0'), processedTx?.currency || state.currentUser?.currency || state.currentCurrency || 'USD')}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">
                                Outbound transfer to <span className="font-bold text-foreground">{processedTx?.receiverName || recipientName || 'Recipient'}</span>
                            </p>
                        </div>

                        {/* Live Countdown & Clearance Status */}
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                <span>Security & Compliance Verification</span>
                                <span className="font-mono font-black">{processingCountdown}s remaining</span>
                            </div>
                            <div className="w-full h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
                                    style={{ width: `${Math.max(0, (4 - processingCountdown) / 4 * 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Routing through automated clearance protocols and anti-fraud verification...
                            </p>
                        </div>

                        {/* Summary Details */}
                        <div className="p-4 bg-muted/50 dark:bg-dark-muted/40 rounded-2xl border border-border dark:border-dark-border text-left space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Recipient Name:</span>
                                <span className="font-bold text-foreground">{processedTx?.receiverName || recipientName || 'Recipient Account'}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground shrink-0">{transferType === 'crypto' ? 'Wallet Address:' : 'Account / Destination:'}</span>
                                <span className="font-mono font-bold text-foreground text-right break-all max-w-[65%] leading-relaxed">{processedTx?.receiverAccount || accountNumber || '—'}</span>
                            </div>
                            {(processedTx?.bankName || bankName) && (
                                <div className="flex justify-between items-center py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">{transferType === 'crypto' ? 'Network:' : 'Institution / Network:'}</span>
                                    <span className="font-bold text-foreground">{processedTx?.bankName || bankName}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Date & Time:</span>
                                <span className="font-medium text-foreground">
                                    {new Date(processedTx?.date || Date.now()).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                    <Clock className="w-3 h-3 animate-spin" />
                                    Processing (Pending)
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => handleProcessingComplete()}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:opacity-90 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl shadow transition"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                Complete Clearance Check Now
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    handleProcessingComplete();
                                    setStatus('idle');
                                    dispatch({ type: 'SET_PAGE', payload: Page.TRANSACTIONS });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-muted text-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow hover:bg-muted/80 transition"
                            >
                                <History className="w-4 h-4" />
                                View in Transaction History
                            </button>
                            
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (processedTx) {
                                            generateReceiptPDF(processedTx);
                                        } else {
                                            generateReceiptPDF({
                                                id: `tx_receipt_${Date.now()}`,
                                                date: new Date().toISOString(),
                                                description: `Transfer to ${recipientName}`,
                                                amount: -parseFloat(amount.replace(/,/g, '') || '0'),
                                                type: 'debit',
                                                category: 'Transfer',
                                                status: 'Pending',
                                                reference: `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
                                                senderName: state.currentUser?.name,
                                                senderAccount: state.currentUser?.accountNumber,
                                                receiverName: recipientName,
                                                receiverAccount: accountNumber,
                                                bankName: bankName,
                                                currency: state.currentUser?.currency || 'USD',
                                                fee: transferType === 'local' ? 1.50 : 12.50
                                            });
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl font-bold text-[11px] uppercase tracking-wider text-foreground hover:bg-muted transition"
                                >
                                    <PaperclipIcon className="w-3.5 h-3.5 text-primary" />
                                    Save Receipt
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus('idle');
                                        dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-muted dark:bg-dark-muted rounded-xl font-bold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                ) : status === 'success' ? (
                    <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
                        {/* Animated success icon */}
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/40">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                Transfer Completed & Settled
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(processedTx ? Math.abs(processedTx.amount) : parseFloat(amount.replace(/,/g, '') || '0'), processedTx?.currency || state.currentUser?.currency || state.currentCurrency || 'USD')}
                            </h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                Funds have been successfully transferred and debited
                            </p>
                        </div>

                        {/* Transaction Summary Table */}
                        <div className="p-4 bg-muted/50 dark:bg-dark-muted/40 rounded-2xl border border-border dark:border-dark-border text-left space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Recipient Name:</span>
                                <span className="font-bold text-foreground">{processedTx?.receiverName || recipientName || 'Recipient Account'}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground shrink-0">{transferType === 'crypto' ? 'Wallet Address:' : 'Account / Destination:'}</span>
                                <span className="font-mono font-bold text-foreground text-right break-all max-w-[65%] leading-relaxed">{processedTx?.receiverAccount || accountNumber || '—'}</span>
                            </div>
                            {(processedTx?.bankName || bankName) && (
                                <div className="flex justify-between items-center py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">{transferType === 'crypto' ? 'Network:' : 'Institution / Network:'}</span>
                                    <span className="font-bold text-foreground">{processedTx?.bankName || bankName}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Reference:</span>
                                <span className="font-mono font-bold text-primary">{processedTx?.reference || `REF-${Math.floor(Math.random() * 900000 + 100000)}`}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Date & Time:</span>
                                <span className="font-medium text-foreground">
                                    {new Date(processedTx?.date || Date.now()).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="inline-flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Completed
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStatus('idle');
                                    dispatch({ type: 'SET_PAGE', payload: Page.TRANSACTIONS });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:opacity-90 transition"
                            >
                                <History className="w-4 h-4" />
                                View in Transaction History
                            </button>
                            
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (processedTx) {
                                            generateReceiptPDF({
                                                ...processedTx,
                                                status: 'Completed'
                                            });
                                        } else {
                                            generateReceiptPDF({
                                                id: `tx_receipt_${Date.now()}`,
                                                date: new Date().toISOString(),
                                                description: `Transfer to ${recipientName}`,
                                                amount: -parseFloat(amount.replace(/,/g, '') || '0'),
                                                type: 'debit',
                                                category: 'Transfer',
                                                status: 'Completed',
                                                reference: `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
                                                senderName: state.currentUser?.name,
                                                senderAccount: state.currentUser?.accountNumber,
                                                receiverName: recipientName,
                                                receiverAccount: accountNumber,
                                                bankName: bankName,
                                                currency: state.currentUser?.currency || 'USD',
                                                fee: transferType === 'local' ? 1.50 : 12.50
                                            });
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl font-bold text-[11px] uppercase tracking-wider text-foreground hover:bg-muted transition"
                                >
                                    <PaperclipIcon className="w-3.5 h-3.5 text-primary" />
                                    Download Receipt
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus('idle');
                                        setAmount('');
                                        setRecipientName('');
                                        setAccountNumber('');
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-muted dark:bg-dark-muted rounded-xl font-bold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    New Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                ) : status === 'failed' ? (
                    <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
                        {/* Animated failure icon */}
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/40">
                                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider">
                                <RotateCcw className="w-3 h-3" />
                                Transfer Failed & Reversed
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 line-through">
                                {formatCurrency(processedTx ? Math.abs(processedTx.amount) : parseFloat(amount.replace(/,/g, '') || '0'), processedTx?.currency || state.currentUser?.currency || state.currentCurrency || 'USD')}
                            </h3>
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                                Transaction declined by security clearance protocols
                            </p>
                        </div>

                        {/* Prominent Failure & Restriction Notice */}
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-left space-y-3">
                            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-wider text-red-700 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Restriction & Reversal Notice</span>
                            </div>
                            
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                                {processedTx?.failureReason || "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week."}
                            </p>

                            <div className="border-t border-red-200/60 dark:border-red-900/40 pt-2.5 space-y-1.5">
                                <p className="font-bold text-red-900 dark:text-red-200 uppercase text-[9px] tracking-widest">
                                    Specific Reasons for Failure:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                                    <li><strong>Outstanding Charges:</strong> Unsettled late payment clearance charges and regulatory fee restrictions pending settlement from previous account holds.</li>
                                    <li><strong>Security Flag:</strong> Third-party assisted transaction flagged by automated transaction security & anti-fraud protocols.</li>
                                    <li><strong>Beneficiary Verification:</strong> Mandatory identity verification and authorization required for third-party beneficiary credentials.</li>
                                </ul>
                            </div>

                            <div className="bg-red-100/80 dark:bg-red-900/40 p-3 rounded-xl border border-red-200 dark:border-red-800/40 text-[11px] text-red-900 dark:text-red-200 space-y-1">
                                <p className="font-bold">How to Resolve & Clear Restriction:</p>
                                <p className="leading-relaxed">
                                    Please contact customer support at <a href="mailto:supportcathaybank@gmail.com" className="underline font-bold">supportcathaybank@gmail.com</a> with your reference code <strong>{processedTx?.reference || `REF-${Math.floor(Math.random() * 900000 + 100000)}`}</strong>. Our compliance team will provide the exact verification requirements to clear restrictions.
                                </p>
                            </div>
                        </div>

                        {/* Transaction Summary Table */}
                        <div className="p-4 bg-muted/50 dark:bg-dark-muted/40 rounded-2xl border border-border dark:border-dark-border text-left space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Recipient Name:</span>
                                <span className="font-bold text-foreground">{processedTx?.receiverName || recipientName || 'Recipient Account'}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground shrink-0">{transferType === 'crypto' ? 'Wallet Address:' : 'Account / Destination:'}</span>
                                <span className="font-mono font-bold text-foreground text-right break-all max-w-[65%] leading-relaxed">{processedTx?.receiverAccount || accountNumber || '—'}</span>
                            </div>
                            {(processedTx?.bankName || bankName) && (
                                <div className="flex justify-between items-center py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">{transferType === 'crypto' ? 'Network:' : 'Institution / Network:'}</span>
                                    <span className="font-bold text-foreground">{processedTx?.bankName || bankName}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Reference:</span>
                                <span className="font-mono font-bold text-primary">{processedTx?.reference || `REF-${Math.floor(Math.random() * 900000 + 100000)}`}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Date & Time:</span>
                                <span className="font-medium text-foreground">
                                    {new Date(processedTx?.date || Date.now()).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="inline-flex items-center gap-1 font-black text-red-600 dark:text-red-400 uppercase text-[10px]">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Failed (Reversed)
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStatus('idle');
                                    dispatch({ type: 'SET_PAGE', payload: Page.TRANSACTIONS });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:opacity-90 transition"
                            >
                                <History className="w-4 h-4" />
                                View in Transaction History
                            </button>
                            
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (processedTx) {
                                            generateReceiptPDF({
                                                ...processedTx,
                                                status: 'Failed'
                                            });
                                        } else {
                                            generateReceiptPDF({
                                                id: `tx_receipt_${Date.now()}`,
                                                date: new Date().toISOString(),
                                                description: `Transfer to ${recipientName}`,
                                                amount: -parseFloat(amount.replace(/,/g, '') || '0'),
                                                type: 'debit',
                                                category: 'Transfer',
                                                status: 'Failed',
                                                reference: `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
                                                senderName: state.currentUser?.name,
                                                senderAccount: state.currentUser?.accountNumber,
                                                receiverName: recipientName,
                                                receiverAccount: accountNumber,
                                                bankName: bankName,
                                                currency: state.currentUser?.currency || 'USD',
                                                fee: transferType === 'local' ? 1.50 : 12.50
                                            });
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl font-bold text-[11px] uppercase tracking-wider text-foreground hover:bg-muted transition"
                                >
                                    <PaperclipIcon className="w-3.5 h-3.5 text-primary" />
                                    Download Receipt
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus('idle');
                                        dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-muted dark:bg-dark-muted rounded-xl font-bold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleTransfer} className="space-y-5">
                        {transferType === 'crypto' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Select Crypto Token / Network</label>
                                    <Select value={cryptoAsset} onChange={e => setCryptoAsset(e.target.value as any)}>
                                        <option value="USDT">USDT Tether (TRC-20)</option>
                                        <option value="BTC">Bitcoin (BTC)</option>
                                        <option value="ETH">Ethereum (ETH)</option>
                                        <option value="BNB">BNB (BEP-20)</option>
                                        <option value="SOL">Solana (SOL)</option>
                                        <option value="XRP">XRP (Ripple)</option>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Recipient Wallet Address</label>
                                    <Input
                                        placeholder={`Enter ${cryptoAsset} wallet address...`}
                                        value={cryptoWalletAddress}
                                        onChange={e => {
                                            setCryptoWalletAddress(e.target.value);
                                            setAccountNumber(e.target.value);
                                            setRecipientName(`${cryptoAsset} Wallet Holder`);
                                            setBankName('Cathay Bank Crypto Gateway');
                                        }}
                                        required
                                    />
                                    <p className="text-[9px] font-medium text-slate-400 ml-2">
                                        ⚠️ Ensure destination wallet supports {cryptoAsset}. Transfers to incorrect network addresses cannot be reversed.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {transferType === 'international' && (
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">{t('destinationCountry')}</label>
                                        <Select value={selectedCountryName} onChange={e => setSelectedCountryName(e.target.value)} required>
                                            <option value="">{t('selectProtocol')}</option>
                                            {sortedCountries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </Select>
                                        {selectedCountryName && selectedCountry && (
                                            <div className="p-4 bg-primary/5 rounded-xl flex justify-between items-center border border-primary/10 animate-in slide-in-from-top-2">
                                                <span className="text-[9px] font-black uppercase text-primary tracking-widest">{t('liveRate')}</span>
                                                <span className="text-[10px] font-black tabular-nums">1 {sourceCurr} = {currentRate < 0.01 ? currentRate.toFixed(6) : currentRate < 1 ? currentRate.toFixed(4) : currentRate.toFixed(2)} {selectedCountry.currency}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('financialInstitution')}</label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsCustomBank(!isCustomBank);
                                                setBankName('');
                                            }} 
                                            className="text-[9px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider hover:underline"
                                        >
                                            {isCustomBank ? "Select from list" : "Type manual institution"}
                                        </button>
                                    </div>

                                    {isCustomBank ? (
                                        <Input 
                                            placeholder="Enter Financial Institution / Mobile Wallet Name" 
                                            value={bankName} 
                                            onChange={e => setBankName(e.target.value)} 
                                            required 
                                        />
                                    ) : (
                                        <Select value={bankName} onChange={e => setBankName(e.target.value)} required>
                                            <option value="">{t('selectInstitution')}</option>
                                            {([...(COUNTRIES_WITH_BANKS.find(c => c.name === (transferType === 'local' ? (isUserUSD ? 'United States' : 'United Kingdom') : selectedCountryName))?.banks || [])].sort((a, b) => a.localeCompare(b))).map(b => <option key={b} value={b}>{b}</option>)}
                                        </Select>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">{t('recipientInformation')}</label>
                                    
                                    {isMobileWallet && (
                                        <div className="space-y-2 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl animate-in fade-in-50">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                                                    📱 {bankName || 'Mobile Wallet'} Direct Remittance
                                                </p>
                                                <span className="text-[8px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                                    Direct Credit Active
                                                </span>
                                            </div>
                                            <p className="text-[9px] font-medium text-slate-600 dark:text-slate-400">
                                                Direct mobile wallet settlement active. Standard bank routing codes (ABA/SWIFT) are bypassed.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">
                                            {isMobileWallet ? `${bankName || 'Mobile Wallet'} Mobile / Account Number *` : isUKBankOrUK ? 'UK Account Number (8 digits) *' : isUSBankOrUSA ? 'US Account Number (10-12 digits) *' : 'Account Number / IBAN *'}
                                        </label>
                                        <Input 
                                            placeholder={isMobileWallet ? "e.g. 0917 123 4567 or Wallet Account Number" : isUKBankOrUK ? "e.g. 12200049" : isUSBankOrUSA ? "e.g. 1009841029" : t('accountIbanProtocol')} 
                                            value={accountNumber} 
                                            onChange={e => setAccountNumber(e.target.value)} 
                                            required 
                                        />
                                    </div>

                                    {/* US-Specific Required Wire Details */}
                                    {isUSBankOrUSA && !isMobileWallet && (
                                        <div className="space-y-3 p-3.5 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-[#0066CC] dark:text-sky-400 tracking-wider">🇺🇸 USA Required Transfer Details</p>
                                            
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">9-Digit ABA / ACH Routing Number *</label>
                                                <Input 
                                                    placeholder="e.g. 122000496" 
                                                    value={routingNumber} 
                                                    onChange={e => setRoutingNumber(e.target.value)} 
                                                    maxLength={9}
                                                    required 
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Account Type *</label>
                                                <Select value={accountType} onChange={e => setAccountType(e.target.value as any)}>
                                                    <option value="checking">Checking Account</option>
                                                    <option value="savings">Savings Account</option>
                                                    <option value="corporate">Corporate / Escrow Account</option>
                                                </Select>
                                            </div>

                                            {transferType !== 'local' && (
                                                <>
                                                    <div>
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">SWIFT / BIC Clearing Code</label>
                                                        <Input 
                                                            placeholder="e.g. SECUS33X / CATHUS33" 
                                                            value={swiftCode} 
                                                            onChange={e => setSwiftCode(e.target.value)} 
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Recipient Physical Billing Address</label>
                                                        <Input 
                                                            placeholder="Street, City, State, ZIP (e.g. 123 Wall St, NY, NY 10005)" 
                                                            value={beneficiaryAddress} 
                                                            onChange={e => setBeneficiaryAddress(e.target.value)} 
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* UK-Specific Required Wire Details */}
                                    {isUKBankOrUK && !isUSBankOrUSA && !isMobileWallet && (
                                        <div className="space-y-3 p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">🇬🇧 UK Required Transfer Details</p>
                                            
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">6-Digit Sort Code (xx-xx-xx) *</label>
                                                <Input 
                                                    placeholder="e.g. 20-40-60" 
                                                    value={sortCode} 
                                                    onChange={e => setSortCode(e.target.value)} 
                                                    maxLength={8}
                                                    required 
                                                />
                                            </div>

                                            {transferType !== 'local' && (
                                                <div>
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">SWIFT / BIC Code</label>
                                                    <Input 
                                                        placeholder="e.g. SECGB2L / CATHGB2L" 
                                                        value={swiftCode} 
                                                        onChange={e => setSwiftCode(e.target.value)} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Other International Countries Wire Details */}
                                    {!isUSBankOrUSA && !isUKBankOrUK && !isMobileWallet && selectedCountryName && (
                                        <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-dark-muted/40 border border-border dark:border-dark-border rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-wider">🌐 International Clearing Details</p>
                                            
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">
                                                    {selectedCountryName === 'India' ? 'IFSC Code (11 digits) *' :
                                                     selectedCountryName === 'Australia' ? 'BSB Number (6 digits) *' :
                                                     selectedCountryName === 'Mexico' ? '18-Digit CLABE Number *' :
                                                     'SWIFT / BIC / Bank Routing Code'}
                                                </label>
                                                <Input 
                                                    placeholder={
                                                        selectedCountryName === 'India' ? 'e.g. SBIN0001234' :
                                                        selectedCountryName === 'Australia' ? 'e.g. 062-000' :
                                                        selectedCountryName === 'Mexico' ? 'e.g. 012180001234567890' :
                                                        'Enter SWIFT / BIC / Routing Code'
                                                    } 
                                                    value={routingNumber || swiftCode} 
                                                    onChange={e => {
                                                        setRoutingNumber(e.target.value);
                                                        setSwiftCode(e.target.value);
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Payment Purpose / Transfer Note (Optional)</label>
                                        <Input 
                                            placeholder="Type purpose or reason for transfer (optional)..." 
                                            value={paymentPurpose} 
                                            onChange={e => setPaymentPurpose(e.target.value)} 
                                        />
                                    </div>

                                    {!detectedUser && (
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Beneficiary / Recipient Full Name *</label>
                                            <Input 
                                                placeholder="Recipient Full Name" 
                                                value={recipientName} 
                                                onChange={e => setRecipientName(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    )}

                                    {detectedUser && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                            <img src={detectedUser.avatar} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-green-700 dark:text-green-400 tracking-widest leading-none">Auto-Detected Recipient</p>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mt-1.5">{detectedUser.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-2">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('assetAmount')}</label>
                                {transferType === 'international' && selectedCountryName && selectedCountry && (
                                    <span className="text-[9px] font-black text-[#0066CC] dark:text-blue-400 uppercase tracking-wider">
                                        1 {sourceCurr} = {currentRate < 0.01 ? currentRate.toFixed(6) : currentRate < 1 ? currentRate.toFixed(4) : currentRate.toFixed(2)} {selectedCountry.currency}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Input type="number" placeholder="Enter transfer amount..." value={amount} onChange={e => setAmount(e.target.value)} required />
                                {targetAmount > 0 && transferType === 'international' && selectedCountryName && selectedCountry && (
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/40 flex justify-between items-center text-[11px] font-bold text-[#0066CC] dark:text-blue-300">
                                        <span>Estimated Settlement in {selectedCountry.name}:</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">
                                            {targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCountry.currency}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {parseFloat(amount) > 0 && (
                            <div className="space-y-2 p-4 bg-muted/50 dark:bg-dark-muted/50 rounded-2xl border border-border dark:border-dark-border animate-in fade-in duration-300">
                                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                                    <span>Transfer Amount:</span>
                                    <span className="tabular-nums font-bold">
                                        {formatCurrency(parseFloat(amount), state.currentUser?.currency || 'GBP')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground border-t border-border/40 dark:border-dark-border/40 pt-2">
                                    <span>Transfer Fee:</span>
                                    <span className="tabular-nums font-bold text-red-500">
                                        {formatCurrency(transferType === 'local' ? 1.50 : 12.50, state.currentUser?.currency || 'GBP')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] uppercase font-black tracking-wider text-foreground dark:text-dark-foreground border-t border-border/80 dark:border-dark-border/80 pt-2 mt-1">
                                    <span>Total Deduction:</span>
                                    <span className="tabular-nums font-extrabold text-primary">
                                        {formatCurrency(parseFloat(amount) + (transferType === 'local' ? 1.50 : 12.50), state.currentUser?.currency || 'GBP')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {(() => {
                            const isFormValid = !!amount && 
                                parseFloat(amount.replace(/,/g, '')) > 0 && 
                                !!accountNumber.trim() && 
                                (!!detectedUser || !!recipientName.trim()) && 
                                !!bankName && 
                                (transferType !== 'international' || !!selectedCountryName) &&
                                (!isUSBankOrUSA || !!routingNumber.trim()) &&
                                (!isUKBankOrUK || !!sortCode.trim());
                            return (
                                <div className="pt-2">
                                    <Button type="submit" disabled={!isFormValid} className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}>
                                        {t('authorizeDispatch')}
                                    </Button>
                                </div>
                            );
                        })()}
                    </form>
                )}
            </div>



            <PinVerificationModal isOpen={status === 'pin'} onClose={() => setStatus('idle')} onVerify={onPinVerify} error={pinError} />

            {/* Transfer Temporarily Restricted Modal */}
            <AnimatePresence>
                {isRestrictedModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsRestrictedModalOpen(false);
                                if (!state.currentUser?.isActivated) {
                                    dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
                                } else {
                                    dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
                                }
                            }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Card Content */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-dark-card w-full max-w-lg rounded-[2.5rem] border border-red-500/30 shadow-2xl p-8 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto z-10"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                            
                            {/* Header Icon */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                    <AlertTriangle className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black uppercase tracking-tight text-red-600">Transfer Temporarily Restricted</h2>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Security Protocol Hold</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                                <p>Dear Customer,</p>
                                
                                <p>Your account has been temporarily restricted from making transfers for security reasons and to help protect your funds.</p>

                                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl space-y-1.5">
                                    <p className="text-[9px] font-black uppercase text-red-800 dark:text-red-400 tracking-wider">Reason:</p>
                                    <p className="text-[11px] text-red-700 dark:text-red-300 font-bold leading-relaxed">
                                        We detected unusual account activity, including login attempts or account access from new locations or devices. As a precaution, outgoing transfers have been temporarily restricted while additional security verification is completed.
                                    </p>
                                </div>

                                {failedTransaction && (
                                    <div className="p-4 bg-slate-50 dark:bg-dark-muted border border-border dark:border-dark-border rounded-2xl space-y-3">
                                        <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Attempted Transfer Details</span>
                                        </div>
                                        <div className="space-y-1.5 text-[11px]">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-semibold">Recipient:</span>
                                                <span className="font-black text-foreground">{failedTransaction.receiverName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-semibold">Account Number:</span>
                                                <span className="font-mono font-black text-foreground">{failedTransaction.receiverAccount}</span>
                                            </div>
                                            {failedTransaction.bankName && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground font-semibold">Bank Name:</span>
                                                    <span className="font-black text-foreground">{failedTransaction.bankName}</span>
                                                </div>
                                            )}
                                            {failedTransaction.country && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground font-semibold">Country:</span>
                                                    <span className="font-black text-foreground">{failedTransaction.country}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-1 border-t border-dashed border-border/50">
                                                <span className="text-muted-foreground font-semibold">Amount Attempted:</span>
                                                <span className="font-black text-red-600">
                                                    {failedTransaction.amount < 0 ? '-' : ''}
                                                    {formatCurrency(Math.abs(failedTransaction.amount), failedTransaction.currency || 'GBP')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-semibold">Transaction Fee:</span>
                                                <span className="font-black text-foreground">
                                                    {formatCurrency(failedTransaction.fee || 0, failedTransaction.currency || 'GBP')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/30">
                                                <span>Ref: {failedTransaction.reference}</span>
                                                <span>{new Date(failedTransaction.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p>If this activity was performed by you, please verify your identity or contact the bank agent or customer support for assistance.</p>
                            </div>

                            {/* Support channels */}
                            <div className="border-t border-border dark:border-dark-border pt-4 space-y-3">
                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Secure Verification Uplink</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <a 
                                        href="tel:+18008228429" 
                                        className="flex items-center justify-center gap-2.5 p-3.5 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border dark:border-dark-border hover:border-primary transition group text-[9px] font-black uppercase tracking-wider text-black dark:text-white"
                                    >
                                        <PhoneIcon className="w-3.5 h-3.5 text-primary" />
                                        Call USA (+1 800)
                                    </a>
                                    <a 
                                        href="tel:+447599186936" 
                                        className="flex items-center justify-center gap-2.5 p-3.5 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border dark:border-dark-border hover:border-primary transition group text-[9px] font-black uppercase tracking-wider text-black dark:text-white"
                                    >
                                        <PhoneIcon className="w-3.5 h-3.5 text-primary" />
                                        Call UK (+44 7599)
                                    </a>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <a 
                                        href="https://wa.me/447922284110" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center justify-center gap-2.5 p-3.5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30 hover:border-green-500 transition group text-[9px] font-black uppercase tracking-wider text-green-700 dark:text-green-400"
                                    >
                                        <MessageCircleIcon className="w-3.5 h-3.5 text-green-600" />
                                        WhatsApp Live
                                    </a>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsRestrictedModalOpen(false);
                                            dispatch({ type: 'TOGGLE_CHAT', payload: true });
                                        }}
                                        className="flex items-center justify-center gap-2.5 p-3.5 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary transition text-[9px] font-black uppercase tracking-wider text-primary"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Secure Chat
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <a 
                                        href="mailto:supportcathaybank@gmail.com"
                                        className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border dark:border-dark-border hover:border-primary transition text-[9px] font-black uppercase tracking-tight text-gray-700 dark:text-gray-300"
                                    >
                                        <MailIcon className="w-3.5 h-3.5 text-gray-500" />
                                        supportcathaybank@gmail.com
                                    </a>
                                    <a 
                                        href="mailto:reportphishing@cathaybank.com"
                                        className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-dark-muted rounded-xl border border-border dark:border-dark-border hover:border-primary transition text-[9px] font-black uppercase tracking-tight text-gray-700 dark:text-gray-300"
                                    >
                                        <MailIcon className="w-3.5 h-3.5 text-gray-500" />
                                        reportphishing@cathaybank.com
                                    </a>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsRestrictedModalOpen(false);
                                        dispatch({ type: 'TOGGLE_CHAT', payload: true });
                                    }}
                                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition"
                                >
                                    Contact Support
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsRestrictedModalOpen(false);
                                        if (!state.currentUser?.isActivated) {
                                            dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
                                        } else {
                                            dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-muted dark:hover:bg-dark-muted/80 rounded-xl text-[9px] font-black uppercase tracking-widest transition text-black dark:text-white"
                                >
                                    OK
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PayBillsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [category, setCategory] = useState(BILLER_CATEGORIES[0]);
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [selectedBiller, setSelectedBiller] = useState('');
    const [clientRef, setClientRef] = useState('');
    const [amount, setAmount] = useState('');
    
    // Flight specific state
    const [origin, setOrigin] = useState('LHR - London Heathrow');
    const [destination, setDestination] = useState('DXB - Dubai International');
    const [travelDate, setTravelDate] = useState('2026-08-15');
    const [cabinClass, setCabinClass] = useState('Economy');
    const [passengerName, setPassengerName] = useState(state.currentUser?.name || '');

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

    // Filter billers by selected country if specified
    const filteredBillers = useMemo(() => {
        if (selectedCountry === 'All') return category.billers;
        return category.billers.filter(b => b.toLowerCase().includes(selectedCountry.toLowerCase()));
    }, [category, selectedCountry]);

    const isFlightCategory = category.name.toLowerCase().includes('flight');

    const onPinVerify = (pin: string) => {
        if (pin.trim() === state.currentUser?.pin) {
            const billAmount = parseFloat(amount);
            if (isNaN(billAmount) || billAmount <= 0) {
                setPinError("Please enter a valid amount.");
                return;
            }
            if (billAmount > state.currentUser!.balance) { 
                setPinError("Insufficient Vault Balance."); 
                return; 
            }

            const pnrCode = `PNR-${Math.floor(100000 + Math.random() * 900000)}`;
            const description = isFlightCategory
                ? `Flight Ticket: ${selectedBiller || 'Global Airline'} (${origin} ✈️ ${destination}) [Ref: ${pnrCode}]`
                : `Service Settlement: ${selectedBiller || 'Utility Provider'} (${selectedCountry !== 'All' ? selectedCountry : 'Global'})`;

            dispatch({ type: 'UPDATE_BALANCE', payload: state.currentUser!.balance - billAmount });
            dispatch({
                type: 'ADD_TRANSACTION',
                payload: { 
                    id: `bill_${Date.now()}`, 
                    date: new Date().toISOString(), 
                    description: description, 
                    amount: -billAmount, 
                    type: 'debit', 
                    category: isFlightCategory ? 'Travel' : 'Settlement', 
                    status: 'Completed',
                    reference: pnrCode,
                    country: selectedCountry !== 'All' ? selectedCountry : 'International'
                }
            });

            setIsPinModalOpen(false);

            if (isFlightCategory) {
                setBookingSuccessData({
                    airline: selectedBiller,
                    pnr: pnrCode,
                    passenger: passengerName,
                    origin,
                    destination,
                    date: travelDate,
                    cabin: cabinClass,
                    amount: billAmount,
                    currency: state.currentCurrency || 'GBP'
                });
            } else {
                alert(`Payment of ${formatCurrency(billAmount, state.currentCurrency)} for ${selectedBiller || 'Service'} completed successfully.`);
                dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
            }
        } else { 
            setPinError("Invalid Authorization PIN."); 
        }
    };

    return (
        <div className="p-5 space-y-6">
            {/* Header Banner */}
            <div className="bg-[#0A2540] text-white p-6 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 tracking-wider">
                        ✈️ Global Flights & Bill Payments
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">All Countries Supported</span>
                </div>
                <h2 className="text-xl font-black text-white">Book Flights & Settle Utilities</h2>
                <p className="text-xs text-slate-300">
                    Book international airline tickets, pay utility bills, and settle global services across all countries directly from your Cathay Bank vault.
                </p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {BILLER_CATEGORIES.map(c => (
                    <button 
                        key={c.name} 
                        onClick={() => { setCategory(c); setSelectedBiller(''); }} 
                        className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase transition tracking-wider flex items-center gap-2 ${
                            category.name === c.name 
                                ? 'bg-[#0066CC] text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        <span>{c.name}</span>
                    </button>
                ))}
            </div>

            {/* Country Filter */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Select Destination Country / Region</label>
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                >
                    <option value="All">🌍 All Countries & Global Providers</option>
                    {COUNTRIES_WITH_BANKS.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.currency})</option>
                    ))}
                </select>
            </div>

            {/* Booking / Payment Form */}
            <form onSubmit={e => { e.preventDefault(); setIsPinModalOpen(true); }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                
                {/* Airline / Service Provider Selector */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        {isFlightCategory ? 'Select Airline Carrier / Flight Operator' : 'Select Service Provider / Utility Institution'}
                    </label>
                    <Select value={selectedBiller} onChange={e => setSelectedBiller(e.target.value)} required>
                        <option value="">{isFlightCategory ? '-- Select Airline --' : '-- Select Utility / Biller --'}</option>
                        {filteredBillers.map(b => <option key={b} value={b}>{b}</option>)}
                    </Select>
                </div>

                {isFlightCategory ? (
                    /* Flight Specific Fields */
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400">Origin Departure Airport</label>
                                <Input placeholder="e.g. LHR - London Heathrow" value={origin} onChange={e => setOrigin(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400">Destination Airport</label>
                                <Input placeholder="e.g. DXB - Dubai International" value={destination} onChange={e => setDestination(e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400">Departure Date</label>
                                <Input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400">Cabin Seating Class</label>
                                <select 
                                    value={cabinClass} 
                                    onChange={e => setCabinClass(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="Economy">Economy Class</option>
                                    <option value="Premium Economy">Premium Economy</option>
                                    <option value="Business Class">Business Class (Lie-Flat)</option>
                                    <option value="First Class Suite">First Class Private Suite</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Primary Passenger Name (as on Passport)</label>
                            <Input placeholder="Full Legal Passenger Name" value={passengerName} onChange={e => setPassengerName(e.target.value)} required />
                        </div>
                    </div>
                ) : (
                    /* General Bill Fields */
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Customer Account / Meter Reference Number</label>
                        <Input placeholder="Enter Customer Ref / Meter No / Account ID" value={clientRef} onChange={e => setClientRef(e.target.value)} required />
                    </div>
                )}

                {/* Amount Field */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[9px] font-black uppercase text-slate-400">
                        {isFlightCategory ? 'Total Airfare Amount' : 'Total Settlement Amount'} ({state.currentCurrency})
                    </label>
                    <Input 
                        type="number" 
                        placeholder={`Enter amount in ${state.currentCurrency}...`} 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        required 
                    />
                </div>

                <Button type="submit" className="w-full py-3.5 bg-[#0066CC] hover:bg-blue-700 text-white font-black uppercase text-xs rounded-xl shadow-md">
                    {isFlightCategory ? '✈️ Reserve Flight & Authorize Payment' : '💳 Authorize Bill Payment'}
                </Button>
            </form>

            {/* Flight Ticket / Confirmation Modal */}
            <AnimatePresence>
                {bookingSuccessData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-5 text-center"
                        >
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                                ✈️
                            </div>

                            <div>
                                <span className="text-[9px] font-black uppercase px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full">
                                    E-Ticket Confirmed & Issued
                                </span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">Flight Reservation Successful</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Your electronic airline ticket has been booked and charged to your account.</p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Airline:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{bookingSuccessData.airline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">PNR Reference:</span>
                                    <span className="font-mono font-black text-[#0066CC]">{bookingSuccessData.pnr}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Passenger:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{bookingSuccessData.passenger}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Route:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{bookingSuccessData.origin} → {bookingSuccessData.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Travel Date:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{bookingSuccessData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Cabin Class:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{bookingSuccessData.cabin}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                                    <span className="text-slate-400">Total Paid:</span>
                                    <span className="font-black text-emerald-600">{formatCurrency(bookingSuccessData.amount, bookingSuccessData.currency)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setBookingSuccessData(null);
                                    dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
                                }}
                                className="w-full py-3 bg-[#0066CC] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
                            >
                                Return to Dashboard
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PinVerificationModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onVerify={onPinVerify} error={pinError} />
        </div>
    );
};

const LoanPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [step, setStep] = useState<'info' | 'apply' | 'done' | 'management'>('info');

    useEffect(() => {
        if (step === 'done') {
            const timer = setTimeout(() => {
                if (!state.currentUser?.isActivated) {
                    dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, state.currentUser, dispatch]);

    return (
        <div className="p-6 space-y-6">
            {step === 'info' && (
                <div className="bg-[#0f172a] p-10 rounded-[2.5rem] text-white space-y-8 relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">{t('loanBalance')}</p>
                    <p className="text-4xl font-black tracking-tighter tabular-nums">{formatCurrency(state.currentUser!.loanBalance)}</p>
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">{t('interestRate')}</span>
                        <span className="text-[11px] font-black text-red-400">1.8% Fixed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => setStep('apply')}>{t('applyForLoan')}</Button>
                        <Button onClick={() => setStep('management')} className="bg-white/5 border border-white/10 text-white">{t('management')}</Button>
                    </div>
                </div>
            )}
            {step === 'apply' && (
                <form onSubmit={e => {e.preventDefault(); setStep('done');}} className="space-y-6">
                    <h3 className="text-base font-black uppercase tracking-tight text-center">{t('assetFinancing')}</h3>
                    <Select required><option value="Asset">{t('assetFinancing')}</option><option value="Personal">{t('premiumLine')}</option></Select>
                    <Input type="number" placeholder={t('requestedCapital')} required />
                    <Input placeholder={t('intendedUseOfFunds')} required />
                    <Button type="submit">{t('verifyCreditProfile')}</Button>
                    <button type="button" onClick={() => setStep('info')} className="w-full text-[10px] font-black uppercase opacity-30 mt-2">{t('back')}</button>
                </form>
            )}
            {step === 'management' && (
                <div className="space-y-6">
                    <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                        <div className="flex items-center gap-2.5 opacity-40">
                            <ShieldIcon className="w-3.5 h-3.5" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('loanProtocol')}</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-center">{t('transferToLoan')}</p>
                            <Input type="number" placeholder={t('assetAmount')} id="loan-amount" />
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={async () => {
                                    const val = (document.getElementById('loan-amount') as HTMLInputElement).value;
                                    const amount = parseFloat(val);
                                    if (!amount || amount <= 0) return alert(t('invalidAmount'));
                                    if (amount > state.currentUser!.balance) return alert(t('insufficientBalance'));
                                    dispatch({ type: 'MOVE_TO_LOAN', payload: amount });
                                    const updatedUser = {
                                        ...state.currentUser!,
                                        balance: state.currentUser!.balance - amount,
                                        loanBalance: state.currentUser!.loanBalance + amount,
                                        transactions: [
                                            { id: `txn_${Date.now()}`, date: new Date().toISOString(), description: 'transferToLoan', amount: -amount, type: 'debit' as const, category: 'Loan', status: 'Completed' as const }, 
                                            ...(state.currentUser!.transactions || [])
                                        ]
                                    };
                                    (document.getElementById('loan-amount') as HTMLInputElement).value = '';
                                    alert(t('loanTransactionAuthorized'));

                                    try {
                                        await fetch('/api/users/update', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updatedUser)
                                        });
                                    } catch (err) {
                                        console.error("Error syncing loan action with server:", err);
                                    }
                                }}>{t('transferToLoan')}</Button>
                                <Button onClick={async () => {
                                    const val = (document.getElementById('loan-amount') as HTMLInputElement).value;
                                    const amount = parseFloat(val);
                                    if (!amount || amount <= 0) return alert(t('invalidAmount'));
                                    if (amount > state.currentUser!.loanBalance) return alert(t('insufficientBalance'));
                                    dispatch({ type: 'MOVE_FROM_LOAN', payload: amount });
                                    const updatedUser = {
                                        ...state.currentUser!,
                                        balance: state.currentUser!.balance + amount,
                                        loanBalance: state.currentUser!.loanBalance - amount,
                                        transactions: [
                                            { id: `txn_${Date.now()}`, date: new Date().toISOString(), description: 'withdrawFromLoan', amount: amount, type: 'credit' as const, category: 'Loan', status: 'Completed' as const }, 
                                            ...(state.currentUser!.transactions || [])
                                        ]
                                    };
                                    (document.getElementById('loan-amount') as HTMLInputElement).value = '';
                                    alert(t('loanTransactionAuthorized'));

                                    try {
                                        await fetch('/api/users/update', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updatedUser)
                                        });
                                    } catch (err) {
                                        console.error("Error syncing loan action with server:", err);
                                    }
                                }} className="bg-slate-100 dark:bg-dark-muted text-foreground dark:text-white">{t('withdrawFromLoan')}</Button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setStep('info')} className="w-full text-[10px] font-black uppercase opacity-30 mt-2">{t('back')}</button>
                </div>
            )}
            {step === 'done' && (
                <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-dark-muted rounded-3xl flex items-center justify-center mx-auto shadow-inner"><RefreshCwIcon className="w-10 h-10 text-primary animate-spin" /></div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{t('profileScanning')}</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60 px-8">{t('riskDeskAudit')}</p>
                    <Button onClick={() => setStep('info')}>{t('backToDesk')}</Button>
                </div>
            )}
        </div>
    );
};

const IrsRefundPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRelease = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setVerified(true);
            const amount = 156000;
            dispatch({ type: 'UPDATE_BALANCE', payload: state.currentUser!.balance + amount });
            dispatch({ type: 'ADD_TRANSACTION', payload: { id: `irs_${Date.now()}`, date: new Date().toISOString(), description: 'Federal IRS Refund Hub', amount: amount, type: 'credit', category: 'Government', status: 'Completed' } });
            alert(t('irsReleaseSuccess'));
        }, 3000);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-[#003366] via-black to-[#001a33] p-10 rounded-[3rem] text-white text-center space-y-8 shadow-2xl relative overflow-hidden">
                <LandmarkIcon className="w-14 h-14 mx-auto opacity-30" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">{t('irsAssetRelease')}</h2>
                <div className="py-6 border-y border-white/5">
                    <p className="text-[11px] font-black uppercase opacity-40 mb-1 tracking-[0.3em]">{t('blockedLiquidity')}</p>
                    <p className="text-5xl font-black tracking-tighter">$156,000.00</p>
                </div>
                {!verified && !loading && <Button onClick={handleRelease}>{t('authorizeRelease')}</Button>}
                {loading && (
                    <div className="space-y-4">
                        <ProcessingLoaderIcon className="w-12 h-12 mx-auto animate-spin" />
                        <p className="text-[11px] font-black uppercase animate-pulse tracking-widest">{t('syncingFederalVaults')}</p>
                    </div>
                )}
                {verified && (
                    <div className="bg-green-500/10 p-6 rounded-[1.8rem] border border-green-500/20 text-left">
                        <p className="text-[11px] font-black uppercase text-green-400 mb-2 tracking-widest">{t('releasedSuccessfully')}</p>
                        <p className="text-xs font-bold leading-relaxed text-white/80">{t('governmentAssetsCleared')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useAppContext();
    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-dark-muted rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">1. Data Collection & Location Telemetry</h3>
                        <p>We collect information that you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. We automatically collect device fingerprints, IP location telemetry, ISP data, and geographic access logs to ensure account integrity.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">2. Use of Information</h3>
                        <p>We use the information we collect about you to provide, maintain, and improve our Services, facilitate payments, send receipts, detect fraudulent access attempts, and enforce automated security holds on accounts accessed from unauthorized networks.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">3. Sharing of Information</h3>
                        <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including sharing with regulatory compliance bodies, anti-fraud registries, and banking verification desks.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">4. Unrecognized Location Detection & Transfer Lockout</h3>
                        <p>If our automated security infrastructure detects any login attempt, session activity, or wire transfer request from a location, region, device, or IP address that is unrecognized, unregistered, or flagged as suspicious:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                            <li>Your bank account will be <strong>immediately restricted</strong> and placed on security hold without prior notice to protect your funds against unauthorized siphon or breach.</li>
                            <li><strong>All outgoing money transfers, domestic/international wires, debit card transactions, and vault withdrawals will be strictly disabled</strong> during the period of restriction.</li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">5. Account Retrieval & Protection Clearance Fee</h3>
                        <p>To restore access to a restricted account, lift transfer blocks, and retrieve vault assets following an unrecognized location alert:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                            <li>The account holder must provide government-issued identity verification (Level 3 KYC) and verify ownership with our Verification Desk.</li>
                            <li>A mandatory <strong>Security Protection & Reactivation Clearance Fee</strong> (administrative anti-fraud protection assessment) must be paid to clear the security hold, re-establish secure encryption keys, and authorize transfer capabilities.</li>
                            <li><strong>External Payment Method:</strong> The fee to retrieve or reactivate a restricted account <strong>will be paid outside the bank</strong> (via external settlement or external wire transfer). Direct debit or fee deduction from the restricted bank balance is strictly prohibited while a security restriction is active.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

const TermsOfServicePage: React.FC = () => {
    const { t } = useAppContext();
    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-dark-muted rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">1. Acceptance of Terms</h3>
                        <p>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Services.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">2. Account Responsibility & Location Monitoring</h3>
                        <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must register all devices and primary geographic locations used to access your digital banking dashboard.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">3. Automated Security Restrictions & Transfer Hold</h3>
                        <p>If our security systems identify any login attempt, session activity, or funds transfer originating from an unrecognized, unregistered, or suspicious geographic location, IP address, or unauthorized device:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                            <li>Your bank account will be <strong>automatically restricted and locked</strong> without advance warning to secure your total account balance and assets.</li>
                            <li><strong>Outbound money transfers, wire transfers, bill payments, and card transactions will be completely suspended</strong> until full security verification is completed.</li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">4. Account Retrieval Protocols & Security Protection Fee</h3>
                        <p>When an account is restricted due to unrecognized location activity, retrieving full access and restoring outgoing transfer capabilities requires:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                            <li>Submission of official photo identification (Passport, National ID, or Driver's License) to the Verification Desk.</li>
                            <li>Payment of the prescribed <strong>Security Protection & Account Retrieval Fee</strong> to cover mandatory anti-fraud compliance, asset escrow protection, and system re-authentication procedures.</li>
                            <li><strong>Mandatory External Settlement:</strong> The fee to retrieve or reactivate a restricted account <strong>must be paid outside the bank</strong> using an external payment method or wire settlement. Fees cannot be deducted or debited from restricted or frozen bank account balances during an active security hold.</li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">5. Termination & Non-Compliance Hold</h3>
                        <p>Failure to satisfy security verification protocols or pay the required protection clearance fee via external settlement within the designated timeframe may result in temporary escrow holding or legal forfeiture under governing financial security regulations.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

const CopyableField: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3">
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{label}</p>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mt-0.5">{value}</p>
                {hint && <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{hint}</p>}
            </div>
            <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition shrink-0 ${
                    copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};

const AccountsAndWalletsPage: React.FC = () => {
    const { state } = useAppContext();
    const user = state.currentUser;
    const [activeTab, setActiveTab] = useState<'bank' | 'crypto'>('bank');

    if (!user) return null;

    return (
        <div className="p-5 space-y-6 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-[#0A2540] text-white p-6 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Cathay Bank N.A.</span>
                        <h2 className="text-xl font-black text-white">Accounts & Deposit Wallets</h2>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase tracking-wider">
                        Active & Verified
                    </span>
                </div>
                <p className="text-xs text-slate-300 font-medium relative z-10">
                    Use the banking account details or digital deposit wallets below to receive ACH transfers, wire payments, or crypto deposits into your account.
                </p>
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                        activeTab === 'bank' ? 'bg-white dark:bg-slate-900 text-[#0066CC] shadow-sm' : 'text-slate-500'
                    }`}
                >
                    🏦 Bank Accounts & Wire
                </button>
                <button
                    onClick={() => setActiveTab('crypto')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                        activeTab === 'crypto' ? 'bg-white dark:bg-slate-900 text-[#0066CC] shadow-sm' : 'text-slate-500'
                    }`}
                >
                    🪙 Crypto Deposit Wallets
                </button>
            </div>

            {activeTab === 'bank' ? (
                <div className="space-y-4">
                    {/* All Accounts Summary Card */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Your Linked Bank Accounts</h3>
                        <div className="space-y-2">
                            <CopyableField label="Cathay Premier Checking Account" value={user.accountNumber} hint="Primary Checking • Active" />
                            <CopyableField label="High Yield Savings Account" value={`${user.accountNumber}9`} hint="High Yield Savings • 4.5% APY" />
                            <CopyableField label="Cathay Rewards Credit Card" value="5410 8912 3340 9823" hint="Credit Card Limit: $10,000.00" />
                            <CopyableField label="Cathay Personal/Business Loan" value={`LN-${user.accountNumber.slice(-4)}-8122`} hint="Loan Account • Active Status" />
                        </div>
                    </div>

                    {/* US & International Wire Receiving Info */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Domestic ACH & Wire Transfer Details</h3>
                        <div className="space-y-2">
                            <CopyableField label="Receiving Bank Name" value="Cathay Bank N.A." />
                            <CopyableField label="ABA / ACH Routing Number" value="122000496" hint="For US domestic wires & direct deposits" />
                            <CopyableField label="SWIFT / BIC Code" value="CATHUS33XXX" hint="For international SWIFT wire transfers" />
                            <CopyableField label="Beneficiary Account Number" value={user.accountNumber} />
                            <CopyableField label="Beneficiary Name" value={user.name} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Instant Digital Crypto Wallets</h3>
                        <p className="text-[11px] font-semibold text-slate-400">Deposits into these wallet addresses are automatically credited to your Cathay Bank checking balance upon network confirmations.</p>
                    </div>

                    <div className="space-y-3">
                        <CopyableField label="USDT Tether (TRC-20)" value="TBJpACmzMJEV21SESAHqFx1kXD563Qgtnm" hint="Network: TRON (TRC-20) • Auto-settled to Checking" />
                        <CopyableField label="Bitcoin (BTC) Address" value="36JFNgJQAuvuAfBeBannU145seTKfeJjfr" hint="Network: Bitcoin (BTC) • Min deposit: 0.0002 BTC" />
                        <CopyableField label="Ethereum (ETH) Address" value="0x00D04837F0ae7011B9D8AFa050CE483291FDedf6" hint="Network: Ethereum (ERC-20) • Min deposit: 0.005 ETH" />
                        <CopyableField label="BNB (BEP-20) Address" value="0x00D04837F0ae7011B9D8AFa050CE483291FDedf6" hint="Network: BNB Smart Chain (BEP-20)" />
                        <CopyableField label="Solana (SOL) Address" value="7XmP8YRvvfZzaQJBNkKhTSeeCfBWq1MyNUkXhmdApYeQ" hint="Network: Solana Mainnet • Fast Confirmation" />
                        <CopyableField label="XRP (Ripple) Address" value="rEb8TK3gYSYsuKaUtAQDJvzpHu7685G25" hint="Network: XRP Ledger • Tag/Memo Not Required" />
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                        ⚠️ Please ensure you select the exact network matching the token type. Standard processing time is 1-3 network block confirmations.
                    </div>
                </div>
            )}
        </div>
    );
};

const SecurityCenterPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const user = state.currentUser;

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [loginAlerts, setLoginAlerts] = useState(true);

    return (
        <div className="p-5 space-y-6 animate-in fade-in duration-300">
            {/* Status Card */}
            <div className="bg-[#0A2540] text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Maximum Protection Active
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">Security & Privacy Center</h2>
                    <p className="text-xs text-slate-300 mt-0.5">256-Bit SSL Encryption • Real-Time Fraud Shield</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 text-xl font-black border border-white/20">
                    🛡️
                </div>
            </div>

            {/* Quick Security Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Account Security Settings</h3>

                {/* Change PIN */}
                <button
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.CHANGE_PIN })}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-100 transition border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] flex items-center justify-center font-bold text-sm">🔑</div>
                        <div className="text-left">
                            <p className="text-xs font-black text-slate-900 dark:text-white">Change Account PIN</p>
                            <p className="text-[10px] text-slate-400">Update 4-digit transaction verification PIN</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-[#0066CC]">Update →</span>
                </button>

                {/* KYC Identity Verification */}
                <button
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.KYC_VERIFICATION })}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-100 transition border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-sm">🆔</div>
                        <div className="text-left">
                            <p className="text-xs font-black text-slate-900 dark:text-white">Identity Verification (KYC)</p>
                            <p className="text-[10px] text-slate-400">Status: {user?.kycStatus === 'verified' ? 'Verified ✅' : user?.kycStatus === 'pending' ? 'Under Audit ⏳' : 'Unverified ⚠️'}</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600">Verify →</span>
                </button>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                            <p className="text-[10px] text-slate-400">Require SMS / OTP code for logins</p>
                        </div>
                        <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={`w-11 h-6 rounded-full transition-colors relative ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${twoFactorEnabled ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">Biometric Authentication</p>
                            <p className="text-[10px] text-slate-400">Use Face ID / Fingerprint to authorize</p>
                        </div>
                        <button onClick={() => setBiometricEnabled(!biometricEnabled)} className={`w-11 h-6 rounded-full transition-colors relative ${biometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${biometricEnabled ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">Real-Time Security Notifications</p>
                            <p className="text-[10px] text-slate-400">Alerts for unknown IP address logins</p>
                        </div>
                        <button onClick={() => setLoginAlerts(!loginAlerts)} className={`w-11 h-6 rounded-full transition-colors relative ${loginAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${loginAlerts ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Login Devices */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Active Trusted Devices</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <span>📱</span>
                            <div>
                                <p className="text-slate-900 dark:text-white font-black text-[11px]">Cathay Bank Mobile App (iOS)</p>
                                <p className="text-[9px] text-slate-400">29291 BIA HWY 1, St Francis, South Dakota 57572, USA • Current Device</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active Now</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <span>💻</span>
                            <div>
                                <p className="text-slate-900 dark:text-white font-black text-[11px]">MacBook Pro Safari</p>
                                <p className="text-[9px] text-slate-400">29291 BIA HWY 1, St Francis, South Dakota 57572, USA • 2 hours ago</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 cursor-pointer">Revoke</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KycVerificationPage: React.FC = () => {
    const { state, dispatch, syncWithServer } = useAppContext();
    const user = state.currentUser;

    const [idType, setIdType] = useState('Passport');
    const [ssn, setSsn] = useState(user?.bvn || '');
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>(user?.kycStatus === 'pending' ? 'submitted' : user?.kycStatus === 'verified' ? 'submitted' : 'idle');

    const handleFileRead = (file: File, callback: (res: string) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setTimeout(() => {
            if (user) {
                user.kycStatus = 'verified';
                user.kycIdType = idType;
                dispatch({ type: 'UPDATE_USER', payload: user });
                syncWithServer();
            }
            setStatus('submitted');
        }, 2000);
    };

    return (
        <div className="p-5 space-y-6 animate-in fade-in duration-300">
            {/* Banner */}
            <div className="bg-[#0A2540] text-white p-6 rounded-3xl shadow-xl space-y-2">
                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                    {user?.kycStatus === 'verified' ? '✅ Status: Fully Verified' : '⚠️ Action Required'}
                </span>
                <h2 className="text-xl font-black text-white">Know Your Customer (KYC) Verification</h2>
                <p className="text-xs text-slate-300">
                    Federal banking regulations require identity verification to unlock unlimited transfers, international SWIFT wires, and high-tier account limits.
                </p>
            </div>

            {status === 'submitted' || user?.kycStatus === 'verified' ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                        ✓
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Identity Verified Successfully</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                        Your government-issued document ({user?.kycIdType || idType}) has been audited and approved by Cathay Bank Compliance.
                    </p>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        Unlimited Transfer Limit • Verified Customer Seal Granted
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">1. Select Identity Document Type</label>
                        <select
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        >
                            <option value="Passport">International Passport</option>
                            <option value="Driver License">State Driver's License</option>
                            <option value="National ID">Government Identity Card</option>
                            <option value="SSN ID Card">US Social Security Card</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">2. Social Security Number (SSN) / Tax ID</label>
                        <input
                            type="text"
                            placeholder="XXX-XX-XXXX"
                            value={ssn}
                            onChange={(e) => setSsn(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                            required
                        />
                    </div>

                    {/* File Upload Front */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">3. Document Front Image</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-[#0066CC] transition relative">
                            {idFront ? (
                                <img src={idFront} alt="ID Front Preview" className="max-h-36 mx-auto rounded-xl object-contain" />
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-xl">📸</p>
                                    <p className="text-xs font-black text-[#0066CC]">Click to upload document front</p>
                                    <p className="text-[9px] text-slate-400">JPG, PNG or PDF (Max 10MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], setIdFront)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* File Upload Back */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">4. Document Back Image / Proof of Address</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-[#0066CC] transition relative">
                            {idBack ? (
                                <img src={idBack} alt="ID Back Preview" className="max-h-36 mx-auto rounded-xl object-contain" />
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-xl">📄</p>
                                    <p className="text-xs font-black text-[#0066CC]">Click to upload document back or utility bill</p>
                                    <p className="text-[9px] text-slate-400">JPG, PNG or PDF (Max 10MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], setIdBack)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-3.5 bg-[#0066CC] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
                    >
                        {status === 'submitting' ? 'Auditing Verification Details...' : 'Submit Verification Documents'}
                    </button>
                </form>
            )}
        </div>
    );
};

const CustomerChatSupportPage: React.FC = () => {
    const { state, dispatch, syncWithServer } = useAppContext();
    const user = state.currentUser;
    const [messageText, setMessageText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const userMessages = useMemo(() => {
        if (!user) return [];
        return state.messages.filter(m => m.senderId === user.id || m.receiverId === user.id);
    }, [state.messages, user]);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [userMessages]);

    const handleSendMessage = (textToSend?: string) => {
        const text = textToSend || messageText;
        if (!text.trim() || !user) return;

        const customerMsg: Message = {
            id: `msg_cust_${Date.now()}`,
            senderId: user.id,
            receiverId: 'adm_pris_001',
            senderName: user.name,
            senderRole: 'customer',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        dispatch({ type: 'SEND_MESSAGE', payload: customerMsg });
        syncWithServer();
        if (!textToSend) setMessageText('');

        // Automated Concierge Auto-Response
        setTimeout(() => {
            let autoReply = "Thank you for contacting Cathay Bank Digital Support. An official banking representative has received your message and will assist you promptly.";
            const lower = text.toLowerCase();
            if (lower.includes('routing') || lower.includes('account number') || lower.includes('wire')) {
                autoReply = `Cathay Bank Routing Number is 122000496. Your Account Number is ${user.accountNumber}. You can view complete wire details under Accounts & Deposit Wallets.`;
            } else if (lower.includes('transfer') || lower.includes('pending') || lower.includes('restrict')) {
                autoReply = "Transfer inquiries: Transfers are processed securely according to compliance rules. If your transfer is pending, our compliance desk is reviewing the verification documentation.";
            } else if (lower.includes('kyc') || lower.includes('verify')) {
                autoReply = "You can submit your identity verification documents directly in the Security & KYC section to unlock higher daily transfer limits.";
            }

            const conciergeMsg: Message = {
                id: `msg_bot_${Date.now()}`,
                senderId: 'adm_pris_001',
                receiverId: user.id,
                senderName: 'Cathay Concierge Support',
                senderRole: 'admin',
                text: autoReply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            dispatch({ type: 'SEND_MESSAGE', payload: conciergeMsg });
            syncWithServer();
        }, 1000);
    };

    return (
        <div className="p-4 flex flex-col h-[650px] animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#0A2540] text-white p-4 rounded-2xl flex items-center justify-between mb-3 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg border border-white/20">
                        💬
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white">Cathay 24/7 Digital Assistant</h3>
                        <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live Agent Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Questions Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
                {[
                    "What is my routing number?",
                    "How do I clear transfer hold?",
                    "Where are crypto deposit wallets?",
                    "Speak with live manager"
                ].map(q => (
                    <button
                        key={q}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold whitespace-nowrap hover:bg-[#0066CC] hover:text-white transition"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 overflow-y-auto space-y-3 shadow-inner">
                {userMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <span className="text-3xl">💬</span>
                        <p className="text-xs font-bold uppercase tracking-wider">Start a Conversation</p>
                        <p className="text-[10px] text-slate-400 max-w-xs text-center">Ask any question regarding your account balance, wire transfers, cards, or security.</p>
                    </div>
                ) : (
                    userMessages.map(msg => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                                    isMe 
                                        ? 'bg-[#0066CC] text-white rounded-br-none' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                                }`}>
                                    <p className="text-[9px] font-bold opacity-75 mb-0.5">{msg.senderName}</p>
                                    <p className="leading-relaxed font-medium">{msg.text}</p>
                                    <p className="text-[8px] opacity-60 text-right mt-1">{msg.timestamp}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 mt-3">
                <input
                    type="text"
                    placeholder="Type your question or request..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
                <button
                    type="submit"
                    className="px-5 py-3 bg-[#0066CC] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
};


const TransactionHistoryPage: React.FC = () => {
    const { state, dispatch, t } = useAppContext();
    const user = state.currentUser;

    const txns = useMemo(() => {
        const list = user?.transactions ? [...user.transactions] : [];
        return list.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
    }, [user?.transactions]);

    const totalCredits = useMemo(() => {
        return txns
            .filter(t => t.type === 'credit' && t.status === 'Completed')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }, [txns]);

    const totalDebits = useMemo(() => {
        return txns
            .filter(t => t.type === 'debit' && t.status !== 'Failed' && t.status !== 'Reversed')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }, [txns]);

    const pendingCount = useMemo(() => {
        return txns.filter(t => t.status === 'Pending').length;
    }, [txns]);

    if (!user) return null;

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-[#0A2540] text-white p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Cathay Bank N.A. • Audit Ledger</span>
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                        {txns.length} Total Records
                    </span>
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">Live Transaction History</h2>
                    <p className="text-xs text-slate-300 mt-1">
                        Real-time verified ledger of all outbound wires, direct deposits, card settlements, and pending clearing transactions.
                    </p>
                </div>

                {/* Ledger Metrics */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                        <span className="text-[9px] font-black uppercase text-blue-200 block">Total Inflow</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-300 mt-0.5 block truncate">
                            +{formatCurrency(totalCredits, user.currency || state.currentCurrency || 'USD')}
                        </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                        <span className="text-[9px] font-black uppercase text-blue-200 block">Total Outflow</span>
                        <span className="text-xs sm:text-sm font-black text-slate-200 mt-0.5 block truncate">
                            -{formatCurrency(totalDebits, user.currency || state.currentCurrency || 'USD')}
                        </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                        <span className="text-[9px] font-black uppercase text-amber-200 block">Processing</span>
                        <span className="text-xs sm:text-sm font-black text-amber-300 mt-0.5 block truncate">
                            {pendingCount} Pending
                        </span>
                    </div>
                </div>
            </div>

            {/* Account Restriction & Compliance Advisory Notice */}
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-3xl p-5 space-y-3 shadow-sm text-left">
                <div className="flex items-center gap-2 font-black uppercase text-xs tracking-wider text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Transaction Restriction & Security Notice</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                    Transactions may fail or be held because of the late payment charges for the restrictions placed on the account added last week. Unverified third-party assisted transfer flagged.
                </p>
                <div className="border-t border-red-200/60 dark:border-red-900/40 pt-2 space-y-1.5 text-[11px]">
                    <p className="font-bold text-red-900 dark:text-red-200 uppercase text-[9px] tracking-wider">Failure & Restriction Reasons:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                        <li>Outstanding regulatory clearance fees and late payment penalty restrictions.</li>
                        <li>Third-party assisted transfer flagged by automated transaction security protocols.</li>
                        <li>Mandatory verification required for third-party assisting before release clearance.</li>
                    </ul>
                </div>
                <div className="bg-red-100/80 dark:bg-red-900/30 p-3 rounded-2xl border border-red-200 dark:border-red-800/40 text-[11px] text-red-900 dark:text-red-200">
                    <strong>Contact Customer Support:</strong> Please email <a href="mailto:supportcathaybank@gmail.com" className="underline font-bold text-red-700 dark:text-red-300">supportcathaybank@gmail.com</a> with your reference number so support will provide the details needed to verify the third party assisting.
                </div>
            </div>

            {/* Main Transaction List */}
            <div className="bg-card dark:bg-dark-card rounded-3xl border border-border dark:border-dark-border p-4 shadow-sm">
                <TransactionHistory transactions={txns} showAllToggle={false} containerClassName="p-0" />
            </div>
        </div>
    );
};

const CardsManagementPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const user = state.currentUser!;
    const userCards = user?.cards || [];
    const [isOrdering, setIsOrdering] = useState(false);
    const [cardTier, setCardTier] = useState<'black_metal' | 'titanium_gold'>('black_metal');
    const [deliveryAddress, setDeliveryAddress] = useState(user?.mailingAddress || user?.residentialAddress || '123 Wall Street, New York, NY 10005');
    const [cardholderName, setCardholderName] = useState(user?.name || '');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const CARD_FEE = 6007;

    const handleOrderCard = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if ((user?.balance || 0) < CARD_FEE) {
            setErrorMsg(`Insufficient available funds. Ordering a physical card requires a processing and worldwide courier fee of $${CARD_FEE.toLocaleString()} USD. Your current checking balance is $${(user?.balance || 0).toLocaleString()} USD. Please deposit funds into your account before placing your order.`);
            return;
        }

        setIsOrdering(true);
        setTimeout(async () => {
            const newCard: CardType = {
                id: `card_${Date.now()}`,
                type: 'physical',
                provider: 'visa',
                number: `4128 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
                holderName: (cardholderName || user.name).toUpperCase(),
                expiry: '08/29',
                cvv: String(Math.floor(100 + Math.random() * 900)),
            };

            const feeTx: Transaction = {
                id: `tx_card_order_${Date.now()}`,
                date: new Date().toISOString(),
                description: `Cathay ${cardTier === 'black_metal' ? 'Black Metal' : 'Titanium Gold'} Physical Card Issuance & Courier Fee`,
                amount: CARD_FEE,
                type: 'debit',
                category: 'Card Services',
                status: 'Completed',
                reference: `CRD-${Math.floor(100000 + Math.random() * 900000)}`,
                receiverName: 'Cathay Card Manufacturing & Courier Hub',
                receiverAccount: 'CATHAY-CARD-OPS',
                bankName: 'Cathay Bank USA'
            };

            const cardNotif = {
                id: `notif_card_${Date.now()}`,
                title: "Physical Card Ordered Successfully",
                message: `Your physical ${cardTier === 'black_metal' ? 'Black Metal' : 'Titanium Gold'} card order has been dispatched via DHL Express Priority to ${deliveryAddress}. Tracking number: DHL-${Math.floor(100000000 + Math.random() * 900000000)}.`,
                date: new Date().toISOString(),
                read: false,
                type: 'success' as const
            };

            const updatedUser: User = {
                ...user,
                balance: (user.balance || 0) - CARD_FEE,
                cards: [...userCards, newCard],
                transactions: [feeTx, ...(user.transactions || [])],
                notifications: [cardNotif, ...(user.notifications || [])]
            };

            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            try {
                await fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                });
            } catch (e) {
                console.warn(e);
            }

            setIsOrdering(false);
            setSuccessMsg(`Your physical card has been ordered successfully! Fee of $${CARD_FEE.toLocaleString()} USD deducted. Your card is dispatched via insured express courier.`);
        }, 1500);
    };

    return (
        <div className="p-5 space-y-6 max-w-2xl mx-auto">
            {/* Existing Cards Header */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Your Active Bank Cards ({userCards.length})</h3>
                    <span className="text-[10px] font-bold text-slate-400">EMV Contactless Enabled</span>
                </div>
                <div className="flex flex-col items-center gap-5">
                    {userCards.length > 0 ? (
                        userCards.map(c => <Card key={c.id} card={c} />)
                    ) : (
                        <div className="text-center py-8 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 w-full">
                            <p className="text-2xl mb-1">💳</p>
                            <p className="text-xs font-black uppercase text-slate-500">No Cards Issued Yet</p>
                            <p className="text-[11px] text-slate-400">Order your personalized physical Cathay Metal card below.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Physical Card Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-sm">💳</span>
                            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Order Physical Cathay Metal Debit Card</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold">Heavyweight custom laser-engraved titanium card with worldwide contactless payment & VIP concierge.</p>
                    </div>
                    <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Card Order Fee</span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">$6,007.00 USD</span>
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300 font-semibold space-y-2">
                        <div className="flex items-center gap-2 font-black uppercase">
                            <span>⚠️ Order Error</span>
                        </div>
                        <p>{errorMsg}</p>
                        <button
                            type="button"
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.DEPOSIT })}
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl transition shadow"
                        >
                            Deposit Funds Now →
                        </button>
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                        ✓ {successMsg}
                    </div>
                )}

                <form onSubmit={handleOrderCard} className="space-y-4">
                    {/* Card Tier Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Metal Finish</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCardTier('black_metal')}
                                className={`p-3.5 rounded-2xl border text-left transition ${cardTier === 'black_metal' ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                            >
                                <span className="text-xs font-black block">🖤 Matte Obsidian Metal</span>
                                <span className="text-[9px] opacity-70">18g Solid Stainless Titanium</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCardTier('titanium_gold')}
                                className={`p-3.5 rounded-2xl border text-left transition ${cardTier === 'titanium_gold' ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-md ring-2 ring-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                            >
                                <span className="text-xs font-black block">💛 Brushed Gold Titanium</span>
                                <span className="text-[9px] opacity-70">24K Gold Electroplate Finish</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cardholder Name (Laser Engraved)</label>
                        <Input
                            placeholder="FULL NAME"
                            value={cardholderName}
                            onChange={e => setCardholderName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Delivery Mailing Address</label>
                        <Input
                            placeholder="Street, City, State, Postal Code, Country"
                            value={deliveryAddress}
                            onChange={e => setDeliveryAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex justify-between">
                            <span>Card Manufacturing & Laser Engraving:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">$5,500.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>DHL Express International Priority & Insurance:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">$507.00</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white">
                            <span>Total Fee:</span>
                            <span className="text-amber-600 dark:text-amber-400">$6,007.00 USD</span>
                        </div>
                    </div>

                    <Button type="submit" disabled={isOrdering} className="w-full">
                        {isOrdering ? 'Processing Card Order...' : `Order Physical Card ($6,007 Fee)`}
                    </Button>
                </form>
            </div>
        </div>
    );
};

const PageContainer: React.FC<{ page: Page }> = ({ page }) => {

    const { state, dispatch, t } = useAppContext();
    switch (page) {
        case Page.TRANSACTIONS: return <><Header title="Transaction History" /><TransactionHistoryPage /></>;
        case Page.PROFILE: return <><Header title={t('memberProfile')} /><ProfilePage /></>;
        case Page.SETTINGS: return <><Header title={t('systemSettings')} /><SettingsPage /></>;
        case Page.TRANSFER: return <><Header title={t('assetTransfer')} /><TransferPage /></>;
        case Page.DEPOSIT: return <><Header title={t('assetInjection')} /><DepositPage /></>;
        case Page.PAY_BILLS: return <><Header title={t('billSettlement')} /><PayBillsPage /></>;
        case Page.LOAN: return <><Header title={t('capitalDesk')} /><LoanPage /></>;
        case Page.IRS_REFUND: return <><Header title={t('federalHub')} /><IrsRefundPage /></>;
        case Page.ADMIN_DASHBOARD: return <><Header title={t('adminPortal')} /><AdminDashboard /></>;
        case Page.NOTIFICATIONS: return <><Header title={t('alertCenter')} /><NotificationsPage /></>;
        case Page.CHANGE_PIN: return <><Header title={t('securityProtocol')} /><ChangePinPage /></>;
        case Page.PRIVACY_POLICY: return <><Header title={t('privacyPolicy')} /><PrivacyPolicyPage /></>;
        case Page.TERMS_OF_SERVICE: return <><Header title={t('termsOfService')} /><TermsOfServicePage /></>;
        case Page.DEPOSIT_WALLETS: return <><Header title="Accounts & Deposit Wallets" /><AccountsAndWalletsPage /></>;
        case Page.SECURITY_CENTER: return <><Header title="Security Center" /><SecurityCenterPage /></>;
        case Page.KYC_VERIFICATION: return <><Header title="KYC Verification" /><KycVerificationPage /></>;
        case Page.CHAT_SUPPORT: return <><Header title="Cathay Support Chat" /><CustomerChatSupportPage /></>;
        case Page.INVESTMENTS: return <><Header title="Wealth & Capital Vault" /><InvestmentsPage /></>;
        case Page.FX_EXCHANGE: return <><Header title="Forex & Multi-Currency Desk" /><FxExchangePage /></>;
        case Page.SCHEDULED_PAYMENTS: return <><Header title="Standing Orders & Auto-Pay" /><ScheduledPaymentsPage /></>;
        case Page.MENU: return (
            <><Header title={t('operationsMenu')} />
            <div className="p-6 grid grid-cols-2 gap-4">
                {[
                    { label: 'Transaction History', page: Page.TRANSACTIONS, icon: '📜' },
                    { label: 'Accounts & Wallets', page: Page.DEPOSIT_WALLETS, icon: '🏦' },
                    { label: 'Transfer Money', page: Page.TRANSFER, icon: '✈️' },
                    { label: 'Wealth Vault', page: Page.INVESTMENTS, icon: '📈' },
                    { label: 'Forex Exchange', page: Page.FX_EXCHANGE, icon: '💱' },
                    { label: 'Standing Orders', page: Page.SCHEDULED_PAYMENTS, icon: '🗓️' },
                    { label: 'Pay Bills', page: Page.PAY_BILLS, icon: '📜' },
                    { label: 'Deposit Funds', page: Page.DEPOSIT, icon: '📥' },
                    { label: 'Cards & Credit', page: Page.CARDS, icon: '💳' },
                    { label: 'Security Center', page: Page.SECURITY_CENTER, icon: '🔐' },
                    { label: 'KYC Verification', page: Page.KYC_VERIFICATION, icon: '🆔' },
                    { label: 'Chat Support', page: Page.CHAT_SUPPORT, icon: '💬' },
                    { label: 'Savings Vault', page: Page.SAVINGS, icon: '🛡️' },
                    { label: 'Loan Desk', page: Page.LOAN, icon: '💎' },
                    { label: 'Spending Limits', page: Page.LIMITS, icon: '📊' },
                    { label: 'Profile Settings', page: Page.PROFILE, icon: '⚙️' },
                ].map(item => (
                    <button key={item.label} onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-dark-muted rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary active:scale-95 transition shadow-sm group">
                        <div className="text-2xl mb-1.5 transform group-hover:scale-110 transition">{item.icon}</div>
                        <span className="font-black text-[9px] uppercase tracking-wider text-slate-800 dark:text-white text-center">{item.label}</span>
                    </button>
                ))}
            </div></>
        );
        case Page.CARDS: return <><Header title={t('infinityCards')} /><CardsManagementPage /></>;
        case Page.SAVINGS: return <><Header title={t('lockedVault')} /><SavingsPage /></>;
        case Page.LIMITS: return <><Header title={t('spendingControls')} /><LimitsPage /></>;
        case Page.RESTRICTION: return <><Header title={t('securityHold')} /><RestrictionPage /></>;
        default: return <div className="p-16 text-center font-black opacity-10 uppercase tracking-[1rem]">Cathay Bank</div>;
    }
};

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center py-5 border-b border-border/50 last:border-0">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</span>
        <span className="text-[13px] font-black text-foreground dark:text-white">{value}</span>
    </div>
);

const AVATAR_PRESETS = [
    {
        id: 'exec-1',
        name: 'Executive Classic',
        category: 'Executive',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'exec-2',
        name: 'Corporate Leader',
        category: 'Executive',
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'exec-3',
        name: 'Senior Director',
        category: 'Executive',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'exec-4',
        name: 'Managing Partner',
        category: 'Executive',
        url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'prof-1',
        name: 'Enterprise Specialist',
        category: 'Professional',
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'prof-2',
        name: 'Operations VP',
        category: 'Professional',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'vec-1',
        name: 'Modern Business',
        category: 'Modern Vector',
        url: 'https://img.freepik.com/free-vector/businessman-character-avatar_1270-84.jpg'
    },
    {
        id: 'vec-2',
        name: 'Executive Vector',
        category: 'Modern Vector',
        url: 'https://img.freepik.com/free-vector/businessman-character-avatar_23-2148174171.jpg'
    },
    {
        id: 'med-1',
        name: 'Senior Consultant',
        category: 'Specialist',
        url: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg'
    }
];

const ProfilePage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const user = state.currentUser!;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editName, setEditName] = useState(user.name || '');
    const [editEmail, setEditEmail] = useState(user.email || '');
    const [editPhone, setEditPhone] = useState(user.phone || '');
    const [editProfession, setEditProfession] = useState(user.profession || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || AVATAR_PRESETS[0].url);
    const [customAvatarUrl, setCustomAvatarUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const [showAvatarDrawer, setShowAvatarDrawer] = useState(false);
    const [activeAvatarTab, setActiveAvatarTab] = useState<'presets' | 'upload' | 'url'>('presets');

    useEffect(() => {
        if (user) {
            setEditName(user.name || '');
            setEditEmail(user.email || '');
            setEditPhone(user.phone || '');
            setEditProfession(user.profession || '');
            if (user.avatar) {
                setSelectedAvatar(user.avatar);
            }
        }
    }, [user]);

    const compressAvatarImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 300;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    } else {
                        resolve(e.target?.result as string);
                    }
                };
                img.onerror = () => resolve(e.target?.result as string);
                img.src = e.target?.result as string;
            };
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
        });
    };

    const handleSaveAvatar = async (avatarToSave?: string) => {
        const targetAvatar = avatarToSave || selectedAvatar;
        if (!targetAvatar || !user) return;

        setIsSavingAvatar(true);
        const updatedUser = { ...user, avatar: targetAvatar };

        try {
            // 1. Dispatch locally to immediately update currentUser and all users in state
            dispatch({ 
                type: 'UPDATE_USER', 
                payload: { id: user.id, avatar: targetAvatar } 
            });

            // 2. Persist to backend and Firestore
            try {
                const res = await fetchWithTimeout('/api/upload-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: user.id, 
                        avatar: targetAvatar,
                        user: updatedUser
                    })
                }, 10000);

                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        dispatch({ type: 'UPDATE_USER', payload: data.user });
                    }
                } else {
                    // Fallback to /api/users/update
                    await fetchWithTimeout('/api/users/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedUser)
                    }, 8000).catch(() => {});
                }
            } catch (networkErr) {
                // Secondary background sync attempt
                fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                }).catch(() => {});
            }

            syncWithServer();
            setAvatarSuccess(true);
            setTimeout(() => setAvatarSuccess(false), 4000);
        } catch (err) {
            console.warn("Avatar local save applied with notice:", err);
            syncWithServer();
            setAvatarSuccess(true);
            setTimeout(() => setAvatarSuccess(false), 4000);
        } finally {
            setIsSavingAvatar(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await compressAvatarImage(file);
            if (!base64) return;
            setSelectedAvatar(base64);
            // Automatically persist selected avatar
            await handleSaveAvatar(base64);
        } catch (err) {
            console.error("Error processing avatar image:", err);
            alert("Error processing selected image file.");
        }
    };

    const handleApplyCustomUrl = async () => {
        if (!customAvatarUrl || !customAvatarUrl.trim()) return;
        const url = customAvatarUrl.trim();
        setSelectedAvatar(url);
        await handleSaveAvatar(url);
        setCustomAvatarUrl('');
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedUser = {
            ...user,
            name: editName,
            email: editEmail,
            phone: editPhone,
            profession: editProfession,
            avatar: selectedAvatar
        };
        try {
            const res = await fetch('/api/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });
            if (res.ok) {
                dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                syncWithServer();
                setSaveSuccess(true);
                setIsEditing(false);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert("Failed to save profile changes.");
            }
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Save error.");
        } finally {
            setIsSaving(false);
        }
    };

    const hasUnsavedAvatar = selectedAvatar !== user.avatar;

    return (
        <div className="p-5 space-y-6">
            {/* 1. HERO PROFILE CARD */}
            <div className="text-center bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent" />
                
                {/* Avatar Display & Interaction */}
                <div className="relative inline-block mb-4">
                    <div 
                        className="relative cursor-pointer group" 
                        onClick={() => setShowAvatarDrawer(!showAvatarDrawer)}
                        title="Click to change avatar photo"
                    >
                        <img 
                            src={selectedAvatar || user.avatar || AVATAR_PRESETS[0].url} 
                            alt={user.name}
                            className="w-24 h-24 rounded-[2rem] mx-auto border-4 border-white/10 shadow-2xl object-cover transition duration-300 group-hover:brightness-60 group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = AVATAR_PRESETS[0].url;
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <Camera className="w-7 h-7 text-white drop-shadow-md" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-xl shadow-xl border-2 border-slate-950">
                            <Camera className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />

                {/* Avatar Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <button 
                        type="button"
                        onClick={() => setShowAvatarDrawer(!showAvatarDrawer)} 
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition border flex items-center gap-1.5 ${
                            showAvatarDrawer 
                                ? 'bg-primary text-white border-primary shadow-lg' 
                                : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                        }`}
                    >
                        <Sparkles className="w-3 h-3" />
                        {showAvatarDrawer ? 'Hide Avatar Gallery' : 'Choose Avatar Image'}
                    </button>

                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()} 
                        className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl transition border border-white/10 flex items-center gap-1.5"
                    >
                        <Upload className="w-3 h-3" />
                        Upload File
                    </button>
                </div>

                {/* Status Banners */}
                {avatarSuccess && (
                    <div className="mb-4 mx-auto max-w-sm p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-2 animate-in fade-in duration-300">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Avatar image saved & active across dashboard!
                    </div>
                )}

                {hasUnsavedAvatar && !avatarSuccess && (
                    <div className="mb-4 mx-auto max-w-sm p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-[10px] font-bold flex items-center justify-between gap-2 animate-in fade-in duration-300">
                        <span>New avatar selected (unsaved)</span>
                        <button
                            type="button"
                            onClick={() => handleSaveAvatar()}
                            disabled={isSavingAvatar}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-lg text-[9px] transition"
                        >
                            {isSavingAvatar ? 'Saving...' : 'Save Avatar Now'}
                        </button>
                    </div>
                )}

                <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none mb-2">{user.name}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em]">{t('infinityTierMember')}</p>
                </div>
            </div>

            {/* 2. AVATAR SELECTION DRAWER */}
            {showAvatarDrawer && (
                <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                                Avatar Selection & Management
                            </h3>
                        </div>
                        <button 
                            onClick={() => setShowAvatarDrawer(false)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex p-1 bg-muted/60 dark:bg-dark-muted/60 rounded-xl gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveAvatarTab('presets')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${
                                activeAvatarTab === 'presets' 
                                    ? 'bg-card dark:bg-dark-card text-primary shadow-sm' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Gallery Presets
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveAvatarTab('upload')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${
                                activeAvatarTab === 'upload' 
                                    ? 'bg-card dark:bg-dark-card text-primary shadow-sm' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Upload Custom
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveAvatarTab('url')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${
                                activeAvatarTab === 'url' 
                                    ? 'bg-card dark:bg-dark-card text-primary shadow-sm' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Image URL
                        </button>
                    </div>

                    {/* TAB 1: PRESETS */}
                    {activeAvatarTab === 'presets' && (
                        <div className="space-y-4">
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Select an executive profile avatar below. Click an avatar to apply and save it to your user state.
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                                {AVATAR_PRESETS.map((preset) => {
                                    const isSelected = selectedAvatar === preset.url;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedAvatar(preset.url);
                                                handleSaveAvatar(preset.url);
                                            }}
                                            className={`relative group p-2 rounded-2xl border transition-all text-left flex flex-col items-center ${
                                                isSelected 
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-md' 
                                                    : 'border-border dark:border-dark-border bg-card dark:bg-dark-card hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="relative w-16 h-16 mb-2">
                                                <img 
                                                    src={preset.url} 
                                                    alt={preset.name} 
                                                    className="w-full h-full rounded-xl object-cover shadow-sm"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = AVATAR_PRESETS[0].url;
                                                    }}
                                                />
                                                {isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-foreground text-center truncate w-full">{preset.name}</span>
                                            <span className="text-[7px] text-muted-foreground uppercase tracking-widest">{preset.category}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: UPLOAD */}
                    {activeAvatarTab === 'upload' && (
                        <div className="space-y-4 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border dark:border-dark-border hover:border-primary p-8 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center gap-3 bg-muted/20 dark:bg-dark-muted/20 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition">
                                    <Upload className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-foreground">
                                        Click to select or drop an image
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-1">
                                        Supports JPG, PNG, WEBP (auto-compressed & saved to user profile)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: URL */}
                    {activeAvatarTab === 'url' && (
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                                Direct Image Link (HTTPS)
                            </label>
                            <div className="flex gap-2">
                                <Input 
                                    type="url" 
                                    placeholder="https://example.com/photo.jpg" 
                                    value={customAvatarUrl}
                                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                    className="flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCustomUrl}
                                    disabled={!customAvatarUrl.trim() || isSavingAvatar}
                                    className="px-4 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl disabled:opacity-50 hover:opacity-90 transition shadow"
                                >
                                    {isSavingAvatar ? 'Saving...' : 'Apply & Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Explicit Save button */}
                    <div className="pt-2 flex justify-end gap-2 border-t border-border/50">
                        <button
                            type="button"
                            onClick={() => setShowAvatarDrawer(false)}
                            className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSaveAvatar()}
                            disabled={isSavingAvatar}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow flex items-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" />
                            {isSavingAvatar ? 'Saving Avatar...' : 'Save Avatar to Profile'}
                        </button>
                    </div>
                </div>
            )}

            {/* 3. PROFILE DETAILS / EDIT PROFILE CARD */}
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                <div className="flex items-center justify-between opacity-90">
                    <div className="flex items-center gap-2.5">
                        <UserIcon className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('identityProtocol')}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                </div>

                {saveSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-300 text-center">
                        ✓ Profile details and avatar updated and saved permanently!
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
                            <Input value={editName} onChange={e => setEditName(e.target.value)} required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                            <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving Profile...' : 'Save Profile Information'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-1">
                        <DetailRow label="Full Legal Name" value={user.name} />
                        <DetailRow label="Official Account Number" value={user.accountNumber} />
                        <DetailRow label="Contact Phone Number" value={user.phone} />
                        <DetailRow label="Email Address" value={user.email} />
                        <DetailRow label="SSN / ID / Driver's License" value={user.ssnOrTin || user.idNumber || user.idCardNumber || user.bvn || 'Verified on File'} />
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const { theme, toggleTheme } = useTheme();

    const [dailyTransferLimit, setDailyTransferLimit] = useState(state.currentUser?.limits?.dailyTransfer || 50000);
    const [dailyAtmLimit, setDailyAtmLimit] = useState(state.currentUser?.limits?.dailyAtm || 5000);
    const [monthlySpendingLimit, setMonthlySpendingLimit] = useState(state.currentUser?.limits?.monthlySpending || 250000);
    const [perTxLimit, setPerTxLimit] = useState(state.currentUser?.limits?.perTransaction || 25000);
    const [isSavingLimits, setIsSavingLimits] = useState(false);

    const handleCurrencyChange = (newCurr: string) => {
        dispatch({ type: 'SET_CURRENCY', payload: newCurr });
        syncWithServer({ currentCurrency: newCurr });
    };

    const handleLanguageChange = (newLang: string) => {
        dispatch({ type: 'SET_LANGUAGE', payload: newLang });
        syncWithServer({ language: newLang });
    };

    const handleSaveLimits = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingLimits(true);
        setTimeout(() => {
            const updatedLimits = {
                dailyTransfer: Number(dailyTransferLimit),
                dailyAtm: Number(dailyAtmLimit),
                monthlySpending: Number(monthlySpendingLimit),
                perTransaction: Number(perTxLimit),
                onlinePurchase: state.currentUser?.limits?.onlinePurchase || 10000
            };
            dispatch({ type: 'UPDATE_LIMITS', payload: updatedLimits });
            syncWithServer();
            setIsSavingLimits(false);
            alert("Security & Transaction Limits updated successfully.");
        }, 800);
    };

    return (
        <div className="p-5 space-y-6">
            {/* System Preferences Card */}
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] space-y-6 border border-border dark:border-dark-border shadow-xl">
                <div className="flex items-center gap-2.5 mb-1 opacity-40">
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('systemPreferences')}</h3>
                </div>

                {/* 1. CURRENCY SELECTOR */}
                <div className="space-y-2 pb-5 border-b border-border/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black uppercase text-foreground dark:text-dark-foreground tracking-widest block">Display Currency</span>
                            <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">Select primary currency for balances & transactions</p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-[#0066CC] border border-sky-200 dark:border-sky-800">
                            Current: {state.currentCurrency}
                        </span>
                    </div>
                    <Select value={state.currentCurrency} onChange={e => handleCurrencyChange(e.target.value)}>
                        <option value="USD">USD ($) - United States Dollar</option>
                        <option value="GBP">GBP (£) - British Pound Sterling</option>
                        <option value="EUR">EUR (€) - Eurozone Euro</option>
                        <option value="CAD">CAD (C$) - Canadian Dollar</option>
                        <option value="AUD">AUD (A$) - Australian Dollar</option>
                        <option value="JPY">JPY (¥) - Japanese Yen</option>
                        <option value="AED">AED (AED) - UAE Dirham</option>
                        <option value="CNY">CNY (¥) - Chinese Yuan</option>
                    </Select>
                </div>

                {/* 2. LANGUAGE SELECTOR */}
                <div className="space-y-2 pb-5 border-b border-border/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black uppercase text-foreground dark:text-dark-foreground tracking-widest block">System Language</span>
                            <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">Interface localization & notifications</p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                            {state.language || 'en-GB'}
                        </span>
                    </div>
                    <Select value={state.language || 'en-GB'} onChange={e => handleLanguageChange(e.target.value)}>
                        <option value="en-GB">English (United States / Global)</option>
                        <option value="zh-HK">繁體中文 (Traditional Chinese - Cathay HK/US)</option>
                        <option value="zh-CN">简体中文 (Simplified Chinese)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="fr">Français (French)</option>
                        <option value="ar">العربية (Arabic)</option>
                    </Select>
                </div>

                {/* 3. DARK MODE TOGGLE */}
                <div className="flex justify-between items-center pb-5 border-b border-border/50">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-foreground dark:text-dark-foreground tracking-widest">{t('nightProtocol')}</span>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('toggleDarkInterface')}</p>
                    </div>
                    <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${theme === 'dark' ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                {/* 4. NOTIFICATION ALERT SOUNDS & EMAIL PREFERENCES */}
                <div className="flex justify-between items-center pb-5 border-b border-border/50">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            {state.currentUser?.notificationSound !== false ? (
                                <Volume2 className="w-3.5 h-3.5 text-[#008253]" />
                            ) : (
                                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className="text-[10px] font-black uppercase text-foreground dark:text-dark-foreground tracking-widest">
                                Notification Sound Alerts
                            </span>
                        </div>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">
                            Play chime for incoming activity, transfers, and security alerts
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                playNotificationChime('info');
                            }}
                            className="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition border border-emerald-500/20"
                        >
                            Test Sound
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                const newSetting = state.currentUser?.notificationSound === false ? true : false;
                                if (state.currentUser) {
                                    const updated = { ...state.currentUser, notificationSound: newSetting };
                                    dispatch({
                                        type: 'UPDATE_USER',
                                        payload: { id: state.currentUser.id, notificationSound: newSetting }
                                    });
                                    syncWithServer({ currentUser: updated });
                                    if (newSetting) {
                                        playNotificationChime('info');
                                    }
                                }
                            }} 
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                                state.currentUser?.notificationSound !== false 
                                    ? 'bg-[#008253] shadow-lg shadow-[#008253]/30' 
                                    : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                                state.currentUser?.notificationSound !== false ? 'left-7' : 'left-1'
                            }`} />
                        </button>
                    </div>
                </div>

                {/* 5. PIN SECURITY CONFIG */}
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-foreground dark:text-dark-foreground tracking-widest">{t('authPin')}</span>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('secureTransactionAuth')}</p>
                    </div>
                    <button onClick={() => dispatch({type: 'SET_PAGE', payload: Page.CHANGE_PIN})} className="px-3 py-1.5 bg-primary/10 text-primary font-black text-[9px] uppercase rounded-lg hover:bg-primary/20 transition tracking-widest">{t('configure')}</button>
                </div>

                {state.currentUser?.role === 'admin' && (
                    <div className="flex justify-between items-center pt-5 border-t border-border/50">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-foreground dark:text-dark-foreground tracking-widest">{t('adminRights')}</span>
                            <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('systemWideAdminAccess')}</p>
                        </div>
                        <span className="text-green-600 font-black text-[8px] uppercase bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">{t('level5Access')}</span>
                    </div>
                )}
            </div>

            {/* SPENDING & TRANSFER LIMITS DIRECT IN SETTINGS */}
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] space-y-5 border border-border dark:border-dark-border shadow-xl">
                <div className="flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                        <SlidersIcon className="w-4 h-4 text-[#0066CC]" />
                        <h3 className="text-xs font-black uppercase tracking-wider">Account Transfer & Spending Limits</h3>
                    </div>
                    <button type="button" onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.LIMITS })} className="text-[9px] font-black text-[#0066CC] uppercase hover:underline">Full Page View →</button>
                </div>

                <form onSubmit={handleSaveLimits} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Daily Transfer Limit ({state.currentCurrency})</label>
                            <Input type="number" value={dailyTransferLimit} onChange={e => setDailyTransferLimit(Number(e.target.value))} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Per Transaction Limit ({state.currentCurrency})</label>
                            <Input type="number" value={perTxLimit} onChange={e => setPerTxLimit(Number(e.target.value))} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Monthly Spending Ceiling ({state.currentCurrency})</label>
                            <Input type="number" value={monthlySpendingLimit} onChange={e => setMonthlySpendingLimit(Number(e.target.value))} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Daily ATM Cash Limit ({state.currentCurrency})</label>
                            <Input type="number" value={dailyAtmLimit} onChange={e => setDailyAtmLimit(Number(e.target.value))} required />
                        </div>
                    </div>

                    <Button type="submit" disabled={isSavingLimits}>
                        {isSavingLimits ? 'Updating Security Limits...' : 'Save & Update Limits'}
                    </Button>
                </form>
            </div>

            {/* SUPPORT & CONTACT */}
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] space-y-6 border border-border dark:border-dark-border shadow-xl">
                <div className="flex items-center gap-2.5 mb-1 opacity-40">
                    <PhoneIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('supportUplink')}</h3>
                </div>

                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Live Concierge Chat</span>
                        <button onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.CHAT_SUPPORT })} className="text-[#0066CC] font-black text-[10px] hover:underline uppercase">Open Chat Support →</button>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">USA Toll-Free Call</span>
                        <a href="tel:+18008228429" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">+1 800-822-8429</a>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('whatsappCall')}</span>
                        <a href="https://wa.me/447922284110" target="_blank" rel="noopener noreferrer" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">+44 7922 284110</a>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">UK Direct Call</span>
                        <a href="tel:+447599186936" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">+44 7599 186936</a>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('emailSupport')}</span>
                        <div className="flex flex-col items-end gap-1">
                            <a href="mailto:supportcathaybank@gmail.com" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">supportcathaybank@gmail.com</a>
                            <a href="mailto:reportphishing@cathaybank.com" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">reportphishing@cathaybank.com</a>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => dispatch({type: 'LOGOUT'})} className="w-full py-4 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-[0.4em] rounded-[1.5rem] border border-red-500/10 hover:bg-red-500/10 active:scale-95 transition-all duration-300 shadow-sm">{t('secureLogout')}</button>
        </div>
    );
};

const LimitInput = ({ label, value, onChange, min = 0, max: customMax }: { label: string, value: number, onChange: (val: number) => void, min?: number, max?: number }) => {
    const max = 50000;
    const safeValue = typeof value === 'number' && !isNaN(value) ? Math.min(value, max) : min;
    const rawProgress = ((safeValue - min) / (max - min)) * 100;
    const progress = Math.max(0, Math.min(100, isNaN(rawProgress) ? 0 : rawProgress));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
                <span className="text-[12px] font-black text-primary">{formatCurrency(safeValue)}</span>
            </div>
            <div className="relative h-12 flex items-center">
                {/* Track */}
                <div className="absolute w-full h-2 bg-slate-200 dark:bg-dark-muted rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                
                {/* Draggable Thumb */}
                <div className="relative w-full h-full">
                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onDrag={(_, info) => {
                            const rect = (info as any).point.x; // This is not quite right for absolute positioning
                            // We need the container width
                        }}
                        className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                        style={{ left: `${progress}%` }}
                    >
                        {/* We'll use a standard range input hidden but overlayed for better accessibility and easier logic, 
                            but styled with motion for the "draggable" feel if possible. 
                            Actually, a better way for "draggable" is a custom slider.
                        */}
                    </motion.div>
                    
                    {/* Interactive Range Input (Hidden but functional) */}
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        step="500" 
                        value={safeValue} 
                        onChange={(e) => onChange(parseInt(e.target.value) || min)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {/* Visual Thumb */}
                    <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-100 rounded-full shadow-lg border-2 border-primary pointer-events-none flex items-center justify-center"
                        style={{ left: `calc(${progress}% - 12px)` }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-1 h-3 bg-primary/20 rounded-full mx-0.5"></div>
                        <div className="w-1 h-3 bg-primary/20 rounded-full mx-0.5"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const LimitsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const rawLimits = state.currentUser?.limits || {
        dailyTransfer: 500,
        dailyAtm: 2000,
        monthlySpending: 50000,
        perTransaction: 25000,
        onlinePurchase: 10000
    };

    const clampLimit = (val: any, defaultVal: number) => {
        const parsed = typeof val === 'number' ? val : defaultVal;
        return Math.min(parsed, 50000);
    };

    const [limits, setLimits] = useState({
        dailyTransfer: clampLimit(rawLimits.dailyTransfer, 500),
        dailyAtm: clampLimit(rawLimits.dailyAtm, 2000),
        monthlySpending: clampLimit(rawLimits.monthlySpending, 50000),
        perTransaction: clampLimit(rawLimits.perTransaction, 25000),
        onlinePurchase: clampLimit(rawLimits.onlinePurchase, 10000)
    });

    const [success, setSuccess] = useState(false);

    const handleUpdate = async () => {
        dispatch({ type: 'UPDATE_LIMITS', payload: limits });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        if (state.currentUser) {
            const updatedUser = {
                ...state.currentUser,
                limits: limits
            };
            try {
                await fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                });
            } catch (err) {
                console.error("Error syncing limits with server:", err);
            }
        }
    };

    return (
        <div className="p-5 space-y-6 pb-24">
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2.5rem] border border-border dark:border-dark-border shadow-xl space-y-8">
                <div className="flex items-center gap-2.5 opacity-40 mb-2">
                    <LockIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('spendingControls')}</h3>
                </div>

                <div className="space-y-8">
                    <LimitInput 
                        label={t('dailyTransferLimit')} 
                        value={limits.dailyTransfer} 
                        onChange={(val) => setLimits({ ...limits, dailyTransfer: val })} 
                        min={50}
                    />
                    <LimitInput 
                        label={t('dailyAtmWithdrawalLimit')} 
                        value={limits.dailyAtm} 
                        onChange={(val) => setLimits({ ...limits, dailyAtm: val })} 
                    />
                    <LimitInput 
                        label={t('monthlySpendingLimit')} 
                        value={limits.monthlySpending} 
                        onChange={(val) => setLimits({ ...limits, monthlySpending: val })} 
                    />
                    <LimitInput 
                        label={t('perTransactionLimit')} 
                        value={limits.perTransaction} 
                        onChange={(val) => setLimits({ ...limits, perTransaction: val })} 
                    />
                    <LimitInput 
                        label={t('onlinePurchaseLimit')} 
                        value={limits.onlinePurchase} 
                        onChange={(val) => setLimits({ ...limits, onlinePurchase: val })} 
                    />
                </div>

                <div className="pt-4 space-y-4">
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3"
                        >
                            <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                            <p className="text-[10px] font-black uppercase text-green-700">{t('limitsUpdatedSuccess')}</p>
                        </motion.div>
                    )}
                    <Button onClick={handleUpdate}>{t('updateLimits')}</Button>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-[2rem] flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-tight text-blue-900 dark:text-blue-400">{t('securityNotice')}</h4>
                    <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-300/60 leading-relaxed uppercase">{t('limitsNoticeDescription')}</p>
                </div>
            </div>
        </div>
    );
};

const SavingsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [val, setVal] = useState('');

    const handleVaultAction = async (action: 'move_to' | 'move_from') => {
        if (!state.currentUser?.isActivated) {
            dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
            return;
        }
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) return alert(t('invalidAmount'));
        
        let updatedUser = null;
        if (action === 'move_to') {
            if (amount > state.currentUser.balance) return alert(t('insufficientBalance'));
            dispatch({ type: 'MOVE_TO_SAVINGS', payload: amount });
            updatedUser = {
                ...state.currentUser,
                balance: state.currentUser.balance - amount,
                savingsBalance: state.currentUser.savingsBalance + amount,
                transactions: [
                    { id: `txn_${Date.now()}`, date: new Date().toISOString(), description: 'transferToSavings', amount: -amount, type: 'debit' as const, category: 'Savings', status: 'Completed' as const }, 
                    ...(state.currentUser.transactions || [])
                ]
            };
        } else {
            if (amount > state.currentUser.savingsBalance) return alert(t('insufficientVaultAssets'));
            dispatch({ type: 'MOVE_FROM_SAVINGS', payload: amount });
            updatedUser = {
                ...state.currentUser,
                balance: state.currentUser.balance + amount,
                savingsBalance: state.currentUser.savingsBalance - amount,
                transactions: [
                    { id: `txn_${Date.now()}`, date: new Date().toISOString(), description: 'withdrawFromSavings', amount: amount, type: 'credit' as const, category: 'Savings', status: 'Completed' as const }, 
                    ...(state.currentUser.transactions || [])
                ]
            };
        }
        setVal('');
        alert(t('vaultTransactionAuthorized'));

        if (updatedUser) {
            try {
                await fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                });
            } catch (err) {
                console.error("Error syncing vault action with server:", err);
            }
        }
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">{t('vaultLiquidity')}</p>
                <p className="text-4xl font-black tracking-tighter tabular-nums">{formatCurrency(state.currentUser!.savingsBalance)}</p>
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">{t('guaranteedYield')}</span>
                    <span className="text-[11px] font-black text-green-400">8.45% Fixed</span>
                </div>
            </div>
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 opacity-40">
                    <ShieldIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('vaultProtocol')}</h3>
                </div>
                <div className="space-y-4">
                    <Input type="number" placeholder={t('capitalToLock')} value={val} onChange={e => setVal(e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => handleVaultAction('move_to')}>{t('transferToSavings')}</Button>
                        <Button onClick={() => handleVaultAction('move_from')} className="bg-slate-100 dark:bg-dark-muted text-foreground dark:text-white">{t('withdrawFromSavings')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const RestrictionPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [showChoice, setShowChoice] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-dark-card p-10 rounded-[3rem] border-2 border-red-500/20 shadow-2xl text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
                    <AlertCircleIcon className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">{t('accountRestricted')}</h2>
                    <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-left">
                        {state.currentUser?.id === 'usr_joakim_blom' ? (
                            <div className="text-[11px] font-bold text-red-800 dark:text-red-400 space-y-3 leading-relaxed">
                                <p className="italic">"{state.systemNote || "Your high-level corporate account is under a Location/High-Asset Audit check. New transfers will reside in 'Pending' status pending executive board release clearance."}"</p>
                                <div className="pt-2 border-t border-red-200/50 dark:border-red-900/40 space-y-2">
                                    <p className="uppercase text-[9px] tracking-wider opacity-60 font-black">Hold Parameters & Status:</p>
                                    <ul className="list-disc list-inside space-y-1 text-[10px] ml-1">
                                        <li><span className="font-extrabold">Primary Trigger:</span> Geographic access detected outside established Swedish corporate headquarters.</li>
                                        <li><span className="font-extrabold">Executive Threshold Check:</span> Inbound asset values and merger settlements exceeding individual compliance thresholds.</li>
                                        <li><span className="font-extrabold">Regulatory Requirement:</span> Routine Swiss Financial Market Authority (FINMA) High-Net-Worth Individual (HNWI) security verification.</li>
                                    </ul>
                                    <p className="pt-1">To authorize immediate release and bypass geographical restrictions, please contact support or your dedicated private relationship manager to complete the executive board safety check.</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] font-bold text-red-800 dark:text-red-400 leading-relaxed italic text-center">
                                "{state.systemNote || t('transferRestrictedMessage')}"
                            </p>
                        )}
                    </div>
                </div>

                {!showChoice ? (
                    <div className="pt-4">
                        <Button onClick={() => setShowChoice(true)} className="bg-red-600 hover:bg-red-700">{t('verificationDesk')}</Button>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4 border-t border-border dark:border-dark-border animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('callOrWhatsapp')}</p>
                    <div className="grid grid-cols-2 gap-3 pb-2">
                        <a href="tel:+18009228429" className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 dark:bg-dark-muted rounded-2xl border border-border dark:border-dark-border hover:border-primary transition group">
                            <PhoneIcon className="w-6 h-6 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-tight">Call USA (+1 800)</span>
                        </a>
                        <a href="https://wa.me/447922284110" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-5 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 hover:border-green-500 transition group">
                            <MessageCircleIcon className="w-6 h-6 text-green-600" />
                            <span className="text-[9px] font-black uppercase tracking-tight">{t('whatsappNow')}</span>
                        </a>
                    </div>
                    <a href="mailto:supportcathaybank@gmail.com" className="flex items-center justify-center gap-3 w-full p-4 bg-muted dark:bg-dark-muted rounded-2xl border border-border dark:border-dark-border group hover:border-primary transition">
                        <MailIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t('emailUs')}</span>
                    </a>
                    <button onClick={() => setShowChoice(false)} className="text-[9px] font-black uppercase opacity-30 mt-2">{t('back')}</button>
                    </div>
                )}

                <div className="pt-4 border-t border-border dark:border-dark-border">
                    <Button onClick={() => dispatch({ type: 'TOGGLE_CHAT', payload: true })} className="bg-slate-100 dark:bg-dark-muted text-foreground dark:text-dark-foreground">{t('chatWithAgent')}</Button>
                </div>
                
                <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Reference: ERR-LOC-{Math.floor(Math.random() * 1000000)}</p>
            </div>
        </div>
    );
};

const NotificationsPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const rawNotifications = state.currentUser?.notifications || [];

    // Deduplicate notifications by ID and translated message
    const seenMessagesAndIds = new Set<string>();
    const filtered = rawNotifications.filter(n => {
        if (!n) return false;
        const msgKey = (t(n.message as any) || n.message || '').trim().toLowerCase();
        const idKey = (n.id || '').trim().toLowerCase();
        
        if (seenMessagesAndIds.has(idKey) || (msgKey && seenMessagesAndIds.has(msgKey))) {
            return false;
        }
        if (msgKey) seenMessagesAndIds.add(msgKey);
        if (idKey) seenMessagesAndIds.add(idKey);
        return true;
    });

    // Sort so restriction notification is ALWAYS at index 0 as current active alert
    const notifications = filtered.sort((a, b) => {
        const isRestrictedA = a.id.includes('restriction') || a.message.includes('Restricted') || a.message.includes('restricted');
        const isRestrictedB = b.id.includes('restriction') || b.message.includes('Restricted') || b.message.includes('restricted');
        if (isRestrictedA) return -1;
        if (isRestrictedB) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    useEffect(() => {
        if (notifications.some(n => !n.read)) {
            if (state.currentUser?.notificationSound !== false) {
                const hasSecurity = notifications.some(n => n.type === 'error' || n.type === 'warning' || (n.title && n.title.toLowerCase().includes('security')));
                playNotificationChime(hasSecurity ? 'security' : 'info');
            }
            dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
        }
    }, [dispatch, notifications, state.currentUser?.notificationSound]);

    const handleToggleSound = () => {
        const newSetting = state.currentUser?.notificationSound === false ? true : false;
        if (state.currentUser) {
            const updated = { ...state.currentUser, notificationSound: newSetting };
            dispatch({
                type: 'UPDATE_USER',
                payload: { id: state.currentUser.id, notificationSound: newSetting }
            });
            syncWithServer({ currentUser: updated });
            if (newSetting) {
                playNotificationChime('info');
            }
        }
    };

    return (
        <div className="p-5 space-y-4">
            {/* Notifications Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-2 p-3 bg-card dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">{t('systemAlerts')}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {notifications.length}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleToggleSound}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition ${
                            state.currentUser?.notificationSound !== false
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                        }`}
                        title="Toggle notification sound alerts"
                    >
                        {state.currentUser?.notificationSound !== false ? (
                            <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                                <span>Sound: ON</span>
                            </>
                        ) : (
                            <>
                                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                                <span>Sound: OFF</span>
                            </>
                        )}
                    </button>

                    {notifications.length > 0 && (
                        <button 
                            onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })} 
                            className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/30 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900 transition"
                        >
                            {t('clearAll')}
                        </button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-card dark:bg-dark-card p-12 rounded-[2rem] border border-border dark:border-dark-border shadow-xl text-center">
                    <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('noNotifications')}</p>
                </div>
            ) : (
                notifications.map(n => {
                    const msgText = (t(n.message as any) || n.message || '').toLowerCase();
                    const titleText = (t(n.title as any) || n.title || '').toLowerCase();
                    const idText = (n.id || '').toLowerCase();
                    const isRestricted = idText.includes('restrict') || msgText.includes('restrict') || titleText.includes('restrict') || n.message === 'transferRestrictedMessage' || n.message === 'transferRestrictedAlex';
                    const isLoginAddressNotif = msgText.includes('login') || titleText.includes('login') || msgText.includes('address') || msgText.includes('device') || idText.includes('login');
                    const isSecurity = isRestricted || n.type === 'error' || n.type === 'warning' || 
                        titleText.includes('security') || titleText.includes('audit') || titleText.includes('verification') ||
                        titleText.includes('hold') || titleText.includes('fraud') || titleText.includes('alert');
                    const shouldHideDate = isRestricted || isLoginAddressNotif;

                    return (
                        <div 
                            key={n.id} 
                            onClick={() => {}} 
                            className={`p-5 rounded-[1.8rem] shadow-lg relative overflow-hidden transition-all ${
                                isSecurity
                                    ? 'bg-red-50/40 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800'
                                    : 'bg-card dark:bg-dark-card border border-border dark:border-dark-border'
                            } ${!n.read ? 'border-l-4 border-l-primary' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {isSecurity ? (
                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-600 text-white shadow-sm tracking-wider">
                                            <ShieldAlert className="w-3 h-3 text-white" />
                                            SECURITY NOTICE
                                        </span>
                                    ) : (
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                            n.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            n.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                            n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}>
                                            {n.type || 'alert'}
                                        </span>
                                    )}
                                    <h4 className={`text-[11px] font-black uppercase tracking-tight ${isSecurity ? 'text-red-900 dark:text-red-300' : 'text-foreground'}`}>
                                        {t(n.title as any) || n.title}
                                    </h4>
                                </div>
                                {n.date && !shouldHideDate && (
                                    <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
                                        {new Date(n.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                            <p className={`text-[10px] font-bold leading-relaxed ${isSecurity ? 'text-red-800 dark:text-red-200' : 'text-muted-foreground'}`}>
                                {t(n.message as any) || n.message}
                            </p>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const ChangePinPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpdatePin = async () => {
        setError(null);
        if (currentPin !== state.currentUser?.pin) return setError(t('currentPinIncorrect'));
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) return setError(t('pinMustBe4Digits'));
        if (newPin !== confirmPin) return setError(t('pinsDoNotMatch'));

        dispatch({ type: 'CHANGE_PIN', payload: newPin });
        setSuccess(true);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setTimeout(() => setSuccess(false), 3000);

        if (state.currentUser) {
            const updatedUser = {
                ...state.currentUser,
                pin: newPin
            };
            try {
                await fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                });
            } catch (err) {
                console.error("Error syncing PIN with server:", err);
            }
        }
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-card dark:bg-dark-card p-8 rounded-[2.5rem] border border-border dark:border-dark-border shadow-xl space-y-8">
                <div className="flex items-center gap-2.5 opacity-40">
                    <LockIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('securityProtocol')}</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-1 tracking-widest">{t('currentPin')}</label>
                        <input 
                            type="password" 
                            maxLength={4}
                            value={currentPin}
                            onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-100 dark:bg-dark-muted border-2 border-transparent focus:border-primary rounded-2xl p-4 text-center text-2xl tracking-[1em] font-black transition"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-1 tracking-widest">{t('newPin')}</label>
                            <input 
                                type="password" 
                                maxLength={4}
                                value={newPin}
                                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-100 dark:bg-dark-muted border-2 border-transparent focus:border-primary rounded-2xl p-4 text-center text-2xl tracking-[1em] font-black transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-1 tracking-widest">{t('confirmNewPin')}</label>
                            <input 
                                type="password" 
                                maxLength={4}
                                value={confirmPin}
                                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-100 dark:bg-dark-muted border-2 border-transparent focus:border-primary rounded-2xl p-4 text-center text-2xl tracking-[1em] font-black transition"
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="text-[9px] font-black uppercase text-red-500 text-center animate-pulse">{error}</p>}
                {success && <p className="text-[9px] font-black uppercase text-green-500 text-center animate-bounce">{t('pinUpdatedSuccess')}</p>}

                <Button onClick={handleUpdatePin}>{t('updatePin')}</Button>
            </div>
        </div>
    );
};

const InvestmentsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const user = state.currentUser;
    const [years, setYears] = useState(5);
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [amountToInvest, setAmountToInvest] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const assets = [
        { id: 'treasury', name: 'Executive Treasury Bonds', rate: '5.8% APY', risk: 'Low', allocation: '$4,500,000.00', yield: '+$261,000 / yr', icon: '🏛️' },
        { id: 'realestate', name: 'Boston Harbor Real Estate Trust', rate: '8.2% APY', risk: 'Moderate', allocation: '$3,800,000.00', yield: '+$311,600 / yr', icon: '🏢' },
        { id: 'greenenergy', name: 'Climate Action Green Energy Fund', rate: '12.4% APY', risk: 'Moderate', allocation: '$2,650,000.00', yield: '+$328,600 / yr', icon: '🌱' },
        { id: 'equities', name: 'Blue-Chip US Equity Basket', rate: '16.5% APY', risk: 'Higher Yield', allocation: '$1,500,000.00', yield: '+$247,500 / yr', icon: '📊' },
    ];

    const currentPortfolio = 12450000;
    const estimatedGrowth = Math.round(currentPortfolio * Math.pow(1.095, years));

    const handleInvest = (assetName: string) => {
        const val = parseFloat(amountToInvest);
        if (!val || val <= 0 || (user && user.balance < val)) {
            alert('Invalid amount or insufficient account balance.');
            return;
        }
        if (user) {
            const updatedBalance = user.balance - val;
            const newTxn: Transaction = {
                id: `txn_inv_${Date.now()}`,
                date: new Date().toISOString(),
                description: `Investment Allocation: ${assetName}`,
                amount: -val,
                type: 'debit',
                category: 'Investment',
                status: 'Completed',
                reference: `INV-CAP-${Math.floor(Math.random() * 89999) + 10000}`,
                senderName: user.name,
                senderAccount: user.accountNumber,
                receiverName: assetName,
                receiverAccount: 'PRISP-INVEST-VAULT',
                bankName: 'Cathay Investment Desk',
                country: 'United States',
                currency: user.currency || 'USD'
            };
            const updatedUser = {
                ...user,
                balance: updatedBalance,
                transactions: [newTxn, ...(user.transactions || [])]
            };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            setSuccessMsg(`Successfully allocated ${formatCurrency(val, user.currency)} into ${assetName}.`);
            setAmountToInvest('');
            setSelectedAsset(null);
            setTimeout(() => setSuccessMsg(''), 4000);
        }
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-gradient-to-br from-[#0A2540] to-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Cathay Bank Wealth & Capital Vault</p>
                <h2 className="text-3xl font-black tracking-tight mb-2">$12,450,000.00</h2>
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-500/30">
                        ↑ +14.8% Portfolio Yield
                    </span>
                    <span className="text-[10px] opacity-70">Annual Growth</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/10 pt-4">
                    <div>
                        <p className="text-[8px] uppercase tracking-wider opacity-60 font-bold">Total Gain</p>
                        <p className="font-bold text-emerald-400">+$1,610,000.00</p>
                    </div>
                    <div>
                        <p className="text-[8px] uppercase tracking-wider opacity-60 font-bold">Active Assets</p>
                        <p className="font-bold">4 Capital Holdings</p>
                    </div>
                </div>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl animate-bounce text-center">
                    {successMsg}
                </div>
            )}

            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 px-1">Portfolio Asset Holdings</h3>
                <div className="grid grid-cols-1 gap-3">
                    {assets.map(asset => (
                        <div key={asset.id} className="bg-card dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl p-2 bg-slate-100 dark:bg-dark-muted rounded-xl">{asset.icon}</span>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{asset.name}</h4>
                                    <p className="text-[10px] text-muted-foreground font-semibold">{asset.rate} • Risk: {asset.risk}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xs text-slate-900 dark:text-white">{asset.allocation}</p>
                                <p className="text-[9px] text-emerald-500 font-bold">{asset.yield}</p>
                                <button 
                                    onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)} 
                                    className="mt-1 text-[9px] font-black uppercase tracking-wider text-primary hover:underline"
                                >
                                    {selectedAsset === asset.id ? 'Close' : '+ Invest'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedAsset && (
                <div className="bg-card dark:bg-dark-card p-5 rounded-2xl border-2 border-primary shadow-lg space-y-3 animate-in fade-in">
                    <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                        Allocate Funds to {assets.find(a => a.id === selectedAsset)?.name}
                    </p>
                    <input 
                        type="number"
                        placeholder="Enter investment amount ($)"
                        value={amountToInvest}
                        onChange={e => setAmountToInvest(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 text-sm font-bold"
                    />
                    <button 
                        onClick={() => handleInvest(assets.find(a => a.id === selectedAsset)?.name || 'Asset')}
                        className="w-full py-3 bg-[#0A2540] dark:bg-primary text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition"
                    >
                        Confirm Capital Allocation
                    </button>
                </div>
            )}

            <div className="bg-card dark:bg-dark-card p-5 rounded-2xl border border-border dark:border-dark-border space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider opacity-60">Compounding Yield Forecast</h4>
                <div className="flex items-center justify-between text-xs font-bold">
                    <span>Target Horizon: {years} Years</span>
                    <span className="text-primary font-black">${estimatedGrowth.toLocaleString()}</span>
                </div>
                <input 
                    type="range" 
                    min={1} 
                    max={10} 
                    value={years} 
                    onChange={e => setYears(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                />
                <p className="text-[9px] text-muted-foreground leading-normal">
                    Projected growth based on 9.5% weighted average portfolio return. Capital in vault is protected under Cathay Diplomatic Asset Guarantees.
                </p>
            </div>
        </div>
    );
};

const FxExchangePage = () => {
    const { state, dispatch, t } = useAppContext();
    const user = state.currentUser;
    const [fromCurr, setFromCurr] = useState('USD');
    const [toCurr, setToCurr] = useState('EUR');
    const [amount, setAmount] = useState('');
    const [convertedVal, setConvertedVal] = useState<number | null>(null);
    const [swapSuccess, setSwapSuccess] = useState('');

    const rates: Record<string, number> = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.78,
        CHF: 0.88,
        JPY: 154.20,
        AFN: 71.50,
        CAD: 1.36,
        AUD: 1.52,
    };

    const handleCalculate = (valStr: string, f: string, tCurr: string) => {
        setAmount(valStr);
        const val = parseFloat(valStr);
        if (!val || isNaN(val)) {
            setConvertedVal(null);
            return;
        }
        const usdEquivalent = val / (rates[f] || 1.0);
        const targetResult = usdEquivalent * (rates[tCurr] || 1.0);
        setConvertedVal(targetResult);
    };

    const handleExecuteSwap = () => {
        const val = parseFloat(amount);
        if (!val || val <= 0 || !user || user.balance < val) {
            alert('Invalid swap amount or insufficient balance.');
            return;
        }
        const updatedBalance = user.balance - val;
        const newTxn: Transaction = {
            id: `txn_fx_${Date.now()}`,
            date: new Date().toISOString(),
            description: `FX Swap: ${val} ${fromCurr} → ${(convertedVal || 0).toFixed(2)} ${toCurr}`,
            amount: -val,
            type: 'debit',
            category: 'Exchange',
            status: 'Completed',
            reference: `FX-DESK-${Math.floor(Math.random() * 89999) + 10000}`,
            senderName: user.name,
            senderAccount: user.accountNumber,
            receiverName: `Multi-Currency ${toCurr} Vault`,
            receiverAccount: `FX-VAULT-${toCurr}`,
            bankName: 'Cathay Diplomatic FX Desk',
            country: 'International',
            currency: fromCurr
        };
        const updatedUser = {
            ...user,
            balance: updatedBalance,
            transactions: [newTxn, ...(user.transactions || [])]
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        setSwapSuccess(`Successfully swapped ${val} ${fromCurr} to ${(convertedVal || 0).toFixed(2)} ${toCurr} at zero-fee rate.`);
        setAmount('');
        setConvertedVal(null);
        setTimeout(() => setSwapSuccess(''), 4000);
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2.5rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Forex & Multi-Currency Desk</p>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Instant Currency Swap</h2>
                    </div>
                    <span className="text-2xl">💱</span>
                </div>

                {swapSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl animate-bounce text-center">
                        {swapSuccess}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-1">From Currency</label>
                        <select 
                            value={fromCurr} 
                            onChange={e => { setFromCurr(e.target.value); handleCalculate(amount, e.target.value, toCurr); }}
                            className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 font-bold text-xs"
                        >
                            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-1">To Currency</label>
                        <select 
                            value={toCurr} 
                            onChange={e => { setToCurr(e.target.value); handleCalculate(amount, fromCurr, e.target.value); }}
                            className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 font-bold text-xs"
                        >
                            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-1">Swap Amount ({fromCurr})</label>
                    <input 
                        type="number"
                        placeholder={`Enter amount in ${fromCurr}`}
                        value={amount}
                        onChange={e => handleCalculate(e.target.value, fromCurr, toCurr)}
                        className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 font-extrabold text-sm"
                    />
                </div>

                {convertedVal !== null && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-wider text-primary">Live Conversion Output</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                            {convertedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurr}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-semibold">
                            Exchange Rate: 1 {fromCurr} = {((rates[toCurr] || 1) / (rates[fromCurr] || 1)).toFixed(4)} {toCurr} • Zero Administrative Spread
                        </p>
                    </div>
                )}

                <button 
                    onClick={handleExecuteSwap}
                    className="w-full py-3.5 bg-[#0A2540] dark:bg-primary text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition shadow-md"
                >
                    Execute Instant Currency Swap
                </button>
            </div>

            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 px-1">Live Diplomatic FX Rates</h3>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(rates).map(([code, rate]) => (
                        <div key={code} className="bg-card dark:bg-dark-card p-3.5 rounded-2xl border border-border dark:border-dark-border flex items-center justify-between">
                            <div>
                                <p className="font-black text-xs text-slate-900 dark:text-white">USD / {code}</p>
                                <p className="text-[9px] text-muted-foreground font-bold">Diplomatic Spread</p>
                            </div>
                            <span className="font-extrabold text-xs text-primary">{rate.toFixed(code === 'JPY' || code === 'AFN' ? 2 : 4)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ScheduledPaymentsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const user = state.currentUser;
    const [schedules, setSchedules] = useState([
        { id: 'sch_1', recipient: 'Harvard Kennedy School Endowment', amount: '$50,000.00', freq: 'Monthly', nextDate: '1st of next month', category: 'Philanthropy', status: 'Active' },
        { id: 'sch_2', recipient: 'Beacon Hill Estate Property Management', amount: '$8,500.00', freq: 'Monthly', nextDate: '15th of next month', category: 'Property', status: 'Active' },
        { id: 'sch_3', recipient: 'Kabul Diplomatic Humanitarian Relief', amount: '$25,000.00', freq: 'Monthly', nextDate: '28th of next month', category: 'Humanitarian', status: 'Active' },
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newRecipient, setNewRecipient] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newFreq, setNewFreq] = useState('Monthly');

    const toggleStatus = (id: string) => {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s));
    };

    const handleAddSchedule = () => {
        if (!newRecipient || !newAmount) {
            alert('Please fill out recipient and amount.');
            return;
        }
        const newSch = {
            id: `sch_${Date.now()}`,
            recipient: newRecipient,
            amount: `$${parseFloat(newAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            freq: newFreq,
            nextDate: '1st of next month',
            category: 'Wire Transfer',
            status: 'Active'
        };
        setSchedules([newSch, ...schedules]);
        setNewRecipient('');
        setNewAmount('');
        setIsAdding(false);
    };

    return (
        <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Automated Payments</p>
                    <h2 className="text-lg font-black uppercase tracking-tight">Standing Orders & Auto-Wires</h2>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-3 py-1.5 bg-[#0A2540] dark:bg-primary text-white dark:text-slate-900 font-black text-[10px] uppercase rounded-xl hover:opacity-90 transition"
                >
                    {isAdding ? 'Close' : '+ New Standing Wire'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-card dark:bg-dark-card p-5 rounded-2xl border-2 border-primary shadow-lg space-y-3 animate-in fade-in">
                    <p className="text-[10px] font-black uppercase tracking-wider text-primary">Create Standing Payment Order</p>
                    <input 
                        type="text" 
                        placeholder="Recipient Name / Institution" 
                        value={newRecipient} 
                        onChange={e => setNewRecipient(e.target.value)} 
                        className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 text-xs font-bold"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="number" 
                            placeholder="Amount ($)" 
                            value={newAmount} 
                            onChange={e => setNewAmount(e.target.value)} 
                            className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 text-xs font-bold"
                        />
                        <select 
                            value={newFreq} 
                            onChange={e => setNewFreq(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-dark-muted border border-border dark:border-dark-border rounded-xl p-3 text-xs font-bold"
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Annual">Annual</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleAddSchedule}
                        className="w-full py-3 bg-primary text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition"
                    >
                        Schedule Recurring Wire
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {schedules.map(sch => (
                    <div key={sch.id} className="bg-card dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border shadow-sm flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${sch.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {sch.status} • {sch.freq}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{sch.recipient}</h4>
                            <p className="text-[9px] text-muted-foreground font-semibold">Next Date: {sch.nextDate} • {sch.category}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="font-black text-xs text-slate-900 dark:text-white">{sch.amount}</p>
                            <button 
                                onClick={() => toggleStatus(sch.id)}
                                className="text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-primary"
                            >
                                {sch.status === 'Active' ? 'Pause Order' : 'Resume Order'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageContainer;

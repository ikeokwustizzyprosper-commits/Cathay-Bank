
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Message, Page } from '../types';
import { useAppContext } from '../App';
import { RefreshCwIcon, ArrowLeftIcon, PaperclipIcon, LandmarkIcon, ProcessingLoaderIcon, AlertCircleIcon, ImageIcon, SendIcon, formatCurrency, convertFromGbp } from '../constants';

const Chatbot: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    const userMessages = useMemo(() => {
        if (!state.currentUser) return [];
        return state.messages.filter(m => 
            (m.senderRole === 'customer' && m.senderId === state.currentUser.id) || 
            (m.senderRole === 'admin' && m.receiverId === state.currentUser.id)
        );
    }, [state.messages, state.currentUser]);

    useEffect(() => {
        if (isOpen && !isConnected) {
            const timer = setTimeout(() => setIsConnected(true), 1200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isConnected]);

    useEffect(scrollToBottom, [userMessages, isTyping, isConnected]);
    
    useEffect(() => {
        if (isOpen && isConnected && userMessages.length === 0) {
            const welcomeMsg: Message = { 
                id: 'welcome',
                senderId: 'admin_sys',
                receiverId: state.currentUser?.id,
                senderName: t('customerSupport'),
                senderRole: 'admin',
                text: t('welcomeMessage'), 
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            };
            dispatch({ type: 'SEND_MESSAGE', payload: welcomeMsg });

            if (state.systemNote) {
                const restrictionMsg: Message = {
                    id: 'restriction_alert',
                    senderId: 'admin_sys',
                    receiverId: state.currentUser?.id,
                    senderName: t('customerSupport'),
                    senderRole: 'admin',
                    text: state.systemNote,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                };
                setTimeout(() => {
                    dispatch({ type: 'SEND_MESSAGE', payload: restrictionMsg });
                }, 1000);
            }
        }
    }, [isOpen, isConnected, userMessages.length, dispatch, state.currentUser?.id, state.systemNote]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        setInputValue('');
        await processNewMessage(text);
    };

    const processNewMessage = async (text: string, imageUrl?: string) => {
        const userMsg: Message = { 
            id: `msg_${Date.now()}`,
            senderId: state.currentUser!.id,
            receiverId: 'admin',
            senderName: state.currentUser!.name,
            senderRole: 'customer',
            text: text, 
            imageUrl: imageUrl,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        };
        
        dispatch({ type: 'SEND_MESSAGE', payload: userMsg });
        syncWithServer();
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text || "An attachment was provided.",
                    imageUrl: imageUrl || null,
                    customerName: state.currentUser?.name,
                    isActivated: state.currentUser?.isActivated
                })
            });

            let aiText = "Your message has been received by Cathay Bank Priority Support. dear cathay bank customer you have to wait for the agents response";
            if (res.ok) {
                const data = await res.json();
                if (data && data.reply) {
                    aiText = data.reply;
                }
            }
            
            const autoReply: Message = {
                id: `auto_${Date.now()}`,
                senderId: 'admin_sys',
                receiverId: state.currentUser?.id,
                senderName: t('supportTriage'),
                senderRole: 'admin',
                text: aiText,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            dispatch({ type: 'SEND_MESSAGE', payload: autoReply });
            syncWithServer();
        } catch (error) {
            const fallback: Message = {
                id: `auto_f_${Date.now()}`,
                senderId: 'admin_sys',
                receiverId: state.currentUser?.id,
                senderName: t('supportTriage'),
                senderRole: 'admin',
                text: "Signal received by admin desk. dear cathay bank customer you have to wait for the agents response",
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            dispatch({ type: 'SEND_MESSAGE', payload: fallback });
            syncWithServer();
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                processNewMessage("Attached Image", base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => {}} 
            className="w-screen h-screen max-w-none m-0 rounded-none flex flex-col z-[60] bg-white dark:bg-dark-background shadow-none"
        >
            <div className="flex flex-col h-full overflow-hidden">
                <header className="flex items-center justify-between px-6 py-5 bg-primary text-white shadow-lg shrink-0">
                    <button 
                        onClick={() => setShowExitConfirm(true)} 
                        className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">{t('customerSupport')}</h2>
                        </div>
                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">{t('bankSecuredLine')}</p>
                    </div>
                    <button 
                        onClick={() => setShowDetails(!showDetails)} 
                        className={`px-4 py-2.5 text-[9px] font-black uppercase rounded-2xl transition duration-300 ${
                            showDetails 
                            ? 'bg-white text-primary shadow-md' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {showDetails ? 'Hide Details' : 'View Account'}
                    </button>
                </header>

                {!isConnected ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white">
                        <ProcessingLoaderIcon className="w-12 h-12 text-primary animate-spin mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">{t('establishingTunnel')}</p>
                        <p className="text-[8px] font-bold uppercase opacity-30 mt-2 tracking-widest">{t('encryptionNotice')}</p>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Chat messages & input */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f8fafc] dark:bg-dark-background scroll-smooth">
                                <div className="text-center py-4">
                                    <span className="bg-slate-200/50 dark:bg-dark-muted px-5 py-2 rounded-full text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] border border-slate-300/30">
                                        {t('sessionEstablished')} — {new Date().toLocaleDateString()}
                                    </span>
                                </div>

                                {userMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                        <div className={`max-w-[85%] space-y-2 ${msg.senderRole === 'customer' ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-4 shadow-sm text-[13px] font-bold leading-relaxed rounded-[1.5rem] ${
                                                msg.senderRole === 'customer' 
                                                ? 'bg-primary text-white rounded-tr-none' 
                                                : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-dark-border shadow-md'
                                            }`}>
                                                {msg.imageUrl && (
                                                    <img 
                                                        src={msg.imageUrl} 
                                                        alt="Attachment" 
                                                        className="max-w-full rounded-xl mb-3 border border-white/20 shadow-inner" 
                                                    />
                                                )}
                                                {msg.text && <p>{
                                                    msg.text.split(/(supportcathaybank@gmail\.com|prisparimobank@gmail\.com|\+44\s?7599\s?186936|\+44\s?7922\s?286845|\+44\s?7922\s?284110)/g).map((part, i) => {
                                                        if (part === 'supportcathaybank@gmail.com' || part === 'prisparimobank@gmail.com') {
                                                            return <a key={i} href="mailto:supportcathaybank@gmail.com" className="text-blue-500 dark:text-blue-400 underline font-black">{part}</a>;
                                                        }
                                                        if (part.replace(/\s/g, '') === '+447599186936') {
                                                            return <a key={i} href="tel:+447599186936" className="text-blue-500 dark:text-blue-400 underline font-black">{part}</a>;
                                                        }
                                                        if (part.replace(/\s/g, '') === '+447922286845') {
                                                            return <a key={i} href="https://wa.me/447922284110" className="text-blue-500 dark:text-blue-400 underline font-black">{part}</a>;
                                                        }
                                                        if (part.replace(/\s/g, '') === '+447922284110') {
                                                            return <a key={i} href="https://wa.me/447922284110" className="text-blue-500 dark:text-blue-400 underline font-black">{part}</a>;
                                                        }
                                                        return <span key={i}>{part}</span>;
                                                    })
                                                }</p>}
                                            </div>
                                            <p className="text-[8px] font-black uppercase opacity-30 px-3 tracking-tighter">
                                                {msg.senderName} • {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-dark-card p-5 rounded-[1.8rem] rounded-tl-none border border-gray-100 dark:border-dark-border shadow-md">
                                            <div className="flex gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            <div className="p-6 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.05)] shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleImageClick}
                                            className="p-4 bg-slate-100 dark:bg-dark-muted rounded-2xl text-slate-500 hover:bg-slate-200 transition active:scale-95"
                                        >
                                            <ImageIcon className="w-6 h-6" />
                                        </button>
                                        <input 
                                            value={inputValue} 
                                            onChange={e => setInputValue(e.target.value)}
                                            placeholder={t('typeQuestionPlaceholder')}
                                            className="flex-1 bg-slate-50 dark:bg-dark-muted px-5 py-4 rounded-[1.5rem] text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 text-slate-900 dark:text-white"
                                            style={{ fontSize: '16px' }}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!inputValue.trim() || isTyping}
                                        className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 active:scale-90 transition flex items-center justify-center"
                                    >
                                        <SendIcon className="w-5 h-5" />
                                    </button>
                                </form>
                                <p className="text-[7px] font-black uppercase text-center mt-4 opacity-20 tracking-[0.2em]">{t('encryptionVerified')}</p>
                            </div>
                        </div>

                        {/* Right: Account details & Transactions ledger */}
                        {showDetails && state.currentUser && (
                            <div className="w-96 border-l border-gray-100 dark:border-dark-border bg-slate-50 dark:bg-dark-muted/20 p-5 flex flex-col h-full overflow-y-auto space-y-4 animate-in slide-in-from-right duration-300">
                                <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-3 shrink-0">
                                    <h3 className="text-[11px] font-black uppercase tracking-wider text-primary dark:text-dark-primary">{t('accountOverview')}</h3>
                                    <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${state.currentUser.isActivated ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {state.currentUser.isActivated ? t('active') : t('inactive')}
                                    </span>
                                </div>

                                {/* Balances */}
                                <div className="grid grid-cols-2 gap-2 shrink-0">
                                    <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs">
                                        <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Balance</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white mt-1">{formatCurrency(state.currentUser.balance)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs">
                                        <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Savings</p>
                                        <p className="text-xs font-black text-green-600 mt-1">{formatCurrency(state.currentUser.savingsBalance)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs col-span-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Loan Outstanding</p>
                                                <p className="text-xs font-black text-red-600 mt-0.5">{formatCurrency(state.currentUser.loanBalance)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Base Currency</p>
                                                <p className="text-xs font-black text-gray-500 mt-0.5">{state.currentUser.currency || 'GBP'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile info */}
                                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border space-y-2 text-[10px] shrink-0">
                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-wider mb-2 border-b border-gray-100 dark:border-dark-border pb-1">My Information Profile</p>
                                    <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Account Number:</span><span className="font-extrabold text-gray-800 dark:text-white">{state.currentUser.accountNumber}</span></div>
                                    <div className="flex justify-between items-center"><span className="opacity-50 font-bold">National ID/BVN:</span><span className="font-extrabold text-gray-800 dark:text-white">{state.currentUser.bvn || state.currentUser.idCardNumber || 'N/A'}</span></div>
                                    <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Phone Number:</span><span className="font-extrabold text-gray-800 dark:text-white">{state.currentUser.phone}</span></div>
                                    <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Email Address:</span><span className="font-extrabold text-gray-800 dark:text-white truncate max-w-[150px]">{state.currentUser.email}</span></div>
                                </div>

                                {/* Transactions */}
                                <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">My Transaction History ({state.currentUser.transactions?.length || 0})</p>
                                    {(!state.currentUser.transactions || state.currentUser.transactions.length === 0) ? (
                                        <p className="text-[9px] text-center font-bold text-muted-foreground uppercase opacity-40 py-6">No transactions logged.</p>
                                    ) : (
                                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                                            {(state.currentUser.transactions || []).map((tx: any, idx: number) => {
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
                    </div>
                )}

                {showExitConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-6">
                        <div className="bg-white dark:bg-dark-card w-full max-w-xs rounded-[2rem] p-8 text-center space-y-6 shadow-2xl border border-gray-100 dark:border-dark-border animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircleIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase tracking-tight">{t('endSessionTitle')}</h3>
                                <p className="text-xs font-bold text-muted-foreground mt-2 leading-relaxed italic">{t('exitConfirmDescription')}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setShowExitConfirm(false)} 
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                                >
                                    {t('stayInChat')}
                                </button>
                                <button 
                                    onClick={() => { setShowExitConfirm(false); onClose(); }} 
                                    className="w-full py-4 bg-gray-50 dark:bg-dark-muted text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl"
                                >
                                    {t('exitSupport')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default Chatbot;

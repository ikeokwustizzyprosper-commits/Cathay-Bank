import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    getDocs, 
    query, 
    where,
    deleteDoc,
    terminate,
    setLogLevel
} from "firebase/firestore";
import {
    sendTransactionalEmail,
    buildAccountCreatedEmail,
    buildEmailVerificationEmail,
    buildTransferSentEmail,
    buildTransferReceivedEmail,
    buildTransferFailedEmail,
    buildPasswordResetEmail,
    buildPasswordChangedSuccessEmail,
    buildLogin2FAEmail,
    buildTransferProcessingNotificationEmail,
    buildSystemTestEmail,
    getServerEmailConfigStatus
} from "./server/emailService";
import { recordAuditLog, computeAdminOverview } from "./server/adminService";

// Suppress internal Firebase SDK warnings and errors from cluttering logs or triggering false alarm alerts
setLogLevel("silent");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

// Fallback in-memory state for Test Environment
let dbState = {
    users: [] as any[],
    accounts: [] as any[],
    transactions: [] as any[],
    notifications: [] as any[],
    auditLogs: [] as any[],
    emails: [] as any[],
    messages: [] as any[],
    systemNote: ""
};

// Load initial fallback state from data.json if it exists
if (fs.existsSync(DATA_FILE)) {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        dbState = JSON.parse(data.split('jameslay010@gmail.com').join('jamesmichaellay000@gmail.com'));
    } catch (e) {
        console.error("Error reading data file", e);
    }
}

// Initialize Firebase from config
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseApp: any = null;
let firestore: any = null;
let isFirestoreQuotaExhausted = false;

function handleFirestoreError(err: any, contextMessage: string) {
    const errMsg = String(err);
    const isQuota = errMsg.includes("RESOURCE_EXHAUSTED") || 
                    errMsg.toLowerCase().includes("quota") || 
                    errMsg.toLowerCase().includes("exhausted") ||
                    errMsg.toLowerCase().includes("limit exceeded") ||
                    errMsg.toLowerCase().includes("timed out") ||
                    errMsg.toLowerCase().includes("timeout") ||
                    (err && (err.code === 8 || err.code === 'resource-exhausted'));

    const isPermission = errMsg.toLowerCase().includes("permission") ||
                         errMsg.toLowerCase().includes("insufficient") ||
                         (err && (err.code === 'permission-denied' || err.code === 7));

    if (isQuota || isPermission || errMsg.toLowerCase().includes("timed out")) {
        if (!isFirestoreQuotaExhausted) {
            isFirestoreQuotaExhausted = true;
            console.log(`[Database] Using local resilient data store (${isQuota ? 'quota limit/timeout' : 'permission mode'}).`);
            if (firestore) {
                try {
                    terminate(firestore).catch(() => {});
                } catch {
                    // ignore terminate error
                }
                firestore = null;
            }
        }
    } else {
        console.log(`[Database Note] ${contextMessage}:`, errMsg);
    }
}

if (fs.existsSync(firebaseConfigPath)) {
    try {
        const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
        firebaseApp = initializeApp(config);
        if (config.firestoreDatabaseId) {
            firestore = getFirestore(firebaseApp, config.firestoreDatabaseId);
        } else {
            firestore = getFirestore(firebaseApp);
        }
        console.log("Firebase Firestore initialized successfully with project:", config.projectId);
    } catch (e) {
        console.error("Failed to initialize Firebase:", e);
    }
} else {
    console.warn("firebase-applet-config.json not found, falling back to local memory database.");
}

function saveLocalState() {
    try {
        const serialized = JSON.stringify(dbState, null, 2).split('jameslay010@gmail.com').join('jamesmichaellay000@gmail.com');
        fs.writeFileSync(DATA_FILE, serialized);
    } catch (e) {
        console.error("Error saving state", e);
    }
}

let lastFirestoreSyncTime = 0;
let isFirestoreSyncInProgress = false;

function withFirestoreTimeout<T>(promise: Promise<T>, ms = 2500, context = "Firestore"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`${context} timed out after ${ms}ms`));
        }, ms);
        promise
            .then(res => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch(err => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

// Background sync from Firestore to update in-memory state
async function syncDbStateFromFirestore() {
    if (!firestore || isFirestoreQuotaExhausted || isFirestoreSyncInProgress) {
        return;
    }
    isFirestoreSyncInProgress = true;
    try {
        // Fetch users
        const usersSnapshot = await withFirestoreTimeout(getDocs(collection(firestore, 'users')), 2500, "Fetch users");
        let users: any[] = [];
        usersSnapshot.forEach(docSnap => {
            users.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Migrate users from Lazarus to Cao Duy
        let hasModifiedSanchez = false;
        let migratedUsers = users.map(u => {
            const isLazarus = u.id === 'usr_lazarus_morrison' || 
                              (u.name && u.name.toLowerCase().includes('lazarus')) || 
                              (u.email && u.email.toLowerCase().includes('lazarus'));
            if (isLazarus || u.id === 'usr_cao_duy') {
                hasModifiedSanchez = true;
                
                // Deduplicate and clean up notifications
                const existingNotifs = u.notifications || [];
                const seenNotifs = new Set();
                const cleanNotifs = [];
                for (const notif of existingNotifs) {
                    if (notif && notif.id) {
                        const isUAE = notif.message === 'notifUAE' || notif.message === 'notifTrueUAE';
                        if (isUAE) {
                            if (seenNotifs.has('uae')) continue;
                            seenNotifs.add('uae');
                        }
                        if (!seenNotifs.has(notif.id)) {
                            seenNotifs.add(notif.id);
                            cleanNotifs.push(notif);
                        }
                    }
                }
                
                // Ensure we have UAE and Syria and restriction exactly once
                const restrictionNotif = cleanNotifs.find(n => n.id === 'notif_restriction') || {
                    id: 'notif_restriction',
                    title: 'securityAlert',
                    message: 'transferRestrictedMessage',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'error'
                };
                
                const syriaNotif = cleanNotifs.find(n => n.id === 'notif_syria') || {
                    id: 'notif_syria',
                    title: 'securityAlert',
                    message: 'notifTrueSyria',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'warning'
                };

                const uaeNotif = cleanNotifs.find(n => n.id === 'notif_uae_real') || {
                    id: 'notif_uae_real',
                    title: 'securityAlert',
                    message: 'notifTrueUAE',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'warning'
                };

                // Clear these from cleanNotifs to avoid duplicates and ensure perfect order
                const otherNotifs = cleanNotifs.filter(n => n.id !== 'notif_restriction' && n.id !== 'notif_syria' && n.id !== 'notif_uae_real');
                cleanNotifs.length = 0;
                cleanNotifs.push(uaeNotif, syriaNotif, restrictionNotif, ...otherNotifs);

                // Prepare explicit June 2026 transactions
                let txns = (u.transactions || []).filter((t: any) => 
                    t.id !== 'txn_sanchez_june_1' && 
                    t.id !== 'txn_sanchez_june_2' && 
                    t.id !== 'txn_sanchez_june_3' && 
                    t.id !== 'txn_sanchez_june_4' && 
                    t.id !== 'txn_sanchez_latest_airport_july6' &&
                    t.id !== 'txn_sanchez_philippines_globalcash' &&
                    t.id !== 'txn_sanchez_walmart_july4' &&
                    t.id !== 'txn_sanchez_david_july2' &&
                    t.status !== 'Failed'
                );

                txns.push({
                    id: 'txn_sanchez_philippines_globalcash',
                    date: '2026-07-05T18:15:00Z',
                    description: 'International Debit to Philippines (GCash)',
                    amount: 5009.99,
                    type: 'debit',
                    category: 'Family Support',
                    status: 'Reversed',
                    reference: '5788295780',
                    senderName: 'Cao Duy',
                    senderAccount: '7722994411',
                    receiverName: 'Necel Laraga',
                    receiverAccount: 'GCash Wallet (+63 907 817 4216)',
                    bankName: 'GCash',
                    country: 'Philippines',
                    currency: 'GBP',
                    subtitle: 'Card Payment – GlobalCash Money Transfer',
                    fee: 9.99,
                    totalDebited: 5009.99,
                    amountReceived: 'PHP 395,000.00',
                    exchangeRate: '1 GBP = PHP 79.00',
                    paymentMethod: 'Visa Debit ••••4242',
                    receivingNetwork: 'GCash Wallet',
                    estimatedDelivery: '7 July 2026'
                });

                txns.push({
                    id: 'txn_sanchez_walmart_july4',
                    date: '2026-07-04T12:00:00Z',
                    description: 'Transfer to Walmart',
                    amount: 578.00,
                    type: 'debit',
                    category: 'Shopping',
                    status: 'Completed',
                    reference: 'TXN-WM-4433',
                    senderName: 'Cao Duy',
                    senderAccount: '7722994411',
                    receiverName: 'Walmart',
                    receiverAccount: 'US-WMT-88229',
                    bankName: 'Capital One',
                    country: 'United States',
                    currency: 'GBP'
                });

                txns.push({
                    id: 'txn_sanchez_david_july2',
                    date: '2026-07-02T10:30:00Z',
                    description: 'Transfer to David Michael',
                    amount: 1150.00,
                    type: 'debit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'TXN-DM-2211',
                    senderName: 'Cao Duy',
                    senderAccount: '7722994411',
                    receiverName: 'David Michael',
                    receiverAccount: 'UK-DM-5544',
                    bankName: 'Barclays Bank',
                    country: 'United Kingdom',
                    currency: 'GBP'
                });

                txns.push({
                    id: 'txn_sanchez_june_1',
                    date: '2026-06-28T10:15:00Z',
                    description: 'Transfer to David Miller',
                    amount: 350.00,
                    type: 'debit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'REF-202606-99',
                    senderName: 'Cao Duy',
                    senderAccount: '7722994411',
                    receiverName: 'David Miller',
                    receiverAccount: 'ACC-883311',
                    bankName: 'Cathay Bank Core',
                    country: 'United Kingdom',
                    currency: 'GBP'
                });

                txns.push({
                    id: 'txn_sanchez_june_2',
                    date: '2026-06-30T15:40:00Z',
                    description: 'Salary Credit from Hospital',
                    amount: 10500.00,
                    type: 'credit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'REF-202606-98',
                    senderName: 'NHS Trust',
                    senderAccount: 'ACC-332211',
                    receiverName: 'Cao Duy',
                    receiverAccount: '7722994411',
                    bankName: 'Barclays Bank',
                    country: 'United Kingdom',
                    currency: 'GBP'
                });

                txns.push({
                    id: 'txn_sanchez_june_4',
                    date: '2026-06-24T12:00:00Z',
                    description: 'Transfer to Jark Rubbinson',
                    amount: 1500.00,
                    type: 'debit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'REF-202606-94',
                    senderName: 'Cao Duy',
                    senderAccount: '7722994411',
                    receiverName: 'Jark Rubbinson',
                    receiverAccount: '2890155799',
                    bankName: 'Cathay Bank Core',
                    country: 'United Kingdom',
                    currency: 'GBP'
                });

                txns.push({
                    id: 'txn_sanchez_june_3',
                    date: '2026-06-15T09:20:00Z',
                    description: 'Transfer to Heathrow Airport',
                    amount: 120.00,
                    type: 'debit',
                    category: 'Travel',
                    status: 'Completed',
                    reference: 'REF-202606-97',
                    senderName: 'Cao Duy',
                    senderAccount: '7722994411',
                    receiverName: 'Heathrow Airport',
                    receiverAccount: 'UK-AUTH-882299',
                    bankName: 'Barclays Bank',
                    country: 'United Kingdom',
                    currency: 'GBP'
                });

                // Sort transactions by date descending
                txns.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return {
                    ...u,
                    id: 'usr_cao_duy',
                    name: 'Cao Duy',
                    email: 'caoduy@gmail.com',
                    password: u.password || 'caoduy@100',
                    phone: '+44 7922 286845',
                    accountNumber: '2890155789',
                    avatar: u.avatar || 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg',
                    pin: u.pin || '0814',
                    isActivated: false,
                    isBlocked: false,
                    role: 'customer',
                    notifications: cleanNotifs,
                    transactions: txns,
                    cards: [
                        {
                            id: 'card_1',
                            type: 'physical',
                            provider: 'mastercard',
                            number: '5578 1234 5678 9740',
                            expiry: '12/29',
                            cvv: '918',
                            holderName: 'Cao Duy'
                        },
                        {
                            id: 'card_2',
                            type: 'physical',
                            provider: 'visa',
                            number: '4532 8812 9001 4242',
                            expiry: '08/28',
                            cvv: '443',
                            holderName: 'Cao Duy'
                        }
                    ]
                };
            }
            const isAlexJeff = u.id === 'usr_alex_jeff' || 
                               (u.name && u.name.toLowerCase() === 'alex jeff') || 
                               (u.email && u.email.toLowerCase().includes('alexjeff9'));
            if (isAlexJeff) {
                const alexNotifs = [
                    {
                        id: 'notif_peru_alex_jeff',
                        title: 'securityAlert',
                        message: 'notifPeruAlex',
                        date: '2026-07-27T09:26:05.143Z',
                        read: false,
                        type: 'warning'
                    },
                    {
                        id: 'notif_syria_alex_jeff',
                        title: 'securityAlert',
                        message: 'notifSyriaAlex',
                        date: '2026-07-27T07:56:05.143Z',
                        read: false,
                        type: 'warning'
                    }
                ];

                const airportTxn = {
                    id: 'txn_alex_latest_airport',
                    date: '2026-07-26T14:30:00Z',
                    description: 'Transfer to Heathrow Airport',
                    amount: 1459,
                    type: 'debit',
                    category: 'Travel',
                    status: 'Completed',
                    reference: 'APT-6739',
                    senderName: 'Alex Jeff',
                    senderAccount: '2890155791',
                    receiverName: 'Heathrow Airport Ltd',
                    receiverAccount: 'UK-AUTH-882299',
                    bankName: 'Barclays Bank',
                    country: 'United Kingdom',
                    currency: 'GBP'
                };

                const julyTxn1 = {
                    id: 'txn_alex_july_1',
                    date: '2026-07-20T11:15:00Z',
                    description: 'Transfer from Ava Thomas',
                    amount: 2850,
                    type: 'credit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'REF-202607-01',
                    senderName: 'Ava Thomas',
                    senderAccount: 'ACC-882103',
                    receiverName: 'Alex Jeff',
                    receiverAccount: '2890155791',
                    bankName: 'Cathay Bank Core',
                    country: 'United Kingdom',
                    currency: 'GBP'
                };

                const julyTxn2 = {
                    id: 'txn_alex_july_2',
                    date: '2026-07-12T09:40:00Z',
                    description: 'Transfer to Harper Baker',
                    amount: 1200,
                    type: 'debit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'REF-202607-02',
                    senderName: 'Alex Jeff',
                    senderAccount: '2890155791',
                    receiverName: 'Harper Baker',
                    receiverAccount: 'ACC-991204',
                    bankName: 'Cathay Bank Core',
                    country: 'United Kingdom',
                    currency: 'GBP'
                };

                const mayTxn1 = {
                    id: 'txn_alex_may_1',
                    date: '2026-05-18T16:20:00Z',
                    description: 'Transfer from Oliver Green',
                    amount: 3400,
                    type: 'credit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: 'REF-202605-01',
                    senderName: 'Oliver Green',
                    senderAccount: 'ACC-110293',
                    receiverName: 'Alex Jeff',
                    receiverAccount: '2890155791',
                    bankName: 'Cathay Bank Core',
                    country: 'United Kingdom',
                    currency: 'GBP'
                };

                let alexTxns = (u.transactions || []).filter((t: any) => 
                    t.id !== airportTxn.id &&
                    t.id !== julyTxn1.id &&
                    t.id !== julyTxn2.id &&
                    t.id !== mayTxn1.id &&
                    !(t.receiverName && t.receiverName.toLowerCase().includes('john')) &&
                    !(t.senderName && t.senderName.toLowerCase().includes('john')) &&
                    !(t.description && t.description.toLowerCase().includes('john')) &&
                    !(t.id && t.id.startsWith('tx_debit_failed')) &&
                    new Date(t.date).getTime() < new Date('2026-07-26T14:30:00Z').getTime()
                );

                const finalAlexTxns = [airportTxn, julyTxn1, julyTxn2, mayTxn1, ...alexTxns];
                finalAlexTxns.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                const updatedAlex = {
                    ...u,
                    id: 'usr_alex_jeff',
                    name: 'Alex Jeff',
                    notifications: alexNotifs,
                    transactions: finalAlexTxns
                };

                if (firestore && !isFirestoreQuotaExhausted) {
                    setDoc(doc(firestore, 'users', 'usr_alex_jeff'), updatedAlex, { merge: true }).catch(() => {});
                }

                return updatedAlex;
            }
            return u;
        });

        // If there were any duplicates or if Lazarus was deleted
        const sanchezUserIdx = migratedUsers.findIndex(u => u.id === 'usr_cao_duy');
        if (sanchezUserIdx !== -1) {
            migratedUsers[sanchezUserIdx].balance = 14732097.60;
        }
        if (sanchezUserIdx === -1) {
            const originalLazarus = users.find(u => 
                u.id === 'usr_lazarus_morrison' || 
                (u.name && u.name.toLowerCase().includes('lazarus')) || 
                (u.email && u.email.toLowerCase().includes('lazarus'))
            );
            const fallbackAvatar = originalLazarus?.avatar || 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg';
            const fallbackSanchez = {
                id: 'usr_cao_duy',
                name: 'Cao Duy',
                email: 'caoduy@gmail.com',
                password: 'caoduy@100',
                phone: '+44 7922 286845',
                accountNumber: '2890155789',
                bvn: '998-22-1133',
                idCardNumber: 'USA-NY-7722',
                avatar: fallbackAvatar, 
                balance: 14732097.60,
                savingsBalance: 2000000.00,
                loanBalance: 0.00,
                 notifications: [
                    {
                        id: 'notif_uae_real',
                        title: 'securityAlert',
                        message: 'notifTrueUAE',
                        date: new Date().toISOString(),
                        read: false,
                        type: 'warning'
                    },
                    {
                        id: 'notif_syria',
                        title: 'securityAlert',
                        message: 'notifTrueSyria',
                        date: new Date().toISOString(),
                        read: false,
                        type: 'warning'
                    },
                    {
                        id: 'notif_restriction',
                        title: 'securityAlert',
                        message: 'transferRestrictedMessage',
                        date: new Date().toISOString(),
                        read: false,
                        type: 'error'
                    }
                ],
                pin: '0814',
                currency: 'GBP',
                role: 'customer',
                isActivated: false,
                isBlocked: false,
                cards: [
                    {
                        id: 'card_1',
                        type: 'physical',
                        provider: 'mastercard',
                        number: '5578 1234 5678 9740',
                        expiry: '12/29',
                        cvv: '918',
                        holderName: 'Cao Duy'
                    },
                    {
                        id: 'card_2',
                        type: 'physical',
                        provider: 'visa',
                        number: '4532 8812 9001 4242',
                        expiry: '08/28',
                        cvv: '443',
                        holderName: 'Cao Duy'
                    }
                ],
                transactions: [
                    {
                        id: 'txn_necel_laraga_failed',
                        date: '2026-07-08T22:06:00Z',
                        description: 'International Transfer to Necel Laraga',
                        amount: 20000.00,
                        type: 'debit',
                        category: 'Transfer',
                        status: 'Failed',
                        reference: 'TXN-NL-998844',
                        senderName: 'Cao Duy',
                        senderAccount: '2890155789',
                        receiverName: 'Necel Laraga',
                        receiverAccount: '+63 907 817 4216',
                        bankName: 'GCash',
                        country: 'Philippines',
                        currency: 'GBP',
                        paymentMethod: 'GCash',
                        failureReason: 'This international transfer could not be completed. No successful transfer has been confirmed. Please review the transaction details or contact support for assistance.'
                    },
                    {
                        id: 'txn_hilton_kyiv',
                        date: '2026-07-08T17:37:00Z',
                        description: 'International Transfer to Hilton Kyiv hotel',
                        amount: 1500.00,
                        type: 'debit',
                        category: 'Travel',
                        status: 'Failed',
                        reference: 'TXN-98274510',
                        senderName: 'Cao Duy',
                        senderAccount: '2890155789',
                        receiverName: 'Hilton Kyiv hotel',
                        receiverAccount: '0198805247',
                        bankName: 'Ukrsibbank',
                        country: 'Ukraine',
                        currency: 'GBP',
                        fee: 15.00,
                        totalDebited: 1515.00,
                        amountReceived: 'UAH 77,250.00',
                        exchangeRate: '1 GBP = 51.50 UAH',
                        failureReason: 'This transaction could not be completed because your account is temporarily restricted due to security & compliance verification requirements. Please contact Customer Support or your Bank Agent.'
                    },
                    {
                        id: 'txn_sanchez_philippines_globalcash',
                        date: '2026-07-05T18:15:00Z',
                        description: 'International Debit to Philippines (GCash)',
                        amount: 5009.99,
                        type: 'debit',
                        category: 'Family Support',
                        status: 'Reversed',
                        reference: '5788295780',
                        senderName: 'Cao Duy',
                        senderAccount: '7722994411',
                        receiverName: 'Necel Laraga',
                        receiverAccount: 'GCash Wallet (+63 907 817 4216)',
                        bankName: 'GCash',
                        country: 'Philippines',
                        currency: 'GBP',
                        subtitle: 'Card Payment – GlobalCash Money Transfer',
                        fee: 9.99,
                        totalDebited: 5009.99,
                        amountReceived: 'PHP 395,000.00',
                        exchangeRate: '1 GBP = PHP 79.00',
                        paymentMethod: 'Visa Debit ••••4242',
                        receivingNetwork: 'GCash Wallet',
                        estimatedDelivery: '7 July 2026'
                    },
                    {
                        id: 'txn_sanchez_walmart_july4',
                        date: '2026-07-04T12:00:00Z',
                        description: 'Transfer to Walmart',
                        amount: 578.00,
                        type: 'debit',
                        category: 'Shopping',
                        status: 'Completed',
                        reference: 'TXN-WM-4433',
                        senderName: 'Cao Duy',
                        senderAccount: '7722994411',
                        receiverName: 'Walmart',
                        receiverAccount: 'US-WMT-88229',
                        bankName: 'Capital One',
                        country: 'United States',
                        currency: 'GBP'
                    },
                    {
                        id: 'txn_sanchez_david_july2',
                        date: '2026-07-02T10:30:00Z',
                        description: 'Transfer to David Michael',
                        amount: 1150.00,
                        type: 'debit',
                        category: 'Transfer',
                        status: 'Completed',
                        reference: 'TXN-DM-2211',
                        senderName: 'Cao Duy',
                        senderAccount: '7722994411',
                        receiverName: 'David Michael',
                        receiverAccount: 'UK-DM-5544',
                        bankName: 'Barclays Bank',
                        country: 'United Kingdom',
                        currency: 'GBP'
                    },
                    {
                        id: 'txn_sanchez_june_1',
                        date: '2026-06-28T10:15:00Z',
                        description: 'Transfer to David Miller',
                        amount: 350.00,
                        type: 'debit',
                        category: 'Transfer',
                        status: 'Completed',
                        reference: 'REF-202606-99',
                        senderName: 'Cao Duy',
                        senderAccount: '7722994411',
                        receiverName: 'David Miller',
                        receiverAccount: 'ACC-883311',
                        bankName: 'Cathay Bank Core',
                        country: 'United Kingdom',
                        currency: 'GBP'
                    },
                    {
                        id: 'txn_sanchez_june_2',
                        date: '2026-06-30T15:40:00Z',
                        description: 'Salary Credit from Hospital',
                        amount: 10500.00,
                        type: 'credit',
                        category: 'Transfer',
                        status: 'Completed',
                        reference: 'REF-202606-98',
                        senderName: 'NHS Trust',
                        senderAccount: 'ACC-332211',
                        receiverName: 'Cao Duy',
                        receiverAccount: '7722994411',
                        bankName: 'Barclays Bank',
                        country: 'United Kingdom',
                        currency: 'GBP'
                    },
                    {
                        id: 'txn_sanchez_june_4',
                        date: '2026-06-24T12:00:00Z',
                        description: 'Transfer to Jark Rubbinson',
                        amount: 1500.00,
                        type: 'debit',
                        category: 'Transfer',
                        status: 'Completed',
                        reference: 'REF-202606-94',
                        senderName: 'Cao Duy',
                        senderAccount: '7722994411',
                        receiverName: 'Jark Rubbinson',
                        receiverAccount: '2890155799',
                        bankName: 'Cathay Bank Core',
                        country: 'United Kingdom',
                        currency: 'GBP'
                    },
                    {
                        id: 'txn_sanchez_june_3',
                        date: '2026-06-15T09:20:00Z',
                        description: 'Transfer to Heathrow Airport',
                        amount: 120.00,
                        type: 'debit',
                        category: 'Travel',
                        status: 'Completed',
                        reference: 'REF-202606-97',
                        senderName: 'Cao Duy',
                        senderAccount: '7722994411',
                        receiverName: 'Heathrow Airport',
                        receiverAccount: 'UK-AUTH-882299',
                        bankName: 'Barclays Bank',
                        country: 'United Kingdom',
                        currency: 'GBP'
                    }
                ]
            };
            migratedUsers.push(fallbackSanchez);
            try {
                await setDoc(doc(firestore, 'users', 'usr_cao_duy'), fallbackSanchez);
            } catch (err) {
                console.warn("Could not write migrated fallback Sanchez to Firestore (falling back to memory):", err);
            }
        } else if (hasModifiedSanchez) {
            try {
                await setDoc(doc(firestore, 'users', 'usr_cao_duy'), migratedUsers[sanchezUserIdx]);
            } catch (err) {
                console.warn("Could not write migrated Sanchez to Firestore (falling back to memory):", err);
            }
        }

        // Clean up any remaining document with ID 'usr_lazarus_morrison' in Firestore
        try {
            await deleteDoc(doc(firestore, 'users', 'usr_lazarus_morrison'));
        } catch (e) {
            // ignore if already deleted or doesn't exist
        }

        // Deduplicate the list by id to make sure there are no duplicate usr_cao_duy or other users
        const uniqueUsersMap = new Map();
        migratedUsers.forEach(u => {
            if (u && u.id) {
                uniqueUsersMap.set(u.id, u);
            }
        });

        if (!uniqueUsersMap.has('usr_john_kerry')) {
            const fallbackJohnKerry = {
                id: 'usr_john_kerry',
                name: 'James Michael Lay',
                email: 'jamesmichaellay000@gmail.com',
                password: 'Jameslay010',
                phone: '+1 (617) 555-0198',
                accountNumber: '2890155800',
                bvn: '998-10-0790',
                idCardNumber: 'USA-DC-2020',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                balance: 14732097.60,
                savingsBalance: 500000.00,
                loanBalance: 0.00,
                pin: '0814',
                currency: 'USD',
                role: 'customer',
                isActivated: false,
                isBlocked: false,
                notifications: [
                    {
                        id: 'notif_jk_2025_sec',
                        title: 'Security Alert: New Device Login (USA)',
                        message: 'We noticed an executive banking device login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
                        date: '2025-11-14T14:22:00.000Z',
                        read: false,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2025_login',
                        title: 'Login Noticed (USA)',
                        message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
                        date: '2025-06-20T09:15:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2024_afg_wire',
                        title: 'Login Noticed (USA)',
                        message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
                        date: '2024-10-08T16:45:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2024_usa_device',
                        title: 'Trusted Device Added (USA)',
                        message: 'New device registered as trusted banking device from USA 🇺🇸.',
                        date: '2024-03-15T11:04:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2023_afg_threat',
                        title: 'Security Notice (USA)',
                        message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
                        date: '2023-09-12T08:30:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2023_usa_dividend',
                        title: 'Treasury Dividend Received (USA)',
                        message: 'Executive dividend credit of $160,000.00 posted from USA 🇺🇸.',
                        date: '2023-01-25T15:20:00.000Z',
                        read: true,
                        type: 'success'
                    },
                    {
                        id: 'notif_jk_2022_usa_pin',
                        title: 'Security PIN Updated (USA)',
                        message: 'Transaction authorization PIN successfully updated from USA 🇺🇸.',
                        date: '2022-11-04T13:10:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2022_usa_estate',
                        title: 'Property Wire Sent (USA)',
                        message: 'Outgoing transfer of $85,000.00 to Beacon Hill Property Management, USA 🇺🇸 completed.',
                        date: '2022-04-18T10:50:00.000Z',
                        read: true,
                        type: 'success'
                    },
                    {
                        id: 'notif_jk_2021_afg_alert',
                        title: 'Login Noticed (USA)',
                        message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
                        date: '2021-08-30T19:05:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2021_usa_endowment',
                        title: 'Philanthropic Wire Approved (USA)',
                        message: 'Endowment Wire of $500,000.00 to Harvard Kennedy School, USA 🇺🇸 authorized.',
                        date: '2021-02-14T14:00:00.000Z',
                        read: true,
                        type: 'success'
                    },
                    {
                        id: 'notif_jk_2020_afg_hold',
                        title: 'Security Verification Cleared (USA)',
                        message: 'Executive identity verification completed successfully in Chicago, IL, USA 🇺🇸.',
                        date: '2020-10-19T12:40:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2020_usa_kyc',
                        title: 'KYC Level 3 Verification (USA)',
                        message: 'Annual Level 3 Executive KYC verification renewed successfully in USA 🇺🇸.',
                        date: '2020-05-11T09:00:00.000Z',
                        read: true,
                        type: 'success'
                    },
                    {
                        id: 'notif_jk_2019_afg_embassy',
                        title: 'Login Noticed (USA)',
                        message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
                        date: '2019-12-05T17:15:00.000Z',
                        read: true,
                        type: 'info'
                    },
                    {
                        id: 'notif_jk_2019_usa_welcome',
                        title: 'Vault Onboarding & Account Created (USA)',
                        message: 'Welcome to Cathay Bank Private Vault. Account setup completed in USA 🇺🇸.',
                        date: '2019-06-18T08:00:00.000Z',
                        read: true,
                        type: 'success'
                    }
                ]
            };
            uniqueUsersMap.set('usr_john_kerry', fallbackJohnKerry);
            if (firestore && !isFirestoreQuotaExhausted) {
                setDoc(doc(firestore, 'users', 'usr_john_kerry'), fallbackJohnKerry).catch(() => {});
            }
        } else {
            // Ensure usr_john_kerry in Firestore/map has updated name and credentials
            const existingCao = uniqueUsersMap.get('usr_cao_duy');
            if (existingCao) {
                existingCao.balance = 14732097.60;
                uniqueUsersMap.set('usr_cao_duy', existingCao);
            }
            const existing = uniqueUsersMap.get('usr_john_kerry');
            if (existing) {
                existing.name = 'James Michael Lay';
                existing.email = 'jamesmichaellay000@gmail.com';
                existing.password = 'Jameslay010';
                existing.phone = '+1 (617) 555-0198';
                existing.balance = 14732097.60;
                existing.isActivated = false;
                uniqueUsersMap.set('usr_john_kerry', existing);
                // Persist updated email to Firestore
                setDoc(doc(firestore, 'users', 'usr_john_kerry'), existing, { merge: true }).catch(() => {});
            }
        }

        users = Array.from(uniqueUsersMap.values());

        // Fetch messages
        const messagesSnapshot = await withFirestoreTimeout(getDocs(collection(firestore, 'messages')), 2500, "Fetch messages");
        const messages: any[] = [];
        messagesSnapshot.forEach(docSnap => {
            messages.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Sort messages by timestamp
        messages.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeA - timeB;
        });

        // Fetch system config
        let systemNote = "";
        try {
            const configDoc = await withFirestoreTimeout(getDoc(doc(firestore, 'system', 'config')), 2000, "Fetch system config");
            if (configDoc.exists()) {
                systemNote = configDoc.data().systemNote || "";
            }
        } catch (e) {
            // Note: config fetch error logged gracefully
        }

        // If firestore is completely empty, seed it with fallback users/messages
        if (users.length === 0) {
            console.log("Firestore is empty. Seeding with fallback data...");
            const seedUsers = dbState.users && dbState.users.length > 0 ? dbState.users : [];
            for (const u of seedUsers) {
                try {
                    await setDoc(doc(firestore, 'users', u.id), u);
                } catch (err) {
                    console.warn(`Could not seed user ${u.id} to Firestore:`, err);
                }
                users.push(u);
            }

            const seedMessages = dbState.messages && dbState.messages.length > 0 ? dbState.messages : [];
            for (const m of seedMessages) {
                const mId = m.id || `msg_${Math.random().toString(36).substring(2, 9)}`;
                try {
                    await setDoc(doc(firestore, 'messages', mId), m);
                } catch (err) {
                    console.warn(`Could not seed message ${mId} to Firestore:`, err);
                }
                messages.push({ ...m, id: mId });
            }

            if (dbState.systemNote) {
                try {
                    await setDoc(doc(firestore, 'system', 'config'), { systemNote: dbState.systemNote });
                } catch (err) {
                    console.warn(`Could not seed system config to Firestore:`, err);
                }
                systemNote = dbState.systemNote;
            }
        }

        if (users.length > 0) {
            dbState.users = users;
        }
        if (messages.length > 0) {
            dbState.messages = messages;
        }
        if (systemNote) {
            dbState.systemNote = systemNote;
        }
        saveLocalState();
        lastFirestoreSyncTime = Date.now();
    } catch (e) {
        handleFirestoreError(e, "Error fetching state from Firestore");
    } finally {
        isFirestoreSyncInProgress = false;
    }
}

// Fetch complete state instantly from memory cache with background sync
async function getDbState() {
    if (firestore && !isFirestoreQuotaExhausted) {
        if (Date.now() - lastFirestoreSyncTime > 30000 && !isFirestoreSyncInProgress) {
            lastFirestoreSyncTime = Date.now();
            syncDbStateFromFirestore().catch(() => {});
        }
    }
    return dbState;
}

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Helpers for real-time notifications
function formatTime(isoString: string): string {
    try {
        const d = new Date(isoString);
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const minStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minStr} ${ampm}`;
    } catch(e) {
        return "now";
    }
}

function getCurrencySymbol(currency: string): string {
    switch (currency?.toUpperCase()) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'NGN': return '₦';
        default: return '£';
    }
}

// Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// Endpoint to register/update FCM token
app.post("/api/users/update-fcm-token", async (req, res) => {
    const { userId, fcmToken } = req.body;
    if (!userId || !fcmToken) {
        return res.status(400).json({ error: "Missing userId or fcmToken" });
    }

    if (!firestore || isFirestoreQuotaExhausted) {
        const index = dbState.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return res.status(404).json({ error: "User not found" });
        }
        dbState.users[index].fcmToken = fcmToken;
        saveLocalState();
        return res.json({ success: true, fcmToken });
    }

    try {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found" });
        }
        await updateDoc(userRef, { fcmToken });
        res.json({ success: true, fcmToken });
    } catch (e) {
        handleFirestoreError(e, "Error updating FCM token");
        // Graceful fallback to local state
        const index = dbState.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            dbState.users[index].fcmToken = fcmToken;
            saveLocalState();
        }
        res.json({ success: true, fcmToken });
    }
});

async function syncAccountDocument(user: any) {
    if (!user || !user.id) return;
    const accountId = `acc_${user.id}`;
    const initialSimulatedBalance = typeof user.balance === 'number' ? user.balance : 10000.00;
    const accountData = {
        id: accountId,
        userId: user.id,
        accountNumber: user.accountNumber || `289${Math.floor(1000000 + Math.random() * 9000000)}`,
        fullName: user.name || 'Account Holder',
        email: user.email,
        currency: user.currency || 'USD',
        simulatedBalance: initialSimulatedBalance,
        savingsBalance: typeof user.savingsBalance === 'number' ? user.savingsBalance : 0,
        loanBalance: typeof user.loanBalance === 'number' ? user.loanBalance : 0,
        accountStatus: user.isBlocked ? 'frozen' : 'active',
        isTestEnvironment: true,
        createdDate: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin || new Date().toISOString(),
        emailVerificationStatus: Boolean(user.emailVerified)
    };

    if (!dbState.accounts) dbState.accounts = [];
    const accIndex = dbState.accounts.findIndex((a: any) => a.id === accountId || a.userId === user.id);
    const isNewRegistration = accIndex === -1;

    if (isNewRegistration) {
        dbState.accounts.push(accountData);
        // Dispatch welcome and verification emails for new customer in Test Environment
        if (user.email) {
            const welcomeEmail = buildAccountCreatedEmail({
                fullName: user.name || 'Valued Customer',
                accountNumber: accountData.accountNumber,
                currency: accountData.currency,
                simulatedBalance: accountData.simulatedBalance
            });
            sendTransactionalEmail({
                recipient: user.email,
                emailType: 'Account Created',
                subject: welcomeEmail.subject,
                bodyHtml: welcomeEmail.bodyHtml
            }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(e => console.warn("Notice: account creation email notice:", e));

            const verifyEmail = buildEmailVerificationEmail({
                fullName: user.name || 'Valued Customer',
                verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
            });
            sendTransactionalEmail({
                recipient: user.email,
                emailType: 'Email Verification',
                subject: verifyEmail.subject,
                bodyHtml: verifyEmail.bodyHtml
            }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(e => console.warn("Notice: verification email notice:", e));
        }
    } else {
        dbState.accounts[accIndex] = { ...dbState.accounts[accIndex], ...accountData };
    }
    saveLocalState();

    if (firestore && !isFirestoreQuotaExhausted) {
        try {
            await setDoc(doc(firestore, 'accounts', accountId), accountData, { merge: true });
        } catch (e: any) {
            console.warn(`Firestore sync account notice for ${user.id}:`, e?.message || e);
        }
    }
}

async function saveUserToFirestore(user: any) {
    // If the password is a short plaintext string, automatically hash it for security
    if (user.password && user.password.length < 60) {
        user.password = hashPassword(user.password);
    }

    // Always update local state in-memory and write to local json file as a fallback
    const index = dbState.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        dbState.users[index] = { ...dbState.users[index], ...user };
    } else {
        dbState.users.push(user);
    }
    saveLocalState();

    // Automatically synchronize account document in accounts collection
    await syncAccountDocument(user);

    if (!firestore || isFirestoreQuotaExhausted) {
        return;
    }
    try {
        let userToSave = { ...user };
        // Cap transactions array for single Firestore user document
        if (Array.isArray(userToSave.transactions) && userToSave.transactions.length > 100) {
            userToSave.transactions = userToSave.transactions.slice(0, 100);
        }
        withFirestoreTimeout(setDoc(doc(firestore, 'users', user.id), userToSave, { merge: true }), 2500, "setDoc user").catch((e: any) => {
            handleFirestoreError(e, `Firestore save user notice for ${user?.id}`);
        });
    } catch (e: any) {
        console.warn(`Firestore save user notice for ${user?.id}:`, e?.message || e);
    }
}

async function saveMessageToFirestore(message: any) {
    const msgId = message.id || `msg_${Math.random().toString(36).substring(2, 9)}`;
    const msgWithId = { ...message, id: msgId };
    
    // Always update local state first as a fallback
    const msgIndex = dbState.messages.findIndex(m => m.id === msgId);
    if (msgIndex !== -1) {
        dbState.messages[msgIndex] = msgWithId;
    } else {
        dbState.messages.push(msgWithId);
    }
    saveLocalState();

    if (!firestore || isFirestoreQuotaExhausted) {
        return;
    }
    try {
        withFirestoreTimeout(setDoc(doc(firestore, 'messages', msgId), msgWithId), 2500, "setDoc message").catch((e: any) => {
            handleFirestoreError(e, "Error saving message to Firestore");
        });
    } catch (e) {
        handleFirestoreError(e, "Error saving message to Firestore (falling back to memory/local state)");
    }
}

async function saveSystemConfigToFirestore(systemNote: string) {
    // Always update local state first as a fallback
    dbState.systemNote = systemNote;
    saveLocalState();

    if (!firestore || isFirestoreQuotaExhausted) {
        return;
    }
    try {
        withFirestoreTimeout(setDoc(doc(firestore, 'system', 'config'), { systemNote }, { merge: true }), 2500, "setDoc config").catch((e: any) => {
            handleFirestoreError(e, "Error saving system config to Firestore");
        });
    } catch (e) {
        handleFirestoreError(e, "Error saving system config to Firestore (falling back to memory/local state)");
    }
}

// API Routes
app.get("/api/state", async (req, res) => {
    try {
        const state = await getDbState();
        res.json(state);
    } catch (err) {
        res.json(dbState);
    }
});

app.post("/api/state/sync", async (req, res) => {
    try {
        const { users, messages, systemNote } = req.body;
        
        if (users && Array.isArray(users)) {
            for (const u of users) {
                if (u && u.id) {
                    const idx = dbState.users.findIndex(x => x.id === u.id);
                    if (idx !== -1) {
                        dbState.users[idx] = { ...dbState.users[idx], ...u };
                    } else {
                        dbState.users.push(u);
                    }
                    saveUserToFirestore(u).catch(() => {});
                }
            }
        }
        if (messages && Array.isArray(messages)) {
            for (const m of messages) {
                const msgId = m.id || `msg_${Math.random().toString(36).substring(2, 9)}`;
                const msgWithId = { ...m, id: msgId };
                const msgIndex = dbState.messages.findIndex(x => x.id === msgId);
                if (msgIndex !== -1) {
                    dbState.messages[msgIndex] = msgWithId;
                } else {
                    dbState.messages.push(msgWithId);
                }
                saveMessageToFirestore(msgWithId).catch(() => {});
            }
        }
        if (systemNote !== undefined) {
            dbState.systemNote = systemNote;
            saveSystemConfigToFirestore(systemNote).catch(() => {});
        }
        saveLocalState();
        res.json(dbState);
    } catch (err) {
        console.error("Sync error:", err);
        res.json(dbState);
    }
});

app.post("/api/users/update", async (req, res) => {
    try {
        const updatedUser = req.body;
        if (!updatedUser || !updatedUser.id) {
            return res.status(400).json({ error: "Invalid user data" });
        }
        const index = dbState.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            dbState.users[index] = { ...dbState.users[index], ...updatedUser };
        } else {
            dbState.users.push(updatedUser);
        }
        saveLocalState();
        res.json({ success: true, user: updatedUser });
        saveUserToFirestore(updatedUser).catch(() => {});
    } catch (err) {
        res.json({ success: true, user: req.body });
    }
});

app.post("/api/auth/send-email", async (req, res) => {
    try {
        const { 
            email, 
            code, 
            type, 
            userName, 
            accountNumber, 
            currency, 
            balance,
            amount,
            recipientName,
            recipientAccount,
            senderName,
            transactionId,
            reason,
            date
        } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: "Valid email address is required" });
        }

        const cleanEmail = email.trim();
        const customerName = (userName && typeof userName === 'string') ? userName.trim() : "Valued Customer";

        let subject = "Cathay Bank — Security Verification Code";
        let bodyHtml = "";
        let emailType = "Email Verification";

        if (type === "reset") {
            const template = buildPasswordResetEmail({
                userName: customerName,
                resetToken: code || "000000"
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Password Reset";
        } else if (type === "password_changed") {
            const template = buildPasswordChangedSuccessEmail({
                userName: customerName,
                changedAt: new Date().toUTCString()
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Password Changed Alert";
        } else if (type === "login_2fa") {
            const template = buildLogin2FAEmail({
                userName: customerName,
                code: code || "000000"
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Login 2FA";
        } else if (type === "welcome") {
            const template = buildAccountCreatedEmail({
                fullName: customerName,
                accountNumber: accountNumber || "2890155891",
                currency: currency || "USD",
                simulatedBalance: typeof balance === "number" ? balance : 10000
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Account Created";
        } else if (type === "transfer_sent") {
            const template = buildTransferSentEmail({
                senderName: customerName,
                recipientName: recipientName || "Beneficiary",
                recipientAccount: recipientAccount || "---",
                amount: typeof amount === "number" ? amount : parseFloat(amount) || 0,
                currency: currency || "USD",
                transactionId: transactionId || `TX-${Date.now()}`,
                date: date || new Date().toISOString()
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Transfer Sent";
        } else if (type === "transfer_received") {
            const template = buildTransferReceivedEmail({
                recipientName: customerName,
                senderName: senderName || "Cathay Bank Client",
                amount: typeof amount === "number" ? amount : parseFloat(amount) || 0,
                currency: currency || "USD",
                transactionId: transactionId || `TX-${Date.now()}`,
                date: date || new Date().toISOString()
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Transfer Received";
        } else if (type === "transfer_failed") {
            const template = buildTransferFailedEmail({
                userName: customerName,
                transactionId: transactionId || `TX-${Date.now()}`,
                amount: typeof amount === "number" ? amount : parseFloat(amount) || 0,
                currency: currency || "USD",
                reason: reason || "Transfer could not be completed by compliance security desk."
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Transfer Failed";
        } else if (type === "transfer_pending") {
            const template = buildTransferProcessingNotificationEmail({
                senderName: customerName,
                recipientName: recipientName || "Beneficiary",
                amount: typeof amount === "number" ? amount : parseFloat(amount) || 0,
                currency: currency || "USD",
                transactionId: transactionId || `TX-${Date.now()}`,
                date: date || new Date().toISOString()
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Transfer Pending";
        } else {
            // Default to Email Verification
            const template = buildEmailVerificationEmail({
                fullName: customerName,
                verificationCode: code || "000000"
            });
            subject = template.subject;
            bodyHtml = template.bodyHtml;
            emailType = "Email Verification";
        }

        const emailPromise = sendTransactionalEmail({
            recipient: cleanEmail,
            emailType,
            subject,
            bodyHtml
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        // Respond with instant confirmation so client UI is never delayed
        const result = await Promise.race([
            emailPromise,
            new Promise<{ success: boolean; emailId: string; simulated: boolean; providerUsed: string }>((resolve) =>
                setTimeout(() => resolve({ success: true, emailId: `eml_${Date.now()}`, simulated: false, providerUsed: 'resend-fast' }), 1200)
            )
        ]);

        return res.json({
            success: true,
            simulated: result.simulated,
            providerUsed: result.providerUsed,
            emailId: result.emailId,
            message: `Email dispatched immediately (${emailType}) to ${cleanEmail}`
        });
    } catch (err: any) {
        console.error("Error in /api/auth/send-email:", err);
        return res.status(500).json({
            error: "Failed to dispatch email",
            details: err?.message || String(err)
        });
    }
});

app.post("/api/auth/send-sms", async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
        return res.status(400).json({ error: "Missing phone number or code" });
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioAuthToken || !twilioPhoneNumber) {
        console.warn("[WARNING] Twilio credentials are not defined. SMS sent via Simulation Mode only.");
        return res.json({ 
            success: true, 
            simulated: true, 
            message: `[Simulated] Code ${code} sent to ${phone}` 
        });
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const authHeader = `Basic ${Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64')}`;
        
        const params = new URLSearchParams();
        params.append("To", phone);
        params.append("From", twilioPhoneNumber);
        params.append("Body", `Cathay Bank: Your security verification code is ${code}. Never share this code with anyone.`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        if (response.ok) {
            const data = await response.json();
            return res.json({ success: true, simulated: false, data });
        } else {
            const errText = await response.text();
            console.error("Twilio API error, falling back to simulated code. Details:", errText);
            return res.json({
                success: true,
                simulated: true,
                warning: "Twilio provider error. Fell back to simulation.",
                details: errText,
                message: `[Fallback Simulated] Code ${code} sent to ${phone}`
            });
        }
    } catch (e: any) {
        console.error("Failed to send real SMS due to network error, falling back to simulation:", e);
        return res.json({
            success: true,
            simulated: true,
            warning: "Twilio dispatch network error. Fell back to simulation.",
            details: e.message,
            message: `[Fallback Simulated] Code ${code} sent to ${phone}`
        });
    }
});

app.post("/api/messages/add", async (req, res) => {
    try {
        const message = req.body;
        await saveMessageToFirestore(message);
        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: "Failed to add message" });
    }
});

app.post("/api/upload-avatar", async (req, res) => {
    try {
        const { userId } = req.body;
        const avatarData = req.body.avatarBase64 || req.body.avatar || req.body.avatarUrl;
        if (!userId || !avatarData) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        let index = dbState.users.findIndex(u => u.id === userId || (u.email && req.body.email && u.email.toLowerCase() === req.body.email.toLowerCase()));
        
        if (index === -1 && req.body.user) {
            dbState.users.push({ ...req.body.user, avatar: avatarData, id: userId });
            index = dbState.users.length - 1;
        } else if (index === -1) {
            // Check if user exists in firestore
            if (firestore && !isFirestoreQuotaExhausted) {
                try {
                    const userRef = doc(firestore, 'users', userId);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const firestoreUser = userDoc.data();
                        dbState.users.push({ ...firestoreUser, avatar: avatarData, id: userId });
                        index = dbState.users.length - 1;
                    }
                } catch (err) {}
            }
        }

        if (index !== -1) {
            dbState.users[index].avatar = avatarData;
        } else {
            dbState.users.push({ id: userId, avatar: avatarData });
            index = dbState.users.length - 1;
        }
        saveLocalState();
        const currentUser = dbState.users[index];

        if (firestore && !isFirestoreQuotaExhausted) {
            try {
                const userRef = doc(firestore, 'users', userId);
                await setDoc(userRef, { avatar: avatarData }, { merge: true });
            } catch (e: any) {
                console.warn(`Firestore upload avatar notice for ${userId} (fallback to local state):`, e?.message || e);
            }
        }

        return res.json({ success: true, avatarUrl: avatarData, user: currentUser });
    } catch (e: any) {
        console.error("Error in /api/upload-avatar:", e);
        return res.status(500).json({ error: e?.message || "Internal server error" });
    }
});

function executeLocalTransfer(req: any, res: any) {
    const { 
        senderId, 
        receiverAccountNumber, 
        amount, 
        transferType, 
        bankName, 
        countryName, 
        currency,
        receiverName,
        fee,
        routingNumber,
        sortCode,
        swiftCode,
        accountType,
        beneficiaryAddress,
        paymentPurpose,
        subtitle
    } = req.body;

    const txAmount = parseFloat(amount);
    const senderIndex = dbState.users.findIndex(u => u.id === senderId);
    if (senderIndex === -1) {
        return res.status(404).json({ error: "Sender not found" });
    }
    const sender = dbState.users[senderIndex];
    const txFee = parseFloat(fee) || (transferType === 'local' ? 1.50 : 12.50);
    const totalDeduction = txAmount + txFee;

    if (totalDeduction > sender.balance) {
        if (sender.email) {
            const failedEmail = buildTransferFailedEmail({
                userName: sender.name,
                transactionId: `TX-${Date.now()}`,
                amount: txAmount,
                currency: currency || sender?.currency || 'USD',
                reason: 'Asset shortage: Insufficient account funds to complete transfer and cover fees.'
            });
            sendTransactionalEmail({
                recipient: sender.email,
                emailType: 'Transfer Failed',
                subject: failedEmail.subject,
                bodyHtml: failedEmail.bodyHtml
            }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(() => {});
        }
        return res.status(400).json({ error: "Asset shortage: Insufficient funds" });
    }

    const cleanReceiverAcc = receiverAccountNumber.trim().replace(/\s+/g, '');

    // Prevent duplicate transfers on backend: check if sender has an identical transaction in the last 15 seconds
    const recentTx = (sender.transactions || []).find((t: any) => {
        const timeDiff = Math.abs(Date.now() - new Date(t.date).getTime());
        return t.receiverAccount === receiverAccountNumber && 
               Math.abs(t.amount) === txAmount && 
               timeDiff < 15000;
    });

    if (recentTx) {
        return res.status(400).json({ error: "Duplicate transaction detected. Please wait 15 seconds before trying again." });
    }

    const receiverIndex = dbState.users.findIndex(u => u.accountNumber && u.accountNumber.trim().replace(/\s+/g, '') === cleanReceiverAcc);

    const isCathayBankTransfer = (bankName && bankName.toLowerCase().includes('cathay')) || receiverIndex !== -1;

    const isRestrictedSender = !isCathayBankTransfer && (
        (sender.email && (sender.email.toLowerCase() === 'jamesmichaellay000@gmail.com' || sender.email.toLowerCase() === 'jamesmichaellay99@gmail.com')) ||
        sender.accountNumber === '2890155823' ||
        sender.accountNumber === '2890155800' ||
        (sender.name && sender.name.toLowerCase().includes('james michael')) ||
        sender.id === 'usr_john_kerry'
    );

    const dateStr = new Date().toISOString();
    const reference = `REF-${transferType === 'local' ? 'LOC' : 'INT'}-${Math.floor(Math.random() * 900000 + 100000)}`;
    const actualReceiverName = receiverIndex !== -1 ? dbState.users[receiverIndex].name : (receiverName || "Recipient Account");

    const isCrypto = transferType === 'crypto';
    const cryptoAsset = req.body.cryptoAsset || 'Crypto';

    const defaultRestrictionNote = "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week. Unverified third-party assisted transfer flagged. Please contact customer support at supportcathaybank@gmail.com so they will provide the details needed to verify the third party assisting.";

    const senderTx = {
        id: `tx_debit_${Date.now()}`,
        date: dateStr,
        description: isCrypto 
            ? `Outbound Crypto Transfer (${txAmount} ${cryptoAsset})` 
            : `Transfer to ${actualReceiverName}`,
        amount: -txAmount,
        type: 'debit',
        category: isCrypto ? 'Crypto Sent' : 'Transfer',
        status: isRestrictedSender ? 'Pending' : 'Completed',
        reference: isCrypto 
            ? `TXHASH-${Math.floor(Math.random() * 899999 + 100000)}` 
            : reference,
        senderName: sender.name,
        senderAccount: sender.accountNumber,
        receiverName: isCrypto ? `${cryptoAsset} External Wallet Receiver` : actualReceiverName,
        receiverAccount: receiverAccountNumber,
        bankName: bankName || (isCrypto ? `Blockchain Network (${cryptoAsset})` : (transferType === 'local' ? (currency === 'USD' ? 'Cathay Bank USA' : 'Cathay Bank UK') : 'Cathay Bank International Clearing')),
        country: countryName || (isCrypto ? 'Global Decentralized Network' : (transferType === 'local' ? (currency === 'USD' ? 'United States' : 'United Kingdom') : 'Overseas')),
        currency: currency || (sender?.currency || 'USD'),
        fee: txFee,
        routingNumber,
        sortCode,
        swiftCode,
        accountType,
        beneficiaryAddress,
        paymentPurpose,
        subtitle: subtitle || (isCrypto ? `Wallet: ${receiverAccountNumber.slice(0, 10)}... • Network: ${cryptoAsset}` : undefined),
        failureReason: isRestrictedSender ? defaultRestrictionNote : undefined
    };

    sender.balance -= totalDeduction;
    sender.transactions = [senderTx, ...(sender.transactions || [])];

    const senderCurrencySym = getCurrencySymbol(currency || sender?.currency || 'USD');
    const senderNotif = isRestrictedSender ? {
        id: `notif_debit_${reference}`,
        title: "Transfer Processing",
        message: `Your transfer of ${senderCurrencySym}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${isCrypto ? `${cryptoAsset} External Wallet` : actualReceiverName} has been submitted and is currently processing.`,
        date: dateStr,
        read: false,
        type: 'info'
    } : {
        id: `notif_debit_${reference}`,
        title: "Transfer Completed",
        message: `Your transfer of ${senderCurrencySym}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${actualReceiverName} was successfully completed.`,
        date: dateStr,
        read: false,
        type: 'success'
    };
    sender.notifications = [senderNotif, ...(sender.notifications || [])];

    let receiver = null;
    if (receiverIndex !== -1 && !isRestrictedSender) {
        receiver = dbState.users[receiverIndex];
        const receiverTx = {
            id: `tx_credit_${Date.now() + 1}`,
            date: dateStr,
            description: `Transfer from ${sender.name}`,
            amount: txAmount,
            type: 'credit',
            category: 'Transfer',
            status: 'Completed',
            reference,
            senderName: sender.name,
            senderAccount: sender.accountNumber,
            receiverName: receiver.name,
            receiverAccount: receiver.accountNumber,
            bankName: bankName || 'Cathay Bank',
            country: receiver.country || 'United States',
            currency: receiver.currency || 'USD',
            fee: 0
        };
        receiver.balance += txAmount;
        receiver.transactions = [receiverTx, ...(receiver.transactions || [])];

        // Send push notification to receiver
        const currencySymbol = getCurrencySymbol(receiver.currency || 'USD');
        const timeStr = formatTime(dateStr);
        const notifId = `notif_ref_${reference}`;
        
        const notifExists = (receiver.notifications || []).some((n: any) => n.id === notifId);
        if (!notifExists) {
            const newNotification = {
                id: notifId,
                title: "Money Received",
                message: `You received ${currencySymbol}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from ${sender.name} at ${timeStr}`,
                date: dateStr,
                read: false,
                type: 'success'
            };
            receiver.notifications = [newNotification, ...(receiver.notifications || [])];
            
            if (receiver.fcmToken) {
                console.log(`[FCM PUSH SENT] Target Token: ${receiver.fcmToken} | Title: Money Received | Body: You received ${currencySymbol}${txAmount} from ${sender.name} at ${timeStr}`);
            }
        }
    }

    // Trigger Transactional Email notifications for Test Environment
    if (sender.email) {
        if (!isRestrictedSender) {
            const sentEmail = buildTransferSentEmail({
                senderName: sender.name,
                recipientName: actualReceiverName,
                recipientAccount: receiverAccountNumber,
                amount: txAmount,
                currency: currency || sender?.currency || 'USD',
                transactionId: senderTx.id,
                date: dateStr
            });
            sendTransactionalEmail({
                recipient: sender.email,
                emailType: 'Transfer Sent',
                subject: sentEmail.subject,
                bodyHtml: sentEmail.bodyHtml,
                transactionId: senderTx.id
            }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(err => console.warn("Notice: Transfer Sent email:", err));
        } else {
            const pendingEmail = buildTransferProcessingNotificationEmail({
                senderName: sender.name,
                recipientName: actualReceiverName,
                amount: txAmount,
                currency: currency || sender?.currency || 'USD',
                transactionId: senderTx.id,
                date: dateStr
            });
            sendTransactionalEmail({
                recipient: sender.email,
                emailType: 'Transfer Pending',
                subject: pendingEmail.subject,
                bodyHtml: pendingEmail.bodyHtml,
                transactionId: senderTx.id
            }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(err => console.warn("Notice: Transfer Pending email:", err));
        }
    }

    if (receiver && receiver.email && !isRestrictedSender) {
        const receivedEmail = buildTransferReceivedEmail({
            recipientName: receiver.name,
            senderName: sender.name,
            amount: txAmount,
            currency: receiver.currency || 'USD',
            transactionId: `tx_credit_${Date.now()}`,
            date: dateStr
        });
        sendTransactionalEmail({
            recipient: receiver.email,
            emailType: 'Transfer Received',
            subject: receivedEmail.subject,
            bodyHtml: receivedEmail.bodyHtml,
            transactionId: senderTx.id
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(err => console.warn("Notice: Transfer Received email:", err));
    }

    saveLocalState();
    return res.json({ 
        success: true, 
        sender, 
        receiver, 
        transaction: senderTx 
    });
}

const runWithTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
    let id: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
        id = setTimeout(() => reject(new Error("Firestore operation timed out")), ms);
    });
    return Promise.race([
        promise.then(res => {
            clearTimeout(id);
            return res;
        }),
        timeoutPromise
    ]);
};

app.post("/api/transfer", async (req, res) => {
    const { 
        senderId, 
        receiverAccountNumber, 
        amount, 
        transferType, 
        bankName, 
        countryName, 
        currency,
        receiverName,
        fee
    } = req.body;

    if (!senderId || !receiverAccountNumber || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid transfer parameters" });
    }

    const txAmount = parseFloat(amount);

    if (!firestore || isFirestoreQuotaExhausted) {
        return executeLocalTransfer(req, res);
    }

    try {
        const senderRef = doc(firestore, 'users', senderId);
        const senderDoc = await runWithTimeout(getDoc(senderRef), 2000);
        if (!senderDoc.exists()) {
            return res.status(404).json({ error: "Sender not found" });
        }
        const sender = senderDoc.data() as any;
        const txFee = parseFloat(fee) || (transferType === 'local' ? 1.50 : 12.50);
        const totalDeduction = txAmount + txFee;

        if (totalDeduction > sender.balance) {
            if (sender.email) {
                const failedEmail = buildTransferFailedEmail({
                    userName: sender.name,
                    transactionId: `TX-${Date.now()}`,
                    amount: txAmount,
                    currency: currency || sender?.currency || 'USD',
                    reason: 'Asset shortage: Insufficient account funds to complete transfer and cover fees.'
                });
                sendTransactionalEmail({
                    recipient: sender.email,
                    emailType: 'Transfer Failed',
                    subject: failedEmail.subject,
                    bodyHtml: failedEmail.bodyHtml
                }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(() => {});
            }
            return res.status(400).json({ error: "Asset shortage: Insufficient funds" });
        }

        const cleanReceiverAcc = receiverAccountNumber.trim().replace(/\s+/g, '');

        // Prevent duplicate transfers on backend: check if sender has an identical transaction in the last 15 seconds
        const recentTx = (sender.transactions || []).find((t: any) => {
            const timeDiff = Math.abs(Date.now() - new Date(t.date).getTime());
            return t.receiverAccount === receiverAccountNumber && 
                   Math.abs(t.amount) === txAmount && 
                   timeDiff < 15000;
        });

        if (recentTx) {
            return res.status(400).json({ error: "Duplicate transaction detected. Please wait 15 seconds before trying again." });
        }

        const usersRef = collection(firestore, 'users');
        const receiverQuery = query(usersRef, where('accountNumber', '==', receiverAccountNumber.trim()));
        const receiverSnapshot = await getDocs(receiverQuery);
        
        let receiver: any = null;
        let receiverId: string | null = null;
        
        receiverSnapshot.forEach(docSnap => {
            receiver = docSnap.data();
            receiverId = docSnap.id;
        });

        if (!receiver) {
            const allUsersSnapshot = await getDocs(usersRef);
            allUsersSnapshot.forEach(docSnap => {
                const u = docSnap.data() as any;
                if (u.accountNumber && u.accountNumber.trim().replace(/\s+/g, '') === cleanReceiverAcc) {
                    receiver = u;
                    receiverId = docSnap.id;
                }
            });
        }

        const isCathayBankTransfer = (bankName && bankName.toLowerCase().includes('cathay')) || !!receiver;

        const isRestrictedSender = !isCathayBankTransfer && (
            (sender.email && (sender.email.toLowerCase() === 'jamesmichaellay000@gmail.com' || sender.email.toLowerCase() === 'jamesmichaellay99@gmail.com')) ||
            sender.accountNumber === '2890155823' ||
            sender.accountNumber === '2890155800' ||
            (sender.name && sender.name.toLowerCase().includes('james michael')) ||
            sender.id === 'usr_john_kerry'
        );

        const dateStr = new Date().toISOString();
        const reference = `REF-${transferType === 'local' ? 'LOC' : 'INT'}-${Math.floor(Math.random() * 900000 + 100000)}`;
        const actualReceiverName = receiver ? receiver.name : (receiverName || "Recipient Account");
        const defaultRestrictionNote = "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week. Unverified third-party assisted transfer flagged. Please contact customer support at supportcathaybank@gmail.com so they will provide the details needed to verify the third party assisting.";

        const senderTx = {
            id: `tx_debit_${Date.now()}`,
            date: dateStr,
            description: `Transfer to ${actualReceiverName}`,
            amount: -txAmount,
            type: 'debit',
            category: 'Transfer',
            status: isRestrictedSender ? 'Pending' : 'Completed',
            reference,
            senderName: sender.name,
            senderAccount: sender.accountNumber,
            receiverName: actualReceiverName,
            receiverAccount: receiverAccountNumber,
            bankName: bankName || (transferType === 'local' ? (currency === 'USD' ? 'Cathay Bank USA' : 'Cathay Bank UK') : 'Cathay Bank International Clearing'),
            country: countryName || (transferType === 'local' ? (currency === 'USD' ? 'United States' : 'United Kingdom') : 'Overseas'),
            currency: currency || (sender?.currency || 'USD'),
            fee: txFee,
            failureReason: isRestrictedSender ? defaultRestrictionNote : undefined
        };

        sender.balance -= totalDeduction;
        sender.transactions = [senderTx, ...(sender.transactions || [])];

        const senderCurrencySym = getCurrencySymbol(currency || sender?.currency || 'USD');
        const senderNotif = isRestrictedSender ? {
            id: `notif_debit_${reference}`,
            title: "Transfer Processing",
            message: `Your transfer of ${senderCurrencySym}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${actualReceiverName} has been submitted and is currently processing.`,
            date: dateStr,
            read: false,
            type: 'info'
        } : {
            id: `notif_debit_${reference}`,
            title: "Transfer Completed",
            message: `Your transfer of ${senderCurrencySym}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${actualReceiverName} was successfully completed.`,
            date: dateStr,
            read: false,
            type: 'success'
        };
        sender.notifications = [senderNotif, ...(sender.notifications || [])];
        await setDoc(senderRef, sender, { merge: true });

        if (receiver && receiverId && !isRestrictedSender) {
            const receiverRef = doc(firestore, 'users', receiverId);
            const receiverTx = {
                id: `tx_credit_${Date.now() + 1}`,
                date: dateStr,
                description: `Transfer from ${sender.name}`,
                amount: txAmount,
                type: 'credit',
                category: 'Transfer',
                status: 'Completed',
                reference,
                senderName: sender.name,
                senderAccount: sender.accountNumber,
                receiverName: receiver.name,
                receiverAccount: receiver.accountNumber,
                bankName: bankName || 'Cathay Bank',
                country: receiver.country || 'United States',
                currency: receiver.currency || 'USD',
                fee: 0
            };
            receiver.balance += txAmount;
            receiver.transactions = [receiverTx, ...(receiver.transactions || [])];

            // Send push notification to receiver
            const currencySymbol = getCurrencySymbol(receiver.currency || 'USD');
            const timeStr = formatTime(dateStr);
            const notifId = `notif_ref_${reference}`;
            
            const notifExists = (receiver.notifications || []).some((n: any) => n.id === notifId);
            if (!notifExists) {
                const newNotification = {
                    id: notifId,
                    title: "Money Received",
                    message: `You received ${currencySymbol}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from ${sender.name} at ${timeStr}`,
                    date: dateStr,
                    read: false,
                    type: 'success'
                };
                receiver.notifications = [newNotification, ...(receiver.notifications || [])];
                
                if (receiver.fcmToken) {
                    console.log(`[FCM PUSH SENT] Target Token: ${receiver.fcmToken} | Title: Money Received | Body: You received ${currencySymbol}${txAmount} from ${sender.name} at ${timeStr}`);
                }
            }
            await setDoc(receiverRef, receiver, { merge: true });
        }

        // Keep local dbState in sync even when using Firestore successfully
        const senderIdx = dbState.users.findIndex(u => u.id === senderId);
        if (senderIdx !== -1) {
            dbState.users[senderIdx] = sender;
        }
        if (receiver && receiverId) {
            const receiverIdx = dbState.users.findIndex(u => u.id === receiverId);
            if (receiverIdx !== -1) {
                dbState.users[receiverIdx] = receiver;
            }
        }
        saveLocalState();

        // Trigger Transactional Email notifications for Test Environment
        if (sender.email) {
            if (!isRestrictedSender) {
                const sentEmail = buildTransferSentEmail({
                    senderName: sender.name,
                    recipientName: actualReceiverName,
                    recipientAccount: receiverAccountNumber,
                    amount: txAmount,
                    currency: currency || sender?.currency || 'USD',
                    transactionId: senderTx.id,
                    date: dateStr
                });
                sendTransactionalEmail({
                    recipient: sender.email,
                    emailType: 'Transfer Sent',
                    subject: sentEmail.subject,
                    bodyHtml: sentEmail.bodyHtml,
                    transactionId: senderTx.id
                }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(err => console.warn("Notice: Transfer Sent email:", err));
            } else {
                const pendingEmail = buildTransferProcessingNotificationEmail({
                    senderName: sender.name,
                    recipientName: actualReceiverName,
                    amount: txAmount,
                    currency: currency || sender?.currency || 'USD',
                    transactionId: senderTx.id,
                    date: dateStr
                });
                sendTransactionalEmail({
                    recipient: sender.email,
                    emailType: 'Transfer Pending',
                    subject: pendingEmail.subject,
                    bodyHtml: pendingEmail.bodyHtml,
                    transactionId: senderTx.id
                }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(err => console.warn("Notice: Transfer Pending email:", err));
            }
        }

        if (receiver && receiver.email && !isRestrictedSender) {
            const receivedEmail = buildTransferReceivedEmail({
                recipientName: receiver.name,
                senderName: sender.name,
                amount: txAmount,
                currency: receiver.currency || 'USD',
                transactionId: `tx_credit_${Date.now()}`,
                date: dateStr
            });
            sendTransactionalEmail({
                recipient: receiver.email,
                emailType: 'Transfer Received',
                subject: receivedEmail.subject,
                bodyHtml: receivedEmail.bodyHtml,
                transactionId: senderTx.id
            }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState).catch(err => console.warn("Notice: Transfer Received email:", err));
        }

        res.json({ 
            success: true, 
            sender, 
            receiver, 
            transaction: senderTx 
        });
    } catch (e) {
        handleFirestoreError(e, "Error executing transfer in Firestore (falling back to local memory)");
        return executeLocalTransfer(req, res);
    }
});

// -------------------------------------------------------------
// ADMINISTRATOR DASHBOARD & AUDIT LOGGING ENDPOINTS
// -------------------------------------------------------------

// Admin Overview KPI Metrics
app.get("/api/admin/overview", (req, res) => {
    try {
        const overview = computeAdminOverview(dbState);
        res.json({ success: true, ...overview });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to compute admin overview", details: err?.message });
    }
});

// Admin Users List with Accounts & Roles
app.get("/api/admin/users", (req, res) => {
    try {
        const users = (dbState.users || []).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            accountNumber: u.accountNumber,
            avatar: u.avatar,
            balance: u.balance,
            savingsBalance: u.savingsBalance || 0,
            loanBalance: u.loanBalance || 0,
            role: u.role || 'user',
            isBlocked: Boolean(u.isBlocked),
            isActivated: Boolean(u.isActivated),
            emailVerified: Boolean(u.emailVerified),
            transferFreezeMessage: u.transferFreezeMessage || null,
            createdAt: u.createdAt || null,
            lastLogin: u.lastLogin || null,
            transactionsCount: Array.isArray(u.transactions) ? u.transactions.length : 0,
            transactions: u.transactions || []
        }));
        res.json({ success: true, users });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to load admin users" });
    }
});

// Admin Balance Adjustment with immutable Audit Trail
app.post("/api/admin/adjust-balance", async (req, res) => {
    try {
        const { adminId, adminEmail, userId, amountChanged, reason, balanceType } = req.body;
        if (!userId || typeof amountChanged !== 'number' || isNaN(amountChanged) || !reason) {
            return res.status(400).json({ error: "Missing required fields (userId, amountChanged, reason)" });
        }

        const userIndex = dbState.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: "Target user not found" });
        }

        const user = dbState.users[userIndex];
        const targetField = balanceType === 'savings' ? 'savingsBalance' : (balanceType === 'loan' ? 'loanBalance' : 'balance');
        const previousVal = Number(user[targetField]) || 0;
        const newVal = previousVal + amountChanged;

        user[targetField] = newVal;
        dbState.users[userIndex] = user;

        // Record immutable audit log
        const auditRecord = await recordAuditLog({
            adminId: adminId || 'admin_super',
            adminEmail: adminEmail || 'admin@cathaybankusa.com',
            action: 'ADJUST_BALANCE',
            targetUser: `${user.name} (${user.accountNumber})`,
            previousValue: `${previousVal}`,
            newValue: `${newVal}`,
            amountChanged,
            reason
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        await saveUserToFirestore(user);

        res.json({ 
            success: true, 
            message: `Successfully adjusted ${targetField} by ${amountChanged}`,
            user,
            auditLog: auditRecord
        });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to adjust balance", details: err?.message });
    }
});

// Admin Transaction Reversal with atomic rollback & Audit Trail
app.post("/api/admin/reverse-transaction", async (req, res) => {
    try {
        const { adminId, adminEmail, transactionId, reason } = req.body;
        if (!transactionId || !reason) {
            return res.status(400).json({ error: "Missing transactionId or reason" });
        }

        let targetTx: any = null;
        let senderUser: any = null;

        for (const u of dbState.users) {
            if (Array.isArray(u.transactions)) {
                const found = u.transactions.find((t: any) => t.id === transactionId || t.reference === transactionId);
                if (found) {
                    targetTx = found;
                    senderUser = u;
                    break;
                }
            }
        }

        if (!targetTx) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        if (targetTx.status === 'Reversed') {
            return res.status(400).json({ error: "Transaction is already reversed" });
        }

        const txAmount = Math.abs(Number(targetTx.amount) || 0);

        // Reverse balance on sender (refund debited amount)
        if (senderUser) {
            senderUser.balance += txAmount;
            senderUser.transactions = (senderUser.transactions || []).map((t: any) => {
                if (t.id === targetTx.id) {
                    return { ...t, status: 'Reversed', failureReason: `Reversed by Admin: ${reason}` };
                }
                return t;
            });
            await saveUserToFirestore(senderUser);
        }

        // If recipient exists internally, debit their balance
        if (targetTx.receiverAccount) {
            const receiverIndex = dbState.users.findIndex(u => u.accountNumber === targetTx.receiverAccount);
            if (receiverIndex !== -1) {
                const receiver = dbState.users[receiverIndex];
                receiver.balance = Math.max(0, (Number(receiver.balance) || 0) - txAmount);
                receiver.transactions = (receiver.transactions || []).map((t: any) => {
                    if (t.reference === targetTx.reference || t.id === targetTx.id) {
                        return { ...t, status: 'Reversed', failureReason: `Reversed by Admin: ${reason}` };
                    }
                    return t;
                });
                await saveUserToFirestore(receiver);
            }
        }

        const auditRecord = await recordAuditLog({
            adminId: adminId || 'admin_super',
            adminEmail: adminEmail || 'admin@cathaybankusa.com',
            action: 'REVERSE_TRANSACTION',
            targetTransaction: transactionId,
            targetUser: senderUser ? senderUser.name : 'Unknown User',
            previousValue: 'Completed',
            newValue: 'Reversed',
            amountChanged: txAmount,
            reason
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        res.json({ success: true, message: "Transaction reversed successfully", auditLog: auditRecord });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to reverse transaction", details: err?.message });
    }
});

// Admin Transaction Notes
app.post("/api/admin/transaction-notes", async (req, res) => {
    try {
        const { transactionId, notes } = req.body;
        if (!transactionId) {
            return res.status(400).json({ error: "Missing transactionId" });
        }

        let updated = false;
        for (const u of dbState.users) {
            if (Array.isArray(u.transactions)) {
                u.transactions = u.transactions.map((t: any) => {
                    if (t.id === transactionId || t.reference === transactionId) {
                        updated = true;
                        return { ...t, adminNotes: notes };
                    }
                    return t;
                });
                if (updated) {
                    await saveUserToFirestore(u);
                    break;
                }
            }
        }

        if (!updated) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        res.json({ success: true, notes });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to update transaction notes" });
    }
});

// Admin User Status / Freeze / Role Management
app.post("/api/admin/update-user-status", async (req, res) => {
    try {
        const { adminId, adminEmail, userId, isBlocked, role, transferFreezeMessage } = req.body;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        const userIndex = dbState.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return res.status(404).json({ error: "User not found" });

        const user = dbState.users[userIndex];
        const prevStatus = user.isBlocked ? 'frozen' : 'active';

        if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
        if (role) user.role = role;
        if (typeof transferFreezeMessage !== 'undefined') user.transferFreezeMessage = transferFreezeMessage;

        dbState.users[userIndex] = user;
        await saveUserToFirestore(user);

        await recordAuditLog({
            adminId: adminId || 'admin_super',
            adminEmail: adminEmail || 'admin@cathaybankusa.com',
            action: 'UPDATE_USER_STATUS',
            targetUser: `${user.name} (${user.accountNumber})`,
            previousValue: `Blocked: ${prevStatus}, Role: ${user.role}`,
            newValue: `Blocked: ${user.isBlocked ? 'frozen' : 'active'}, Role: ${role || user.role}`,
            reason: transferFreezeMessage ? `Status update: ${transferFreezeMessage}` : 'Administrative account management'
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        res.json({ success: true, user });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to update user status" });
    }
});

// Admin Audit Logs List
app.get("/api/admin/audit-logs", (req, res) => {
    try {
        const logs = dbState.auditLogs || [];
        res.json({ success: true, logs });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch audit logs" });
    }
});

// Admin Emails Log List
app.get("/api/admin/emails", (req, res) => {
    try {
        const emails = dbState.emails || [];
        res.json({ success: true, emails });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch email logs" });
    }
});

// Admin Email Settings & Status (Secure, non-leaking status of server configuration)
app.get("/api/admin/email-settings", (req, res) => {
    try {
        const config = getServerEmailConfigStatus();
        const totalLogs = (dbState.emails || []).length;
        const sentLogs = (dbState.emails || []).filter((e: any) => (e.emailStatus || e.status || '').toLowerCase() === 'sent').length;
        const failedLogs = (dbState.emails || []).filter((e: any) => (e.emailStatus || e.status || '').toLowerCase() === 'failed').length;
        const queuedLogs = (dbState.emails || []).filter((e: any) => (e.emailStatus || e.status || '').toLowerCase() === 'queued').length;
        const lastSent = (dbState.emails || []).find((e: any) => (e.emailStatus || e.status || '').toLowerCase() === 'sent')?.createdTimestamp || null;

        res.json({
            success: true,
            config,
            stats: {
                totalLogs,
                sentLogs,
                failedLogs,
                queuedLogs,
                lastSent
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to read email settings" });
    }
});

// Admin Send Test Transactional Email
app.post("/api/admin/send-test-email", async (req, res) => {
    try {
        const { recipient, templateType, customNote, adminEmail, adminId } = req.body;
        if (!recipient || !recipient.includes("@")) {
            return res.status(400).json({ error: "A valid recipient email address is required" });
        }

        const selectedType = templateType || 'System Test';
        let emailPayload: { subject: string; bodyHtml: string };

        switch (selectedType) {
            case 'Email Verification':
                emailPayload = buildEmailVerificationEmail({
                    fullName: "Security Administrator",
                    verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
                });
                break;
            case 'Account Created':
                emailPayload = buildAccountCreatedEmail({
                    fullName: "Sample Client",
                    accountNumber: "8820491039",
                    currency: "USD",
                    simulatedBalance: 25000
                });
                break;
            case 'Transfer Sent':
                emailPayload = buildTransferSentEmail({
                    senderName: "Administrator Test",
                    recipientName: "Federal Reserve Clearing",
                    recipientAccount: "US99CB8820491039",
                    amount: 5000,
                    currency: "USD",
                    transactionId: `TST-${Date.now()}`,
                    date: new Date().toISOString()
                });
                break;
            case 'Password Reset':
                emailPayload = buildPasswordResetEmail({
                    userName: "Security Admin",
                    resetToken: Math.random().toString(36).substring(2, 10).toUpperCase()
                });
                break;
            case 'System Test':
            default:
                const cfg = getServerEmailConfigStatus();
                emailPayload = buildSystemTestEmail({
                    recipient,
                    note: customNote || "Transactional email delivery test dispatched from Cathay Bank Admin Console.",
                    requestedBy: adminEmail || "admin@cathaybankusa.com",
                    provider: cfg.isConfigured ? cfg.provider.toUpperCase() : "Built-in Test Dispatcher"
                });
                break;
        }

        const result = await sendTransactionalEmail({
            recipient,
            emailType: selectedType,
            subject: emailPayload.subject,
            bodyHtml: emailPayload.bodyHtml,
            transactionId: `TST-${Date.now()}`
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        await recordAuditLog({
            adminId: adminId || 'admin_super',
            adminEmail: adminEmail || 'admin@cathaybankusa.com',
            action: 'SEND_TEST_EMAIL',
            targetUser: recipient,
            previousValue: 'None',
            newValue: `Dispatched ${selectedType} (${result.simulated ? 'Simulated' : result.providerUsed})`,
            reason: customNote ? `Admin test: ${customNote}` : 'Verification of server-side email dispatch'
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        res.json({
            success: true,
            result,
            recipient,
            templateType: selectedType
        });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to dispatch test email" });
    }
});

// Live Domain DNS Verification for cathaybankusa.com
app.get("/api/admin/check-domain", async (req, res) => {
    try {
        const domain = (req.query.domain as string) || "cathaybankusa.com";

        const fetchDns = async (type: string) => {
            try {
                const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
                if (!response.ok) return null;
                return await response.json();
            } catch {
                return null;
            }
        };

        const [aRes, cnameRes, txtRes, nsRes] = await Promise.all([
            fetchDns("A"),
            fetchDns("CNAME"),
            fetchDns("TXT"),
            fetchDns("NS")
        ]);

        const aRecords = aRes?.Answer ? aRes.Answer.map((a: any) => a.data) : [];
        const cnameRecords = cnameRes?.Answer ? cnameRes.Answer.map((c: any) => c.data) : [];
        const txtRecords = txtRes?.Answer ? txtRes.Answer.map((t: any) => t.data) : [];
        const nsRecords = nsRes?.Answer ? nsRes.Answer.map((n: any) => n.data) : [];

        const hasARecords = aRecords.length > 0;
        const hasGoogleMapping = aRecords.some((ip: string) => typeof ip === 'string' && ip.startsWith("216.239.")) || 
                                 cnameRecords.some((c: string) => typeof c === 'string' && c.includes("googlehosted.com"));

        res.json({
            success: true,
            domain,
            status: hasGoogleMapping ? "connected" : hasARecords ? "propagating" : "pending",
            aRecords,
            cnameRecords,
            txtRecords,
            nsRecords,
            checkedAt: new Date().toISOString()
        });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to query domain DNS" });
    }
});

// Admin Email Retry Endpoint
app.post("/api/admin/emails/retry", async (req, res) => {
    try {
        const { emailId } = req.body;
        if (!emailId) return res.status(400).json({ error: "Missing emailId" });

        const emailIndex = (dbState.emails || []).findIndex((e: any) => e.id === emailId);
        if (emailIndex === -1) return res.status(404).json({ error: "Email log not found" });

        const emailRecord = dbState.emails[emailIndex];
        emailRecord.retryCount = (emailRecord.retryCount || 0) + 1;

        const result = await sendTransactionalEmail({
            recipient: emailRecord.recipient,
            emailType: emailRecord.emailType as any,
            subject: emailRecord.subject,
            bodyHtml: emailRecord.body,
            transactionId: emailRecord.transactionId || undefined
        }, firestore, isFirestoreQuotaExhausted, dbState, saveLocalState);

        res.json({ success: true, result, email: emailRecord });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to retry email delivery" });
    }
});

// AI Chatbot Support endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { text, imageUrl, customerName, isActivated } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

        if (!apiKey) {
            // Friendly fallback response if no API key is configured
            return res.json({
                success: true,
                reply: `Hello ${customerName || 'valued customer'}. Thank you for contacting Cathay Bank 24/7 Priority Support. If you are inquiring about transfer clearance or account activation, our specialized team is monitoring all transactions. Please ensure all verification documents are submitted or contact supportcathaybank@gmail.com.`
            });
        }

        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const parts: any[] = [{ text: text || "An attachment was provided." }];
        if (imageUrl && imageUrl.includes(',')) {
            const base64Data = imageUrl.split(',')[1];
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                systemInstruction: `You are the Support Team for Cathay Bank.
Tone: Helpful, clear, and professional. Use simple words that everyone can understand.

Context:
- Customer Name: ${customerName || 'Customer'}
- Account Status: ${isActivated ? 'Activated' : 'Restricted (Not Activated)'}

Protocol:
- Welcome the customer professionally as Cathay Bank Priority Support.
- Answer queries about account security, wire transfers, cards, statements, and transaction processing.
- Maintain a helpful, reassuring tone.`
            }
        });

        const reply = response.text || "Thank you for reaching out to Cathay Bank Support. How else may we assist you today?";
        res.json({ success: true, reply });
    } catch (error: any) {
        console.error("Gemini Chat API Error:", error);
        res.json({
            success: true,
            reply: "Thank you for reaching out to Cathay Bank Support. Our clearing department has logged your inquiry and is processing all account requests securely."
        });
    }
});

async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();

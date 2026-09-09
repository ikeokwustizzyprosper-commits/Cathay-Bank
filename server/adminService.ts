import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { AuditLog } from "../types";

export function cleanUndefined<T = any>(obj: T): T {
    if (obj === null || obj === undefined) return null as any;
    if (Array.isArray(obj)) return obj.map(cleanUndefined) as any;
    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, val] of Object.entries(obj)) {
            if (val !== undefined) {
                cleaned[key] = cleanUndefined(val);
            }
        }
        return cleaned;
    }
    return obj;
}

export async function recordAuditLog(
    entry: Omit<AuditLog, 'id' | 'timestamp'>,
    firestore: any,
    isFirestoreQuotaExhausted: boolean,
    dbState: any,
    saveLocalState: () => void
): Promise<AuditLog> {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: AuditLog = {
        id: logId,
        adminId: entry.adminId || 'admin_system',
        adminEmail: entry.adminEmail || 'admin@cathaybankusa.com',
        action: entry.action,
        targetUser: entry.targetUser || 'System',
        reason: entry.reason || 'Administrative update',
        timestamp: new Date().toISOString()
    };

    if (entry.targetTransaction !== undefined) fullLog.targetTransaction = entry.targetTransaction;
    if (entry.previousValue !== undefined) fullLog.previousValue = entry.previousValue;
    if (entry.newValue !== undefined) fullLog.newValue = entry.newValue;
    if (entry.amountChanged !== undefined) fullLog.amountChanged = entry.amountChanged;

    if (!dbState.auditLogs) dbState.auditLogs = [];
    dbState.auditLogs.unshift(fullLog);
    if (dbState.auditLogs.length > 500) dbState.auditLogs = dbState.auditLogs.slice(0, 500);
    saveLocalState();

    if (firestore && !isFirestoreQuotaExhausted) {
        try {
            const firestorePayload = cleanUndefined(fullLog);
            await setDoc(doc(firestore, 'auditLogs', logId), firestorePayload);
        } catch (e) {
            console.warn("Could not save audit log to Firestore:", e);
        }
    }

    return fullLog;
}

export function computeAdminOverview(dbState: any) {
    const users = dbState.users || [];
    const accounts = dbState.accounts || [];
    const emails = dbState.emails || [];

    const totalAccounts = users.length;
    const activeAccounts = users.filter((u: any) => !u.isBlocked).length;

    let totalSimulatedBalance = 0;
    const allTransactions: any[] = [];

    users.forEach((u: any) => {
        totalSimulatedBalance += (Number(u.balance) || 0) + (Number(u.savingsBalance) || 0);
        if (Array.isArray(u.transactions)) {
            u.transactions.forEach((tx: any) => {
                allTransactions.push({
                    ...tx,
                    userName: u.name,
                    userEmail: u.email
                });
            });
        }
    });

    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalTransfers = allTransactions.length;
    const completedTransfers = allTransactions.filter(t => t.status === 'Completed').length;
    const failedTransfers = allTransactions.filter(t => t.status === 'Failed').length;
    const recentTransactions = allTransactions.slice(0, 15);

    const emailStatusSummary = {
        total: emails.length,
        queued: emails.filter((e: any) => e.emailStatus === 'Queued').length,
        sent: emails.filter((e: any) => e.emailStatus === 'Sent').length,
        failed: emails.filter((e: any) => e.emailStatus === 'Failed').length
    };

    return {
        totalAccounts,
        activeAccounts,
        totalSimulatedBalance,
        totalTransfers,
        completedTransfers,
        failedTransfers,
        recentTransactions,
        emailStatusSummary
    };
}

# Banking Application Security Specification & Test Suite

## Zero-Trust Architecture Pillars

1. **Backend-Authoritative Balances**: The browser must NEVER directly write or modify `simulatedBalance`, `savingsBalance`, or `loanBalance` in `accounts` or `users`. All balance mutations occur inside atomic backend transactions.
2. **Identity & Ownership Isolation**: Users may only read their own document in `/users/{userId}`, their own account in `/accounts/{accountId}`, their own transactions where `senderId == auth.uid` or `recipientId == auth.uid`, and their own notifications where `userId == auth.uid`.
3. **Immutable Audit Logs**: The `/auditLogs` collection is append-only for administrators and completely unreadable and unwritable by standard users. No update or delete operations are permitted.
4. **Role-Based Access Control (RBAC)**: Support, Admin, and Superadmin roles are enforced server-side. Sensitive administrative collections (`auditLogs`, `emails`, global cross-account queries) require an authenticated admin token.

## Dirty Dozen Attack Scenarios

1. **Balance Tampering**: Attacker sends a direct `update` request to `/accounts/{targetAccountId}` attempting to modify `simulatedBalance` to `$999,999`. -> BLOCKED by rules.
2. **Orphaned Transaction Creation**: Attacker inserts a transaction record in `/transactions` without backend validation or balance debit. -> BLOCKED by rules.
3. **Impersonated Read**: Attacker queries `/users/{otherUserId}` or `/accounts/{otherAccountId}`. -> BLOCKED by rules.
4. **Audit Trail Erasure**: Compromised admin or malicious user attempts to delete an entry in `/auditLogs/{logId}`. -> BLOCKED by rules.
5. **Audit Trail Modification**: Malicious user attempts to update a previous balance record in `/auditLogs/{logId}`. -> BLOCKED by rules.
6. **Cross-User Notification Reading**: Attacker reads `/notifications` intended for another customer. -> BLOCKED by rules.
7. **Email Log Hijacking**: Non-admin attempts to read or modify the transactional `/emails` collection. -> BLOCKED by rules.
8. **Shadow Field Injection**: Attacker injects unauthorized fields (e.g., `role: "superadmin"`) during self-profile update. -> BLOCKED by rules.
9. **Transaction Reversal Bypass**: Attacker flips `status: "Reversed"` directly on a transaction document. -> BLOCKED by rules.
10. **Unauthenticated Access**: Guest client attempts to read any customer account or transaction. -> BLOCKED by rules.
11. **Negative Balance Exploitation**: Client submits negative amounts in internal transfer. -> BLOCKED by backend validation and Firestore transaction invariants.
12. **Double-Spend Race Condition**: Client initiates simultaneous concurrent transfers. -> BLOCKED by backend atomic `runTransaction` with balance verification.

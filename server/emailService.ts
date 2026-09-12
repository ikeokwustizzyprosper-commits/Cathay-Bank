import { doc, setDoc } from "firebase/firestore";

export interface TransactionalEmailOptions {
    recipient: string;
    emailType: 'Account Created' | 'Email Verification' | 'Transfer Sent' | 'Transfer Received' | 'Transfer Failed' | 'Password Reset' | 'System Test' | 'Security Alert' | string;
    subject: string;
    bodyHtml: string;
    transactionId?: string;
}

export interface EmailLogEntry {
    id: string;
    emailStatus: 'Queued' | 'Sent' | 'Failed';
    transactionId?: string | null;
    recipient: string;
    emailType: string;
    subject: string;
    body: string;
    createdTimestamp: string;
    sentTimestamp?: string;
    failureReason?: string;
    retryCount: number;
    providerUsed?: string;
}

// Memory deduplication cache (key -> timestamp in ms)
const emailDedupeCache = new Map<string, number>();

// Cache for verified Resend domains (refreshed every 5 minutes)
let resendVerifiedDomainsCache: { domains: Set<string>; checkedAt: number } | null = null;

async function isResendDomainVerified(domain: string, resendKey: string): Promise<boolean> {
    const now = Date.now();
    if (resendVerifiedDomainsCache && (now - resendVerifiedDomainsCache.checkedAt < 5 * 60 * 1000)) {
        return resendVerifiedDomainsCache.domains.has(domain.toLowerCase());
    }
    try {
        const res = await fetch("https://api.resend.com/domains", {
            headers: { "Authorization": `Bearer ${resendKey}` }
        });
        if (res.ok) {
            const json: any = await res.json();
            const verified = new Set<string>();
            if (Array.isArray(json?.data)) {
                for (const d of json.data) {
                    if (d.status === 'verified' && d.name) {
                        verified.add(d.name.toLowerCase());
                    }
                }
            }
            resendVerifiedDomainsCache = { domains: verified, checkedAt: now };
            return verified.has(domain.toLowerCase());
        }
    } catch {
        // network or auth error
    }
    return false;
}

function cleanUndefined<T = any>(obj: T): T {
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

export function getServerEmailConfigStatus() {
    const resendKey = process.env.RESEND_API_KEY;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    let provider: 'resend' | 'sendgrid' | 'none' = 'none';
    let isConfigured = false;
    let maskedKey = '';

    if (resendKey) {
        provider = 'resend';
        isConfigured = true;
        maskedKey = resendKey.length > 8 ? `${resendKey.slice(0, 4)}••••••••${resendKey.slice(-4)}` : '••••••••';
    } else if (sendgridKey) {
        provider = 'sendgrid';
        isConfigured = true;
        maskedKey = sendgridKey.length > 8 ? `${sendgridKey.slice(0, 4)}••••••••${sendgridKey.slice(-4)}` : '••••••••';
    }

    const envFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
    const fromEmail = (envFrom && envFrom.includes('@')) ? envFrom.trim() : "notifications@cathaybankusa.com";
    const supportEmails = [
        "support@cathaybankusa.com",
        "supportcathaybankusa@gmail.com"
    ];

    return {
        provider,
        isConfigured,
        maskedKey,
        fromEmail,
        replyToEmail: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || "support@cathaybankusa.com",
        supportEmails,
        domain: process.env.CUSTOM_DOMAIN || "cathaybankusa.com",
        serverTime: new Date().toISOString()
    };
}

export async function sendTransactionalEmail(
    opts: TransactionalEmailOptions,
    firestore: any,
    isFirestoreQuotaExhausted: boolean,
    dbState: any,
    saveLocalState: () => void
): Promise<{ success: boolean; emailId: string; simulated: boolean; providerUsed: string; warning?: string }> {
    const dedupeKey = `${(opts.recipient || '').toLowerCase().trim()}:${opts.emailType}:${opts.transactionId || opts.subject || ''}`;
    const lastSent = emailDedupeCache.get(dedupeKey);
    const now = Date.now();

    // Prevent identical duplicate emails within 5 seconds
    if (opts.emailType !== 'System Test' && lastSent && (now - lastSent) < 5000) {
        console.log(`[EMAIL DEDUPE] Suppressed rapid duplicate email (${opts.emailType}) to ${opts.recipient}`);
        return { success: true, emailId: 'deduplicated', simulated: false, providerUsed: 'dedupe-cache' };
    }
    emailDedupeCache.set(dedupeKey, now);

    const emailId = `eml_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const emailRecord: EmailLogEntry = {
        id: emailId,
        emailStatus: 'Queued',
        transactionId: opts.transactionId || null,
        recipient: opts.recipient,
        emailType: opts.emailType,
        subject: opts.subject,
        body: opts.emailType === 'Email Verification' || opts.emailType === 'Verification Code'
            ? '[verification content redacted]'
            : opts.bodyHtml,
        createdTimestamp: new Date().toISOString(),
        retryCount: 0,
        providerUsed: 'simulation'
    };

    const resendKey = process.env.RESEND_API_KEY;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const envFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
    const fromEmail = (envFrom && envFrom.includes('@')) ? envFrom.trim() : "notifications@cathaybankusa.com";
    const replyToEmail = process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || "support@cathaybankusa.com";

    let sendSuccess = false;
    let failureReason: string | undefined;
    let providerUsed = 'simulation';

    if (!resendKey && !sendgridKey) {
        sendSuccess = true;
        emailRecord.emailStatus = 'Sent';
        emailRecord.sentTimestamp = new Date().toISOString();
        emailRecord.providerUsed = 'simulation';
    }

    if (resendKey) {
        providerUsed = 'resend';
        emailRecord.providerUsed = 'resend';
        try {
            // Asynchronously check and remove suppressions without delaying outbound transmission
            fetch("https://api.resend.com/suppressions", {
                headers: { "Authorization": `Bearer ${resendKey}` }
            }).then(async (supRes) => {
                if (supRes.ok) {
                    const supData = await supRes.json();
                    if (supData && Array.isArray(supData.data)) {
                        const cleanTarget = (opts.recipient || '').trim().toLowerCase();
                        const matched = supData.data.find((item: any) => item.email && item.email.trim().toLowerCase() === cleanTarget);
                        if (matched && matched.id) {
                            await fetch(`https://api.resend.com/suppressions/${matched.id}`, {
                                method: "DELETE",
                                headers: { "Authorization": `Bearer ${resendKey}` }
                            });
                            console.log(`[EMAIL AUTO-UNSUPPRESS] Removed ${opts.recipient} from Resend suppression.`);
                        }
                    }
                }
            }).catch(supErr => console.warn("[EMAIL AUTO-UNSUPPRESS] Background check:", supErr));

            const replyToAddress = process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || 'support@cathaybankusa.com';

            const sendRequest = async (senderAddress: string) => {
                const payload: any = {
                    from: `Cathay Bank <${senderAddress}>`,
                    to: [opts.recipient],
                    subject: opts.subject,
                    html: opts.bodyHtml
                };
                if (replyToAddress) {
                    payload.reply_to = replyToAddress;
                }
                return await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${resendKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            };

            const domainPart = fromEmail.includes('@') ? fromEmail.split('@')[1] : 'cathaybankusa.com';
            const isVerified = await isResendDomainVerified(domainPart, resendKey);
            const preferredSender = isVerified ? fromEmail : "onboarding@resend.dev";

            let response = await sendRequest(preferredSender);
            if (!response.ok && preferredSender !== "onboarding@resend.dev") {
                response = await sendRequest("onboarding@resend.dev");
            }

            if (response.ok) {
                sendSuccess = true;
                emailRecord.emailStatus = 'Sent';
                emailRecord.sentTimestamp = new Date().toISOString();
            } else {
                const errText = await response.text();
                failureReason = `Resend rejected: ${errText}`;
                emailRecord.emailStatus = 'Failed';
                emailRecord.failureReason = failureReason;
            }
        } catch (err: any) {
            failureReason = `Network error: ${err.message}`;
            emailRecord.emailStatus = 'Failed';
            emailRecord.failureReason = failureReason;
        }
    } else if (sendgridKey) {
        providerUsed = 'sendgrid';
        emailRecord.providerUsed = 'sendgrid';
        try {
            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sendgridKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: opts.recipient }] }],
                    from: { email: fromEmail, name: "Cathay Bank" },
                    subject: opts.subject,
                    content: [{ type: "text/html", value: opts.bodyHtml }]
                })
            });

            if (response.ok || response.status === 202) {
                sendSuccess = true;
                emailRecord.emailStatus = 'Sent';
                emailRecord.sentTimestamp = new Date().toISOString();
            } else {
                const errText = await response.text();
                failureReason = `SendGrid rejected: ${errText}`;
                emailRecord.emailStatus = 'Failed';
                emailRecord.failureReason = failureReason;
            }
        } catch (err: any) {
            failureReason = `SendGrid Network error: ${err.message}`;
            emailRecord.emailStatus = 'Failed';
            emailRecord.failureReason = failureReason;
        }
    }

    // Save to in-memory state & data.json
    if (!dbState.emails) dbState.emails = [];
    dbState.emails.unshift(emailRecord);
    if (dbState.emails.length > 500) dbState.emails = dbState.emails.slice(0, 500);
    saveLocalState();

    // Persist to Firestore emails collection if available (non-blocking)
    if (firestore && !isFirestoreQuotaExhausted) {
        const firestoreEmail = cleanUndefined(emailRecord);
        setDoc(doc(firestore, 'emails', emailId), firestoreEmail).catch((e: any) => {
            console.warn("Could not save email log to Firestore:", e?.message || e);
        });
    }

    return { 
        success: sendSuccess, 
        emailId, 
        simulated: !resendKey && !sendgridKey, 
        providerUsed,
        warning: failureReason 
    };
}

// -------------------------------------------------------------
// HTML Email Templates with pristine typography and Test Environment banners
// -------------------------------------------------------------

function emailBaseWrapper(title: string, contentHtml: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <!-- Institutional Security Header Banner -->
    <tr>
      <td style="background-color: #0A2540; padding: 10px 24px; text-align: center;">
        <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #38bdf8;">
          ✦ CATHAY BANK USA • OFFICIAL BANKING NOTIFICATION ✦
        </span>
      </td>
    </tr>

    <!-- Header / Brand -->
    <tr>
      <td style="padding: 24px 32px 18px 32px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <table cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="background-color: #C8102E; width: 32px; height: 32px; border-radius: 6px; text-align: center; line-height: 32px; color: #ffffff; font-weight: 900; font-size: 16px; display: inline-block;">國</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 10px;">
                    <div style="margin: 0; font-size: 18px; font-weight: 900; color: #0066CC; letter-spacing: -0.02em;">CATHAY BANK</div>
                    <div style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Online Banking • Member FDIC</div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">VERIFIED SECURE</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px;">
        ${contentHtml}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">Security & Confidentiality Notice</p>
        <p style="margin: 0 0 12px 0;">This communication is intended solely for the authorized account holder. Cathay Bank will NEVER request your online banking password, PIN, or one-time verification code via phone call, SMS, or unsolicited email. If you receive an unexpected request for credentials, report it immediately to security desk.</p>
        <p style="margin: 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} Cathay Bank USA. All rights reserved. Member FDIC. Equal Housing Lender.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function buildAccountCreatedEmail(data: {
    fullName: string;
    accountNumber: string;
    currency: string;
    simulatedBalance: number;
    accountType?: string;
}): { subject: string; bodyHtml: string } {
    const formattedBalance = data.simulatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = data.currency === 'GBP' ? '£' : (data.currency === 'EUR' ? '€' : '$');

    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Welcome to Cathay Bank</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${data.fullName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        Congratulations! Your <strong>Cathay Bank Online Banking</strong> account has been approved and activated. You now have complete access to manage your portfolio, view real-time account balances, and execute secure fund transfers.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; font-weight: 600;">Account Holder:</td>
            <td style="font-weight: 700; color: #0f172a; text-align: right;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Official Account Number:</td>
            <td style="font-weight: 800; font-family: monospace; color: #0066CC; text-align: right;">${data.accountNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Routing Number (ABA):</td>
            <td style="font-weight: 700; font-family: monospace; color: #0f172a; text-align: right;">122000496</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Account Type:</td>
            <td style="font-weight: 700; color: #0f172a; text-align: right;">${data.accountType || 'Premier High-Yield Checking'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Account Currency:</td>
            <td style="font-weight: 700; color: #0f172a; text-align: right;">${data.currency}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Available Starting Balance:</td>
            <td style="font-weight: 800; color: #059669; font-size: 16px; text-align: right;">${symbol}${formattedBalance} ${data.currency}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Account Status:</td>
            <td style="font-weight: 700; color: #059669; text-align: right;">Verified & Active</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">
        You can now sign in to your Cathay Bank dashboard using your registered credentials.
      </p>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        If you have questions or require personalized banking services, our 24/7 customer care team is always here for you at support@cathaybankusa.com or supportcathaybankusa@gmail.com.
      </p>
    `;

    return {
        subject: `Welcome to Cathay Bank — Your Account Has Been Created (${data.accountNumber})`,
        bodyHtml: emailBaseWrapper("Account Created", content)
    };
}

export function buildEmailVerificationEmail(data: {
    fullName: string;
    verificationCode: string;
    verifyUrl?: string;
}): { subject: string; bodyHtml: string } {
    const greetingName = (data.fullName && !data.fullName.includes('@')) ? data.fullName.trim() : 'Valued Customer';
    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">This is your verification code for your new account</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${greetingName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        Thank you for choosing Cathay Bank. This is your verification code for your new account. Please enter this code to verify your identity and finalize your account opening:
      </p>

      <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 38px; font-weight: 900; letter-spacing: 0.25em; font-family: monospace; color: #15803d; display: inline-block;">
          ${data.verificationCode}
        </span>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #166534; font-weight: 600;">
          This is your verification code for your new account • Valid for 15 minutes
        </p>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
        Please enter this 6-digit confirmation code in your setup window. For your protection and privacy, never disclose this code to anyone. Cathay Bank representatives will never contact you requesting this code.
      </p>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        If you did not initiate this account opening request with Cathay Bank, please disregard this email or contact support@cathaybankusa.com or supportcathaybankusa@gmail.com immediately.
      </p>
    `;

    return {
        subject: `This is your verification code for your new account (${data.verificationCode}) — Cathay Bank`,
        bodyHtml: emailBaseWrapper("Verification Code", content)
    };
}

export function buildTransferSentEmail(data: {
    senderName: string;
    recipientName: string;
    recipientAccount: string;
    amount: number;
    currency: string;
    transactionId: string;
    date: string;
}): { subject: string; bodyHtml: string } {
    const formattedAmount = data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = data.currency === 'GBP' ? '£' : (data.currency === 'EUR' ? '€' : '$');

    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Transfer Completed Successfully</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${data.senderName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        This email confirms that your transfer of <strong>${symbol}${formattedAmount}</strong> has been debited and processed successfully.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; font-weight: 600;">Recipient:</td>
            <td style="font-weight: 700; color: #0f172a; text-align: right;">${data.recipientName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Beneficiary Account:</td>
            <td style="font-weight: 700; font-family: monospace; color: #0f172a; text-align: right;">${data.recipientAccount}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Amount Debited:</td>
            <td style="font-weight: 800; color: #dc2626; font-size: 16px; text-align: right;">-${symbol}${formattedAmount} ${data.currency}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Transaction Reference:</td>
            <td style="font-weight: 700; font-family: monospace; color: #0066CC; text-align: right;">${data.transactionId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Date & Time:</td>
            <td style="color: #334155; text-align: right;">${new Date(data.date).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Status:</td>
            <td style="font-weight: 800; color: #059669; text-align: right;">✓ Completed</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Your account balance has been updated in real-time. If you did not authorize this transaction, please contact our 24/7 fraud desk immediately at support@cathaybankusa.com.
      </p>
    `;

    return {
        subject: `Cathay Bank Transfer Confirmation — ${symbol}${formattedAmount} Sent (${data.transactionId})`,
        bodyHtml: emailBaseWrapper("Transfer Sent", content)
    };
}

export function buildTransferReceivedEmail(data: {
    recipientName: string;
    senderName: string;
    amount: number;
    currency: string;
    transactionId: string;
    date: string;
}): { subject: string; bodyHtml: string } {
    const formattedAmount = data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = data.currency === 'GBP' ? '£' : (data.currency === 'EUR' ? '€' : '$');

    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Funds Credited to Your Account</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${data.recipientName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        You have received an incoming credit of <strong>${symbol}${formattedAmount}</strong> from <strong>${data.senderName}</strong>. The funds are available in your account.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; font-weight: 600;">Originating Sender:</td>
            <td style="font-weight: 700; color: #0f172a; text-align: right;">${data.senderName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Amount Credited:</td>
            <td style="font-weight: 800; color: #059669; font-size: 16px; text-align: right;">+${symbol}${formattedAmount} ${data.currency}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Transaction Reference:</td>
            <td style="font-weight: 700; font-family: monospace; color: #0066CC; text-align: right;">${data.transactionId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Date & Time:</td>
            <td style="color: #334155; text-align: right;">${new Date(data.date).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Availability:</td>
            <td style="font-weight: 800; color: #059669; text-align: right;">Available Immediately</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Log into your online banking dashboard to view your updated account statement and balance.
      </p>
    `;

    return {
        subject: `Cathay Bank Deposit Alert — ${symbol}${formattedAmount} Received (${data.transactionId})`,
        bodyHtml: emailBaseWrapper("Transfer Received", content)
    };
}

export function buildTransferFailedEmail(data: {
    userName: string;
    transactionId: string;
    amount: number;
    currency: string;
    reason: string;
}): { subject: string; bodyHtml: string } {
    const formattedAmount = data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = data.currency === 'GBP' ? '£' : (data.currency === 'EUR' ? '€' : '$');

    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #dc2626;">Transfer Could Not Be Completed</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${data.userName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        Your outbound transfer request of <strong>${symbol}${formattedAmount}</strong> could not be completed and has been reversed to your account.
      </p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #991b1b; font-weight: 600;">Transaction Reference:</td>
            <td style="font-weight: 700; font-family: monospace; color: #7f1d1d; text-align: right;">${data.transactionId}</td>
          </tr>
          <tr>
            <td style="color: #991b1b; font-weight: 600;">Transfer Amount:</td>
            <td style="font-weight: 700; color: #7f1d1d; text-align: right;">${symbol}${formattedAmount} ${data.currency}</td>
          </tr>
          <tr>
            <td style="color: #991b1b; font-weight: 600;">Resolution Status:</td>
            <td style="font-weight: 800; color: #dc2626; text-align: right;">Cancelled & Reversed</td>
          </tr>
          <tr>
            <td style="color: #991b1b; font-weight: 600; vertical-align: top;">Restriction Reason:</td>
            <td style="font-weight: 600; color: #7f1d1d; text-align: right; max-width: 320px; word-break: break-word;">${data.reason}</td>
          </tr>
          <tr>
            <td style="color: #991b1b; font-weight: 600;">Account Balance:</td>
            <td style="font-weight: 700; color: #166534; text-align: right;">Full Amount Retained / Unchanged</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #334155;">
          <strong>Next Steps:</strong> Please contact customer support at <strong>support@cathaybankusa.com</strong> or <strong>supportcathaybankusa@gmail.com</strong> for assistance in verifying the required details to lift any restrictions.
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        No funds were deducted from your account balance.
      </p>
    `;

    return {
        subject: `Cathay Bank Security Alert — Transfer Could Not Be Completed (${data.transactionId})`,
        bodyHtml: emailBaseWrapper("Transfer Alert", content)
    };
}

export function buildPasswordResetEmail(data: {
    userName: string;
    resetToken: string;
    resetLink?: string;
}): { subject: string; bodyHtml: string } {
    const greetingName = (data.userName && !data.userName.includes('@')) ? data.userName.trim() : 'Account Holder';
    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Password Reset Authorization Code</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${greetingName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        A request was submitted to reset the password for your <strong>Cathay Bank Online Banking</strong> account. Use the one-time 6-digit authorization security code below to verify your identity and set a new password:
      </p>

      <div style="background-color: #f8fafc; border: 2px dashed #C8102E; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.25em; font-family: monospace; color: #C8102E; display: inline-block;">
          ${data.resetToken}
        </span>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600;">
          This is your password reset security code • Valid for 10 minutes
        </p>
      </div>

      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 600;">
          ⚠️ <strong>Security Advisory:</strong> Single-use code. Never share this code with anyone. Cathay Bank representatives will never contact you asking for this code.
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        If you did not request this password reset, please contact our 24/7 Fraud Support Center immediately at support@cathaybankusa.com or supportcathaybankusa@gmail.com.
      </p>
    `;

    return {
        subject: `Cathay Bank — Your Password Reset Authorization Code (${data.resetToken})`,
        bodyHtml: emailBaseWrapper("Password Reset Authorization Code", content)
    };
}

export function buildPasswordChangedSuccessEmail(data: {
    userName: string;
    changedAt?: string;
}): { subject: string; bodyHtml: string } {
    const timestamp = data.changedAt || new Date().toUTCString();
    const greetingName = (data.userName && !data.userName.includes('@')) ? data.userName.trim() : 'Account Holder';
    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Password Updated Successfully</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${greetingName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        The password for your <strong>Cathay Bank Online Banking</strong> account was successfully updated.
      </p>

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #065f46; font-weight: 600;">Status:</td>
            <td style="font-weight: 700; color: #047857; text-align: right;">✓ Password Successfully Updated</td>
          </tr>
          <tr>
            <td style="color: #065f46; font-weight: 600;">Timestamp:</td>
            <td style="font-weight: 600; color: #065f46; text-align: right;">${timestamp}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b;">
        If you made this change, you can now log into your online banking account using your updated password.
      </p>
      <p style="margin: 0; font-size: 13px; color: #dc2626; font-weight: 600;">
        ⚠️ If you did NOT make this change, your account may be compromised. Please contact Cathay Bank Security immediately at support@cathaybankusa.com or supportcathaybankusa@gmail.com.
      </p>
    `;

    return {
        subject: "Cathay Bank Security Alert — Online Banking Password Changed",
        bodyHtml: emailBaseWrapper("Security Alert: Password Updated", content)
    };
}

export function buildLogin2FAEmail(data: {
    userName: string;
    code: string;
}): { subject: string; bodyHtml: string } {
    const greetingName = (data.userName && !data.userName.includes('@')) ? data.userName.trim() : 'Account Holder';
    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Sign-In Authorization Code</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${greetingName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        A sign-in attempt was initiated for your <strong>Cathay Bank Online Banking</strong> profile. To verify your identity and protect your account security, please use the following one-time authorization code:
      </p>

      <div style="background-color: #f8fafc; border: 2px dashed #0066CC; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.25em; font-family: monospace; color: #0066CC; display: inline-block;">
          ${data.code}
        </span>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600;">
          This is your login verification code • Valid for 15 minutes
        </p>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">
          ⚠️ <strong>Security Advisory:</strong> Do not share this code with anyone. Cathay Bank representatives will never ask you for this code.
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        If you did not initiate this login attempt, please contact our 24/7 Security Operations Center immediately at support@cathaybankusa.com or supportcathaybankusa@gmail.com.
      </p>
    `;

    return {
        subject: `Cathay Bank — Your Sign-In Authorization Code (${data.code})`,
        bodyHtml: emailBaseWrapper("Sign-In Authorization Code", content)
    };
}

export function buildTransferProcessingNotificationEmail(data: {
    senderName: string;
    recipientName: string;
    amount: number;
    currency: string;
    transactionId: string;
    date: string;
}): { subject: string; bodyHtml: string } {
    const formattedAmount = data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = data.currency === 'GBP' ? '£' : (data.currency === 'EUR' ? '€' : '$');

    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Transfer Submitted for Review</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${data.senderName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        Your outbound transfer request has been received and is currently undergoing standard institutional compliance and security processing:
      </p>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #92400e; font-weight: 600;">Amount:</td>
            <td style="font-weight: 800; font-size: 18px; color: #b45309; text-align: right;">${symbol}${formattedAmount} ${data.currency}</td>
          </tr>
          <tr>
            <td style="color: #92400e; font-weight: 600;">Beneficiary:</td>
            <td style="font-weight: 700; color: #78350f; text-align: right;">${data.recipientName}</td>
          </tr>
          <tr>
            <td style="color: #92400e; font-weight: 600;">Reference ID:</td>
            <td style="font-weight: 700; font-family: monospace; color: #78350f; text-align: right;">${data.transactionId}</td>
          </tr>
          <tr>
            <td style="color: #92400e; font-weight: 600;">Processing Status:</td>
            <td style="font-weight: 700; color: #b45309; text-align: right;">⏳ In Review / Pending Institutional Verification</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        You will receive a notification once the verification has concluded. If you require assistance, contact customer support at support@cathaybankusa.com or supportcathaybankusa@gmail.com.
      </p>
    `;

    return {
        subject: `Cathay Bank Notice — Transfer Submitted for Review (${data.transactionId})`,
        bodyHtml: emailBaseWrapper("Transfer Processing", content)
    };
}

export function buildAccountStatusChangedEmail(data: {
    userName: string;
    accountNumber: string;
    status: 'frozen' | 'blocked' | 'restricted' | 'inactive' | 'active';
    note?: string;
}): { subject: string; bodyHtml: string } {
    const greetingName = (data.userName && !data.userName.includes('@')) ? data.userName.trim() : 'Valued Customer';
    const isFrozen = data.status === 'frozen';
    const isBlocked = data.status === 'blocked';
    const isRestricted = data.status === 'restricted';
    const isInactive = data.status === 'inactive';
    const isActive = data.status === 'active';

    let title = "Important Security Notice: Account Status Update";
    let badgeColor = "#0284c7";
    let badgeText = "Security Status Update";
    let leadText = "";
    let alertBg = "#f0f9ff";
    let alertBorder = "#bae6fd";
    let alertTextColor = "#0369a1";

    if (isFrozen) {
        title = "Notice of Account Temporary Security Hold";
        badgeColor = "#0284c7";
        badgeText = "Temporary Security Hold";
        leadText = `We are contacting you to notify you that a temporary security hold has been placed on your Cathay Bank account (${data.accountNumber}). Outgoing transactions, wire transfers, and online card payments have been temporarily locked to protect your funds and personal information.`;
    } else if (isBlocked) {
        title = "Notice of Online Banking Access Suspension";
        badgeColor = "#dc2626";
        badgeText = "Security Suspension";
        alertBg = "#fef2f2";
        alertBorder = "#fecaca";
        alertTextColor = "#991b1b";
        leadText = `We are writing to inform you that your online banking access has been suspended pursuant to institutional security guidelines.`;
    } else if (isRestricted) {
        title = "Notice of Account Administrative Restriction";
        badgeColor = "#d97706";
        badgeText = "Administrative Restriction";
        alertBg = "#fffbeb";
        alertBorder = "#fde68a";
        alertTextColor = "#b45309";
        leadText = `We are writing to notify you that specific administrative restrictions have been placed on your Cathay Bank account (${data.accountNumber}). Outgoing transfers and withdrawals require compliance verification.`;
    } else if (isInactive) {
        title = "Notice of Account Inactive Status";
        badgeColor = "#64748b";
        badgeText = "Account Inactive";
        alertBg = "#f8fafc";
        alertBorder = "#cbd5e1";
        alertTextColor = "#475569";
        leadText = `Your Cathay Bank account (${data.accountNumber}) has been marked as inactive due to prolonged inactivity or administrative request.`;
    } else {
        title = "Notice of Account Reinstatement & Full Active Status";
        badgeColor = "#16a34a";
        badgeText = "Verified & Active";
        alertBg = "#f0fdf4";
        alertBorder = "#bbf7d0";
        alertTextColor = "#15803d";
        leadText = `We are pleased to inform you that your Cathay Bank account (${data.accountNumber}) has been verified and restored to full Active status with complete transaction privileges.`;
    }

    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a;">${title}</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">Dear <strong>${greetingName}</strong>,</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">
        ${leadText}
      </p>

      <div style="background-color: ${alertBg}; border: 1px solid ${alertBorder}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: ${alertTextColor}; font-weight: 600;">Account Number:</td>
            <td style="font-weight: 800; font-family: monospace; color: #0f172a; text-align: right;">${data.accountNumber}</td>
          </tr>
          <tr>
            <td style="color: ${alertTextColor}; font-weight: 600;">Account Status:</td>
            <td style="font-weight: 800; color: ${badgeColor}; text-align: right;">${badgeText}</td>
          </tr>
          ${data.note ? `
          <tr>
            <td style="color: ${alertTextColor}; font-weight: 600; vertical-align: top;">Resolution Details:</td>
            <td style="font-weight: 600; color: #0f172a; text-align: right; max-width: 320px; word-break: break-word;">${data.note}</td>
          </tr>` : ''}
        </table>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #334155;">
          <strong>Client Assistance Desk:</strong> Please contact our 24/7 Customer Care & Clearance Department at <a href="mailto:support@cathaybankusa.com" style="color: #0066CC; font-weight: bold;">support@cathaybankusa.com</a> or <a href="mailto:supportcathaybankusa@gmail.com" style="color: #0066CC; font-weight: bold;">supportcathaybankusa@gmail.com</a> for identity verification or further information.
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Thank you for your cooperation as we maintain the highest standards of financial security for your assets.
      </p>
    `;

    return {
        subject: `Cathay Bank Notice — Account Status: ${badgeText} (${data.accountNumber})`,
        bodyHtml: emailBaseWrapper("Account Status Notification", content)
    };
}

export function buildSystemTestEmail(data: {
    recipient: string;
    note?: string;
    requestedBy?: string;
    provider?: string;
}): { subject: string; bodyHtml: string } {
    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0284c7;">Transactional Email Delivery Verified</h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155;">Dear <strong>Administrator</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155;">
        This test dispatch confirms that the server-side transactional email engine for <strong>Cathay Bank (cathaybankusa.com)</strong> is operational and properly configured.
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
          <tr>
            <td style="color: #166534; font-weight: 600;">Recipient:</td>
            <td style="font-weight: 700; font-family: monospace; color: #14532d; text-align: right;">${data.recipient}</td>
          </tr>
          <tr>
            <td style="color: #166534; font-weight: 600;">Active Provider:</td>
            <td style="font-weight: 700; color: #15803d; text-align: right;">${data.provider || 'Server Email Engine'}</td>
          </tr>
          <tr>
            <td style="color: #166534; font-weight: 600;">Sender Domain:</td>
            <td style="font-weight: 700; color: #15803d; text-align: right;">cathaybankusa.com</td>
          </tr>
          <tr>
            <td style="color: #166534; font-weight: 600;">Dispatched At:</td>
            <td style="color: #166534; text-align: right;">${new Date().toUTCString()}</td>
          </tr>
          ${data.note ? `
          <tr>
            <td style="color: #166534; font-weight: 600;">Official Dispatch Note:</td>
            <td style="color: #14532d; text-align: right; font-style: italic;">"${data.note}"</td>
          </tr>` : ''}
        </table>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        All API keys and credentials remain securely locked on the server in environment variables/Secret Manager and are never exposed to browser clients.
      </p>
    `;

    return {
        subject: "System Test: Transactional Delivery Verification — Cathay Bank",
        bodyHtml: emailBaseWrapper("System Test Verification", content)
    };
}

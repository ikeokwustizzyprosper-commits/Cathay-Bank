import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 max-w-2xl w-full max-h-[85vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A2540] dark:bg-primary text-white flex items-center justify-center font-black text-xl shadow-md">
              C
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Cathay Bank Terms & Conditions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Effective Date: 2026 Edition • Banking Regulations & Policy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center font-black text-base transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#0A2540] dark:text-primary uppercase tracking-wide">
              1. General Account Terms
            </h3>
            <p>
              By creating an account or accessing Cathay Bank digital services, you agree to abide by all financial regulations, anti-money laundering policies, and operational rules set forth by Cathay Banking Corporation and governing regulatory authorities.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#0A2540] dark:text-primary uppercase tracking-wide">
              2. Digital Banking & Wire Transfers
            </h3>
            <p>
              All funds transfers, domestic payments, and international wire transfers are subject to real-time compliance validation, anti-fraud checks, and regulatory verification. You are responsible for ensuring receiver details and account numbers are accurate prior to authorization.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#0A2540] dark:text-primary uppercase tracking-wide">
              3. Privacy, Data Protection & Location Telemetry
            </h3>
            <p>
              Cathay Bank utilizes enterprise multi-factor security, 256-bit encryption, continuous location telemetry, and secure session safeguards. Your personal information, device identifiers, IP addresses, biometric records, and financial transaction histories are monitored in real time under global banking data privacy and anti-fraud security protocols.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#0A2540] dark:text-primary uppercase tracking-wide">
              4. Unrecognized Location Login & Security Restrictions
            </h3>
            <p>
              If our automated security systems detect any login attempt, access request, or device activity originating from an unrecognized, unregistered, or suspicious location, region, or IP network:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <li>Your bank account will be <strong>immediately restricted</strong> and placed on security hold without prior notice to protect your funds.</li>
              <li><strong>All outgoing transfers, wire requests, card authorizations, and withdrawals will be strictly disabled</strong> during the restriction period.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#0A2540] dark:text-primary uppercase tracking-wide">
              5. Account Retrieval, Verification & Protection Clearance Fee
            </h3>
            <p>
              To reactivate a restricted account, unblock outbound transfer capabilities, or retrieve secured vault funds following a security restriction:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <li>The account holder must submit valid government-issued identification and complete mandatory identity verification.</li>
              <li>A mandatory <strong>Security Protection & Reactivation Clearance Fee</strong> must be paid to cover anti-fraud audit, system encryption re-keying, and account retrieval protocol clearance before any restrictions or transfer blocks are removed.</li>
              <li><strong>External Payment Requirement:</strong> In accordance with strict security containment protocols, the fee to retrieve or reactivate a restricted account <strong>will be paid outside the bank</strong> (via external settlement, external wire transfer, or designated external escrow). Under no circumstances can retrieval fees be deducted or debited directly from restricted or frozen bank balances while security hold remains active.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#0A2540] dark:text-primary uppercase tracking-wide">
              5. Customer Rights & Financial Deposit Protection
            </h3>
            <p>
              Eligible deposits held with Cathay Bank are protected by statutory deposit guarantee schemes up to applicable limits. Account holders maintain full rights to query transactions, request balance statements, and request support 24/7.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            By clicking Accept, you confirm you have read and agree to Cathay Bank's full agreement.
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0A2540] dark:bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0A2540]/20 hover:scale-[1.02] active:scale-95 transition"
            >
              I Accept Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;

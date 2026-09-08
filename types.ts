
export enum AuthView {
  LOGIN,
  SIGNUP,
  FORGOT_PASSWORD,
  CODE_VERIFICATION,
  NEW_ACCOUNT_LOADING,
  LOGGING_IN,
  SIGNUP_SUCCESS
}

export enum Page {
  DASHBOARD,
  DEPOSIT,
  TRANSFER,
  PAY_BILLS,
  LOAN,
  SAVINGS,
  IRS_REFUND,
  CARDS,
  PROFILE,
  SETTINGS,
  MENU,
  ADMIN_DASHBOARD,
  CHANGE_PIN,
  NOTIFICATIONS,
  RESTRICTION,
  LIMITS,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  KYC_VERIFICATION,
  CHAT_SUPPORT,
  DEPOSIT_WALLETS,
  SECURITY_CENTER,
  INVESTMENTS,
  FX_EXCHANGE,
  SCHEDULED_PAYMENTS,
  TRANSACTIONS,
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  accountNumber: string;
  bvn: string;
  idCardNumber: string;
  avatar: string;
  balance: number;
  savingsBalance: number;
  loanBalance: number;
  transactions: Transaction[];
  notifications: Notification[];
  pin: string;
  currency: string;
  role: 'user' | 'customer' | 'support' | 'admin' | 'super_admin' | 'superadmin';
  rawPassword?: string;
  emailVerified?: boolean;
  notificationSound?: boolean;
  transferFreezeMessage?: string;
  isBlocked?: boolean;
  isFrozen?: boolean;
  isRestricted?: boolean;
  isInactive?: boolean;
  accountStatus?: 'active' | 'frozen' | 'blocked' | 'restricted' | 'inactive';
  statusReason?: string;
  freezeMessage?: string;
  blockMessage?: string;
  restrictionMessage?: string;
  inactiveMessage?: string;
  isActivated?: boolean;
  fcmToken?: string;
  profession?: string;
  gender?: string;
  dob?: string;
  income?: string;
  accountType?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  countryOfBirth?: string;
  citizenship?: string;
  residentialAddress?: string;
  address?: string;
  dateOfBirth?: string;
  employer?: string;
  postalCode?: string;
  apartmentUnit?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  mailingAddress?: string;
  secondaryPhone?: string;
  idType?: string;
  idNumber?: string;
  issuingAuthority?: string;
  idIssueDate?: string;
  idExpiryDate?: string;
  taxIdType?: string;
  ssnOrTin?: string;
  employmentStatus?: string;
  employerName?: string;
  occupation?: string;
  employerAddress?: string;
  annualIncome?: string;
  initialDeposit?: number;
  sourceOfFunds?: string;
  expectedMonthlyActivity?: string;
  accountOwnership?: 'Individual' | 'Joint';
  coApplicantName?: string;
  coApplicantDob?: string;
  coApplicantId?: string;
  requestedServices?: string[];
  documentsProvided?: string[];
  customerCertified?: boolean;
  securityCode?: string;
  kycStatus?: 'verified' | 'pending' | 'unverified';
  kycIdType?: string;
  rewardsClaimed?: boolean;
  depositProofSubmitted?: boolean;
  depositProofTime?: number | string;
  cards?: Card[];
  limits?: {
    dailyTransfer: number;
    dailyAtm: number;
    monthlySpending: number;
    perTransaction: number;
    onlinePurchase: number;
  };
  sessions?: Array<{
    id: string;
    deviceId: string;
    location: string;
    loginTime: string;
    ipAddress: string;
    isActive: boolean;
  }>;
}

export interface Transaction {
  id: string;
  userId?: string; 
  userName?: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  reference?: string;
  status?: 'Completed' | 'Pending' | 'Failed' | 'Held' | 'Reversed';
  senderName?: string;
  senderAccount?: string;
  receiverName?: string;
  receiverAccount?: string;
  bankName?: string;
  country?: string;
  currency?: string;
  fee?: number;
  totalDebited?: number;
  amountReceived?: string;
  exchangeRate?: string;
  paymentMethod?: string;
  receivingNetwork?: string;
  estimatedDelivery?: string;
  subtitle?: string;
  failureReason?: string;
  routingNumber?: string;
  sortCode?: string;
  swiftCode?: string;
  accountType?: string;
  beneficiaryAddress?: string;
  paymentPurpose?: string;
  internalNotes?: string;
  reversedAt?: string;
  reversalReason?: string;
}

export interface Card {
  id: string;
  type: 'virtual' | 'physical';
  provider: 'visa' | 'mastercard';
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; 
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  imageUrl?: string;
  timestamp: string;
  isRead?: boolean;
}

export type Action =
  | { type: 'LOGIN'; payload: { email: string; password: string; userId?: string } }
  | { type: 'SIGNUP'; payload: User }
  | { type: 'LOGOUT'; payload?: string }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'UPDATE_USER_BALANCE'; payload: { userId: string, newBalance: number } }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string, isBlocked: boolean } }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION_STATUS'; payload: { userId: string, transactionId: string, status: Transaction['status'] } }
  | { type: 'SET_SELECTED_TRANSACTION', payload: Transaction | null }
  | { type: 'MOVE_TO_SAVINGS', payload: number }
  | { type: 'MOVE_FROM_SAVINGS', payload: number }
  | { type: 'MOVE_TO_LOAN', payload: number }
  | { type: 'MOVE_FROM_LOAN', payload: number }
  | { type: 'CHANGE_PIN', payload: string }
  | { type: 'UPDATE_LIMITS', payload: User['limits'] }
  | { type: 'CLEAR_AUTH_ERROR' }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'TOGGLE_CHAT'; payload: boolean }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'CLEAR_TRANSACTIONS'; payload?: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'DELETE_ALL_CUSTOMERS' }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_TRANSACTION_TO_USER'; payload: { userId: string, transaction: Transaction } }
  | { type: 'UPDATE_SYSTEM_NOTE'; payload: string }
  | { type: 'SYNC_STATE'; payload: AppState }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'QUICK_LOGIN'; payload: User };

export interface AppState {
  isAuthenticated: boolean;
  isChatbotOpen: boolean;
  currentUser: User | null;
  currentPage: Page;
  selectedTransaction: Transaction | null;
  users: User[];
  messages: Message[];
  authError: string | null;
  currentCurrency: string;
  systemNote: string;
  language: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  fullName: string;
  email: string;
  currency: string;
  simulatedBalance: number;
  savingsBalance?: number;
  loanBalance?: number;
  accountStatus: 'active' | 'suspended' | 'frozen' | 'closed';
  isTestEnvironment: boolean;
  createdDate: string;
  lastLogin: string;
  emailVerificationStatus: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUser: string;
  targetTransaction?: string;
  previousValue?: string;
  newValue?: string;
  amountChanged?: number;
  reason: string;
  timestamp: string;
}

export interface EmailLog {
  id: string;
  emailStatus: 'Queued' | 'Sent' | 'Failed';
  transactionId?: string;
  recipient: string;
  emailType: 'Account Created' | 'Email Verification' | 'Transfer Sent' | 'Transfer Received' | 'Transfer Failed' | 'Password Reset';
  subject: string;
  body: string;
  createdTimestamp: string;
  sentTimestamp?: string;
  failureReason?: string;
  retryCount?: number;
}

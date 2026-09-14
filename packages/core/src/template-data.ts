// Typed data interfaces for every built-in template.
// Import these to get full autocomplete and type-checking when calling mc.render().

export interface WelcomeData {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyName: string;
  role: string;
  startDate: string;
  employeeId?: string;
  personalEmail?: string;
  department?: string;
  team?: string;
  managerName?: string;
  workLocation?: string;
  previousExperience?: string;
  employmentType?: string;
  workingHours?: string;
reportingLocation?: string;
  reportingTime?: string;
  hrEmail?: string;
  itSetupLink?: string;
  onboardingNote?: string;
  portalLink?: string;
  logoUrl?: string;
}

export interface OtpData {
  firstName: string;
  otpCode: string;
  expiryMinutes: number;
  requestedAt: string;
  supportLink?: string;
}

export interface PasswordResetData {
  firstName: string;
  resetLink: string;
  expiryHours: number;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface EmailVerificationData {
  firstName: string;
  verificationLink: string;
  expiryHours: number;
  productName: string;
}

export interface InvoiceItem {
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
}

export interface InvoiceData {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: string;
  total: string;
  dueDate?: string;
  tax?: string;
  downloadLink?: string;
}

export interface OrderItem {
  name: string;
  quantity: string;
  price: string;
  imageUrl?: string;
}

export interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  estimatedDelivery: string;
  items: OrderItem[];
  subtotal: string;
  shipping: string;
  total: string;
  deliveryAddress: string;
  trackingLink?: string;
}

export interface EventInvitationData {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  location: string;
  rsvpLink: string;
  description?: string;
  calendarLink?: string;
}

export interface SubscriptionData {
  firstName: string;
  planName: string;
  startDate: string;
  manageLink: string;
  nextBillingDate?: string;
  amount?: string;
  currency?: string;
  featuresIncluded?: string[];
}

export interface SystemAlertData {
  firstName: string;
  alertType: 'info' | 'warning' | 'critical';
  alertTitle: string;
  alertMessage: string;
  timestamp: string;
  actionText?: string;
  actionLink?: string;
  supportLink?: string;
}

export interface AccountWarningData {
  firstName: string;
  reason: string;
  actionRequired: string;
  supportLink: string;
  deadline?: string;
  appealLink?: string;
}

export type TemplateDataMap = {
  'welcome':            WelcomeData;
  'otp':                OtpData;
  'password-reset':     PasswordResetData;
  'email-verification': EmailVerificationData;
  'invoice':            InvoiceData;
  'order-confirmation': OrderConfirmationData;
  'event-invitation':   EventInvitationData;
  'subscription':       SubscriptionData;
  'system-alert':       SystemAlertData;
  'account-warning':    AccountWarningData;
};

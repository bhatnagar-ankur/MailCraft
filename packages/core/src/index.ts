export { MailCraft, MailCraft as default } from './mailcraft';
export { createMailCraftRouter } from './server';
export { listTemplates, getTemplate } from './templates/index';
export { validateTemplateData } from './validator/index';

export type { TemplateData } from './renderer/index';
export type { TemplateEntry, TemplateId } from './templates/index';
export type { ValidationResult } from './validator/index';
export type { RenderOptions, RenderResult } from '@bhatnagar-ankur/mailcraft-types';

export type {
  WelcomeData,
  OtpData,
  PasswordResetData,
  EmailVerificationData,
  InvoiceItem,
  InvoiceData,
  OrderItem,
  OrderConfirmationData,
  EventInvitationData,
  SubscriptionData,
  SystemAlertData,
  AccountWarningData,
  TemplateDataMap,
} from './template-data';

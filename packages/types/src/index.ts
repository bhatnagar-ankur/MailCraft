export interface RenderedEmail {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface AdapterConfig {
  [key: string]: unknown;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface IEmailAdapter {
  name: string;
  send(payload: RenderedEmail, config: AdapterConfig): Promise<SendResult>;
  validate(config: AdapterConfig): ValidationResult;
}

export type AlertType = 'info' | 'warning' | 'critical';

export interface TemplateVariable {
  type: 'string' | 'number' | 'url' | 'boolean' | 'array';
  required: boolean;
  description?: string;
  itemSchema?: TemplateSchema;
  enum?: string[];
}

export interface TemplateSchema {
  [key: string]: TemplateVariable;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  useCase: string;
  schema: TemplateSchema;
}

export interface RenderOptions {
  /** Skip juice CSS inlining (MJML already inlines, use only as extra pass) */
  skipInliner?: boolean;
  /** HTML-escape all variable values (default: true) */
  escapeValues?: boolean;
}

export interface RenderResult {
  html: string;
  text?: string;
}

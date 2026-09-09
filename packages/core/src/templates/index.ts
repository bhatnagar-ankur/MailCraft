import fs from 'fs';
import path from 'path';

export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  useCase: string;
  mjml: string;
  schema: TemplateSchemaFile;
  previewData: Record<string, unknown>;
}

export interface TemplateSchemaFile {
  id: string;
  name: string;
  description: string;
  useCase: string;
  variables: Record<string, TemplateVariableDef>;
}

export interface TemplateVariableDef {
  type: string;
  required: boolean;
  description?: string;
  enum?: string[];
  itemSchema?: Record<string, TemplateVariableDef>;
}

const TEMPLATE_IDS = [
  'welcome',
  'otp',
  'password-reset',
  'email-verification',
  'invoice',
  'order-confirmation',
  'event-invitation',
  'subscription',
  'system-alert',
  'account-warning',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

function loadTemplate(id: string): TemplateEntry {
  const dir = path.join(__dirname, id);
  const mjml = fs.readFileSync(path.join(dir, 'template.mjml'), 'utf-8');
  const schema: TemplateSchemaFile = JSON.parse(
    fs.readFileSync(path.join(dir, 'schema.json'), 'utf-8')
  );
  const previewData: Record<string, unknown> = JSON.parse(
    fs.readFileSync(path.join(dir, 'preview-data.json'), 'utf-8')
  );
  return { id, name: schema.name, description: schema.description, useCase: schema.useCase, mjml, schema, previewData };
}

let _registry: Map<string, TemplateEntry> | null = null;

function getRegistry(): Map<string, TemplateEntry> {
  if (!_registry) {
    _registry = new Map();
    for (const id of TEMPLATE_IDS) {
      _registry.set(id, loadTemplate(id));
    }
  }
  return _registry;
}

export function getTemplate(id: string): TemplateEntry {
  const registry = getRegistry();
  const entry = registry.get(id);
  if (!entry) {
    throw new Error(
      `Template "${id}" not found. Available templates: ${TEMPLATE_IDS.join(', ')}`
    );
  }
  return entry;
}

export function listTemplates(): TemplateEntry[] {
  return TEMPLATE_IDS.map((id) => getRegistry().get(id)!);
}

export { TEMPLATE_IDS };

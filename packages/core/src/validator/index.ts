import { z } from 'zod';
import type { TemplateSchemaFile, TemplateVariableDef } from '../templates/index';
import type { TemplateData } from '../renderer/index';

/**
 * Converts a MailCraft template schema entry into a Zod shape so that
 * required fields are enforced and basic types are checked at render time.
 */
function buildZodShape(
  variables: Record<string, TemplateVariableDef>
): z.ZodRawShape {
  const shape: z.ZodRawShape = {};

  for (const [key, def] of Object.entries(variables)) {
    let field: z.ZodTypeAny;

    switch (def.type) {
      case 'number':
        field = z.number();
        break;
      case 'boolean':
        field = z.boolean();
        break;
      case 'array':
        field = z.array(z.unknown());
        break;
      case 'url':
      case 'string':
      default:
        field = z.string();
        if (def.enum) {
          field = z.enum(def.enum as [string, ...string[]]);
        }
        break;
    }

    shape[key] = def.required ? field : field.optional();
  }

  return shape;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates template data against the template's variable schema.
 * Returns a result object rather than throwing so callers can decide
 * whether to warn or hard-fail.
 */
export function validateTemplateData(
  schema: TemplateSchemaFile,
  data: TemplateData
): ValidationResult {
  const shape = buildZodShape(schema.variables);
  const zodSchema = z.object(shape).passthrough();

  const result = zodSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));

  return { valid: false, errors };
}

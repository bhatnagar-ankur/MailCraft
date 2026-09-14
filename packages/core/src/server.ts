import express, { Request, Response, Router } from 'express';
import { MailCraft } from './mailcraft';

const mc = new MailCraft();

/**
 * Returns an Express Router exposing the MailCraft REST API.
 * Mount it in your own Express app at any path.
 *
 * @example
 * app.use('/email', createMailCraftRouter());
 */
export function createMailCraftRouter(): Router {
  const router = express.Router();

  router.use(express.json());

  // GET /templates — list all templates with their schemas
  router.get('/templates', (_req: Request, res: Response) => {
    const templates = mc.list().map((t) => ({
      id:          t.id,
      name:        t.name,
      description: t.description,
      useCase:     t.useCase,
      schema:      t.schema.variables,
    }));
    res.json({ templates });
  });

  // GET /templates/:id — schema for a single template
  router.get('/templates/:id', (req: Request, res: Response) => {
    const entry = mc.list().find((t) => t.id === req.params.id);
    if (!entry) {
      res.status(404).json({ error: `Template "${req.params.id}" not found` });
      return;
    }
    res.json({
      id:          entry.id,
      name:        entry.name,
      description: entry.description,
      useCase:     entry.useCase,
      schema:      entry.schema.variables,
    });
  });

  // POST /render — render a template with provided data
  router.post('/render', async (req: Request, res: Response) => {
    const { templateId, data, options } = req.body as {
      templateId?: string;
      data?: Record<string, unknown>;
      options?: { skipInliner?: boolean };
    };

    if (!templateId || typeof templateId !== 'string') {
      res.status(400).json({ error: '`templateId` (string) is required' });
      return;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      res.status(400).json({ error: '`data` (object) is required' });
      return;
    }

    try {
      const result = await mc.render(templateId, data, options ?? {});
      res.json(result);
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
        return;
      }
      if (message.includes('validation failed')) {
        res.status(422).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  });

  // GET /health — liveness probe
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  return router;
}

/**
 * Starts a standalone MailCraft HTTP server on the given port.
 * Used by the `mailcraft serve` CLI command.
 */
export function startMailCraftServer(port: number = 3001): void {
  const app = express();
  app.use('/', createMailCraftRouter());

  app.listen(port, () => {
    console.log(`\nMailCraft server listening on http://localhost:${port}\n`);
    console.log(`  POST /render          render a template`);
    console.log(`  GET  /templates       list all templates`);
    console.log(`  GET  /templates/:id   schema for one template`);
    console.log(`  GET  /health          health check\n`);
  });
}

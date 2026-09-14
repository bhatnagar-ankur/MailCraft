#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { MailCraft } from './mailcraft';

const program = new Command();

program
  .name('mailcraft')
  .description('MailCraft CLI — render cross-client email templates')
  .version('0.1.0');

program
  .command('list')
  .description('List all available built-in templates')
  .action(() => {
    const mc = new MailCraft();
    const templates = mc.list();
    console.log('\nAvailable templates:\n');
    for (const t of templates) {
      console.log(`  ${t.id.padEnd(22)} ${t.name}`);
      console.log(`  ${''.padEnd(22)} ${t.description}\n`);
    }
  });

program
  .command('render')
  .description('Render a template to HTML')
  .requiredOption('-t, --template <id>', 'Template ID (see: mailcraft list)')
  .option('-d, --data <file>', 'Path to a JSON file with template variables')
  .option(
    '-v, --var <pair...>',
    'Inline variable as key=value (can be repeated)',
  )
  .option('-o, --output <file>', 'Write output to a file (default: stdout)')
  .option('--text', 'Output plain-text instead of HTML')
  .action(async (opts) => {
    let data: Record<string, unknown> = {};

    if (opts.data) {
      const dataPath = path.resolve(opts.data);
      if (!fs.existsSync(dataPath)) {
        console.error(`Error: data file not found: ${dataPath}`);
        process.exit(1);
      }
      data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    if (opts.var) {
      for (const pair of opts.var) {
        const idx = pair.indexOf('=');
        if (idx === -1) {
          console.error(`Error: --var must be in key=value format, got: ${pair}`);
          process.exit(1);
        }
        const key = pair.slice(0, idx);
        const value = pair.slice(idx + 1);
        data[key] = value;
      }
    }

    try {
      const mc = new MailCraft();
      const result = await mc.render(opts.template, data);
      const output = opts.text ? (result.text ?? '') : result.html;

      if (opts.output) {
        const outPath = path.resolve(opts.output);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, output, 'utf-8');
        console.log(`Written to: ${outPath}`);
      } else {
        process.stdout.write(output);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('schema <templateId>')
  .description('Print the variable schema for a template')
  .action((templateId) => {
    try {
      const mc = new MailCraft();
      const entry = mc.list().find((t) => t.id === templateId);
      if (!entry) {
        console.error(`Template "${templateId}" not found. Run 'mailcraft list' to see available templates.`);
        process.exit(1);
      }
      console.log(JSON.stringify(entry.schema, null, 2));
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Start an HTTP server exposing MailCraft as a REST API')
  .option('-p, --port <number>', 'Port to listen on (default: 3001)', '3001')
  .action((opts) => {
    const port = parseInt(opts.port, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('Error: --port must be a valid port number (1–65535)');
      process.exit(1);
    }
    const { startMailCraftServer } = require('./server');
    startMailCraftServer(port);
  });

program
  .command('preview [templateId]')
  .description('Open a template preview in your browser (uses built-in sample data)')
  .action((templateId) => {
    const previewDir = path.join(__dirname, 'previews');
    const indexFile = path.join(previewDir, 'index.html');

    if (!fs.existsSync(indexFile)) {
      console.error('Preview files not found. They are generated during the package build.');
      process.exit(1);
    }

    // Append #templateId as fragment so the gallery auto-selects that tab
    const fragment = templateId ? `#${templateId}` : '';
    const fileUrl = `file://${indexFile.replace(/\\/g, '/')}${fragment}`;

    const cmd =
      process.platform === 'win32' ? `start "" "${fileUrl}"` :
      process.platform === 'darwin' ? `open "${fileUrl}"` :
      `xdg-open "${fileUrl}"`;

    exec(cmd, (err) => {
      if (err) {
        console.log(`Could not open browser automatically.`);
        console.log(`Open this file manually:\n  ${indexFile}`);
      } else {
        console.log(`Opened preview${templateId ? ` for "${templateId}"` : ' gallery'} in your browser.`);
      }
    });
  });

program.parse();

/**
 * @file index.ts
 * Main entry point for the Bun server application
 * Imports and starts the server
 */

import { startServer } from './server/server.js';
import { WWW_ROOT, USER_DATA_ROOT } from './server/config.js';

let server = startServer();
console.log(`Serving static files from: ${WWW_ROOT}`);
console.log(`User data operations restricted to: ${USER_DATA_ROOT}`);
console.log(`Bun server listening on http://${server.hostname}:${server.port}`);

// Optional: Add graceful shutdown logic if needed
// process.on('SIGINT', () => { ... });
// process.on('SIGTERM', () => { ... });

/**
 * @file index.ts
 * Main entry point for the Bun server application
 * Imports and starts the server
 */

import { startServer, gracefulShutdown } from './server/server.js';
import { WWW_ROOT, USER_DATA_ROOT, PORT } from './server/config.js';

let server = startServer();
process.on('SIGINT', () => gracefulShutdown('SIGINT', server, PORT)); // NOTE: Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server, PORT)); // NOTE: Standard termination signal

console.log(`Serving static files from: ${WWW_ROOT}`);
console.log(`User data operations restricted to: ${USER_DATA_ROOT}`);
console.log(`Bun server listening on http://${server.hostname}:${server.port}`);

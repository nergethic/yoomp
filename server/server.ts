/**
 * @module server/server
 * Core server setup and request routing logic using Bun.serve
 */

import { type Serve } from 'bun';
import { PORT } from './config.js';
import { handleStaticFileRequest } from './staticHandler.js';
import { handleApiFileRequest } from './apiHandler.js';
import { createErrorResponse } from './response.js';

let isShuttingDown = false;

async function routeRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    console.log(`Request: ${method} ${pathname}`);

    try {
        if (method === "GET")
            return await handleStaticFileRequest(pathname);
        else if (method === "POST" && pathname === "/api/file")
            return await handleApiFileRequest(req);
        else
             return createErrorResponse("Not Found", 404);
    } catch (error: any) {
        console.error(`Unhandled error during request processing for ${method} ${pathname}:`, error);
        return createErrorResponse('Internal Server Error', 500);
    }
}

export const serverConfig: Serve = {
    port: PORT,
    fetch: routeRequest,
    error(error: Error): Response | undefined {
        console.error("Unhandled Bun.serve infrastructure error:", error);
        return createErrorResponse("An unexpected server error occurred", 500);
    }
};

export async function gracefulShutdown(signal: string, server: Bun.Server, port: number | string) {
    if (isShuttingDown) {
        console.log('Shutdown already in progress. Force exiting...');
        process.exit(1);
    }

    isShuttingDown = true;
    console.log(`\nReceived ${signal}. Starting graceful shutdown for server on port ${port}...`);

    try {
        server.stop(true);
        console.log(`Bun server on port ${port} stopped accepting new connections.`);
        console.log(`Shutdown complete for server on port ${port}. Exiting.`);
        process.exit(0);
    } catch (error) {
        console.error(`Error during graceful shutdown for server on port ${port}:`, error);
        process.exit(1);
    }
}

export function startServer() {
    const server = Bun.serve(serverConfig);
    return server;
}

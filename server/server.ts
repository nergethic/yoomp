/**
 * @module server/server
 * Core server setup and request routing logic using Bun.serve
 */

import { type Serve } from 'bun';
import { Elysia, t } from 'elysia';
import { PORT } from './config.js';
import { handleStaticFileRequest } from './staticHandler.js';
import { handleApiFileRequest } from './apiHandler.js';
import { createErrorResponse } from './response.js';
import { apiBodySchema, type ApiRequestBodyType } from './apiTypes.js';

let isShuttingDown = false;

const elysiaApp = new Elysia()
    .onError(({ code, error, set }) => {
        console.error(`Unhandled Elysia error [${code}]:`, error);

        switch (code) {
            case 'NOT_FOUND': {
                set.status = 404;
                return { success: false, message: "Not Found" };
            }
            case 'VALIDATION': {
                set.status = 400;
                return { success: false, message: `Validation Error: ${error.message}` };
            }
            case 'PARSE': {
                set.status = 400;
                return { success: false, message: `Parse Error: ${error.message}` };
            }
            case 'PARSE': {
                set.status = 400;
                return { success: false, message: `Parse Error: ${error.message}` };
            }
            case 'INTERNAL_SERVER_ERROR':
            case 'UNKNOWN':
            default:
                set.status = 500;
                return { success: false, message: 'Internal Server Error' };
        }
    })
    .get("/*", async ({ request }) => {
        const url = new URL(request.url);
        const pathname = url.pathname;
        console.log(`Request: GET ${pathname}`);
        return await handleStaticFileRequest(pathname);
    })
    .post(
        "/api/file",
        async ({ body }: { body: ApiRequestBodyType }) => {
            console.log(`Request: POST /api/file with action: ${body.action}`);
            try {
                return await handleApiFileRequest(body);
            } catch (error) {
                console.error(`Error during API file handling:`, error);
                throw error;
            }
        },
        { // NOTE: schema for validation
            body: apiBodySchema
        }
    );

export const serverConfig: Serve = {
    port: PORT,
    fetch: elysiaApp.fetch,
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
        await Bun.sleep(50);
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

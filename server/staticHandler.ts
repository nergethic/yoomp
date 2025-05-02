/**
 * @module server/staticHandler
 * Request handler for serving static files
 */

import path from 'node:path';
import { WWW_ROOT, INDEX_PATH, EDITOR_PATH } from './config.js';
import { createErrorResponse } from './response.js';

export async function handleStaticFileRequest(pathname: string): Promise<Response> {
    let filePath: string;

    if (pathname === "/") {
        filePath = INDEX_PATH;
    } else if (pathname === "/editor") {
        filePath = EDITOR_PATH;
    } else {
        const safeSuffix = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
        const requestedPath = path.join(WWW_ROOT, safeSuffix);

        if (!path.resolve(requestedPath).startsWith(path.resolve(WWW_ROOT))) {
            console.warn(`Attempt to access file outside WWW_ROOT: ${pathname}`);
            return createErrorResponse("Forbidden", 403);
        }
        filePath = requestedPath;
    }

    try {
        const requestedFile = Bun.file(filePath);
        if (await requestedFile.exists()) {
            return new Response(requestedFile, {
                headers: { 'Content-Type': requestedFile.type }
            });
        } else {
            console.log(`Static file not found: ${pathname} (resolved to ${filePath})`);
            return createErrorResponse("Not Found", 404);
        }
    } catch (error: any) {
         console.error(`Error accessing static file ${filePath}:`, error);
         return createErrorResponse("Internal Server Error accessing file", 500);
    }
}

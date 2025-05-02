import path from 'node:path';
import fs from 'node:fs/promises';
import { type Serve } from 'bun';

const PORT = Bun.env.PORT || 3000;
const __dirname = import.meta.dir;
const WWW_ROOT = path.join(__dirname, 'www');
const USER_DATA_ROOT = path.resolve(__dirname, 'userData');
const INDEX_PATH = path.join(WWW_ROOT, 'index.html');
const EDITOR_PATH = path.join(WWW_ROOT, 'editor', 'editor.html');

interface ApiRequestBody {
    action: string;
    path: string;
    data?: any;
}

try {
    await fs.mkdir(USER_DATA_ROOT, { recursive: true });
    console.log(`User data directory ensured: ${USER_DATA_ROOT}`);
} catch (err: any) {
    console.error(`FATAL: Failed to create essential user data directory ${USER_DATA_ROOT}:`, err);
    process.exit(1);
}

console.log(`Serving static files from: ${WWW_ROOT}`);
console.log(`User data operations restricted to: ${USER_DATA_ROOT}`);

function getSafeUserFilePath(userPath: string): string {
    if (!userPath || typeof userPath !== 'string') {
        throw new Error('Invalid path provided.');
    }

    const intendedPath = path.join(USER_DATA_ROOT, userPath);
    const resolvedPath = path.resolve(intendedPath);

    if (!resolvedPath.startsWith(USER_DATA_ROOT + path.sep) && resolvedPath !== USER_DATA_ROOT) {
         console.warn(`Path traversal attempt blocked: ${userPath} resolved to ${resolvedPath}`);
         throw new Error('Access denied: Invalid path.');
    }

    return resolvedPath;
}

function createErrorResponse(message: string, status: number = 500): Response {
    return new Response(JSON.stringify({ success: false, message: message }), {
       status: status,
       headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

async function handleStaticFileRequest(pathname: string): Promise<Response> {
    let filePath: string;
    if (pathname === "/") {
        filePath = INDEX_PATH;
    } else if (pathname === "/editor") {
        filePath = EDITOR_PATH;
    } else {
        const requestedPath = path.join(WWW_ROOT, pathname);
        if (!path.resolve(requestedPath).startsWith(path.resolve(WWW_ROOT))) {
            console.warn(`Attempt to access file outside WWW_ROOT: ${pathname}`);
            return createErrorResponse("Forbidden", 403);
        }
        filePath = requestedPath;
    }

    const requestedFile = Bun.file(filePath);
    if (await requestedFile.exists()) {
        return new Response(requestedFile, {
            headers: { 'Content-Type': requestedFile.type }
        });
    } else {
        console.log(`GET Not Found: ${pathname} (tried ${filePath})`);
        return createErrorResponse("Not Found", 404);
    }
}

async function handleApiFileRequest(req: Request): Promise<Response> {
    let requestData: ApiRequestBody;
    try {
         requestData = await req.json() as ApiRequestBody;
    } catch (e) {
         console.error("Failed to parse JSON body:", e);
         return createErrorResponse("Invalid JSON request body", 400);
    }

    const { action, path: userPath, data } = requestData;

    if (!action || !userPath) {
        return createErrorResponse('Missing action or path parameter', 400);
    }

    let safeFilePath: string;
    try {
        safeFilePath = getSafeUserFilePath(userPath);
    } catch (error: any) {
        return createErrorResponse(error.message, 400);
    }

    try {
        switch (action) {
            case 'CREATE_FILE':
                if (typeof data !== 'string') {
                    return createErrorResponse('Missing or invalid data for CREATE_FILE.', 400);
                }
                // Consider adding size limits or other validation here
                await Bun.write(safeFilePath, data);
                console.log(`File created successfully: ${safeFilePath}`);
                return new Response(JSON.stringify({ success: true, message: 'File created successfully!', action }), { status: 201, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

            case 'READ_FILE':
                const targetFile = Bun.file(safeFilePath);
                if (!(await targetFile.exists())) {
                    return createErrorResponse('File not found.', 404);
                }
                const fileContent = await targetFile.text();
                console.log(`File read successfully: ${safeFilePath}`);
                return new Response(JSON.stringify({ success: true, message: 'File read successfully!', action, data: fileContent }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

            default:
                console.log(`Action not recognized: ${action}`);
                return createErrorResponse('Request action not recognized!', 400);
        }
    } catch (fileError: any) {
        console.error(`File operation error for action "${action}" on path "${userPath}":`, fileError);
        return createErrorResponse(`File operation failed: ${fileError.message || 'Unknown error'}`, 500);
    }
}

const server = Bun.serve({
    port: PORT,

    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);
        const pathname = url.pathname;

        try {
            if (req.method === "GET") {
                return await handleStaticFileRequest(pathname);
            } else if (req.method === "POST" && pathname === "/api/file") {
                return await handleApiFileRequest(req);
            } else {
                 return createErrorResponse("Method Not Allowed or Not Found", 405);
            }
        } catch (error: any) {
            console.error(`Unhandled error in fetch handler for ${req.method} ${pathname}:`, error);
            const message = (error.message === 'Access denied: Invalid path.' || error.message === 'Invalid path provided.')
                            ? error.message
                            : 'Internal Server Error';
            return createErrorResponse(message, 500);
        }
    },
    error(error: Error): Response | undefined {
        console.error("Unhandled Bun.serve error:", error);
        return createErrorResponse("An unexpected server error occurred", 500);
    }
} satisfies Serve);

console.log(`Bun server listening on http://${server.hostname}:${server.port}`);
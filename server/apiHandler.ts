/**
 * @module server/apiHandler
 * Request handler for the file manipulation API (/api/file)
 */

import { getSafeUserFilePath } from './security.js';
import { createErrorResponse, createSuccessResponse } from './response.js';

/**
 * Interface describing the expected structure of the request body
 * for the /api/file endpoint.
 */
interface ApiRequestBody {
    action: 'CREATE_FILE' | 'READ_FILE'; // NOTE: Use literal types for known actions
    path: string; // NOTE: Relative path within USER_DATA_ROOT
    data?: string; // NOTE: Data is expected to be string for CREATE_FILE
}

export async function handleApiFileRequest(req: Request): Promise<Response> {
    let requestData: ApiRequestBody;
    try {
         if (req.method !== "POST")
             return createErrorResponse("Method Not Allowed", 405);
         requestData = await req.json() as ApiRequestBody;
    } catch (e) {
         console.error("Failed to parse JSON body for /api/file:", e);
         return createErrorResponse("Invalid JSON request body", 400);
    }

    if (!requestData || !requestData.action || !requestData.path)
        return createErrorResponse('Missing required fields (action, path) in request body.', 400);

    const { action, path: userPath, data } = requestData;

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
                    return createErrorResponse('Missing or invalid string data for CREATE_FILE.', 400);
                }

                await Bun.write(safeFilePath, data);
                console.log(`API: File created successfully: ${safeFilePath}`);
                return createSuccessResponse(null, 'File created successfully!', 201);

            case 'READ_FILE':
                const targetFile = Bun.file(safeFilePath);
                if (!(await targetFile.exists())) {
                    console.log(`API: File not found for reading: ${safeFilePath}`);
                    return createErrorResponse('File not found.', 404);
                }
                const fileContent = await targetFile.text();
                console.log(`API: File read successfully: ${safeFilePath}`);
                return createSuccessResponse({ fileContent }, 'File read successfully!');

            default:
                console.log(`API: Action not recognized: ${action}`);
                return createErrorResponse(`Request action '${action as any}' not recognized!`, 400);
        }
    } catch (fileError: any) {
        console.error(`API: File operation error for action "${action}" on path "${userPath}":`, fileError);
        return createErrorResponse(`File operation failed`, 500);
    }
}

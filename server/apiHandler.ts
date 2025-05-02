/**
 * @module server/apiHandler
 * Request handler for the file manipulation API (/api/file)
 */

import { getSafeUserFilePath } from './security.js';
import { createErrorResponse, createSuccessResponse } from './response.js';
import type { ApiRequestBodyType } from './apiTypes.js';

/**
 * Handles API requests after validation by Elysia
 * @param requestData The validated request body object
 * @returns A Promise resolving to a Response object
 */
export async function handleApiFileRequest(
    requestData: ApiRequestBodyType // Accepts the validated body object
): Promise<Response> {
    const { action, path: userPath, data } = requestData;

    let safeFilePath: string;
    try {
        safeFilePath = getSafeUserFilePath(userPath);
    } catch (error: any) {
        console.error(`Path validation failed for "${userPath}": ${error.message}`);
        return createErrorResponse(error.message, 400);
    }

    try {
        switch (action) {
            case 'CREATE_FILE':
                if (typeof data !== 'string') {
                    console.warn(`API: Missing data for CREATE_FILE action on path "${userPath}"`);
                    return createErrorResponse('Missing or invalid string "data" field required for CREATE_FILE action.', 400);
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
        }
    } catch (fileError: any) {
        console.error(`API: Unexpected file operation error for action "${action}" on path "${userPath}":`, fileError);
        throw new Error(`Unexpected file operation failed: ${fileError.message}`);
    }
}

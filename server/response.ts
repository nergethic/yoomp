/**
 * @module server/response
 * Utility functions for creating standardized HTTP responses
 */

export function createErrorResponse(message: string, status: number = 500): Response {
    console.error(`Responding with error [${status}]: ${message}`); // Log errors being sent
    return new Response(JSON.stringify({ success: false, message: message }), {
       status: status,
       headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

export function createSuccessResponse(data: any = null, message: string = 'Operation successful', status: number = 200): Response {
    const body: { success: boolean; message: string; data?: any } = {
        success: true,
        message: message,
    };
    if (data !== null) {
        body.data = data;
    }
     return new Response(JSON.stringify(body), {
        status: status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
     });
}

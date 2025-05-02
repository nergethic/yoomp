/**
 * @module server/security
 * Security-related utility functions
 */

import path from 'node:path';
import { USER_DATA_ROOT } from './config.js';

export function getSafeUserFilePath(userPath: string): string {
    if (!userPath || typeof userPath !== 'string' || userPath.includes('..'))
        throw new Error('Invalid path provided');

    const intendedPath = path.join(USER_DATA_ROOT, userPath);
    const resolvedPath = path.resolve(intendedPath);

    if (!resolvedPath.startsWith(USER_DATA_ROOT + path.sep) && resolvedPath !== USER_DATA_ROOT) {
         console.warn(`Path traversal attempt blocked: User path "${userPath}" resolved outside root "${USER_DATA_ROOT}" to "${resolvedPath}"`);
         throw new Error('Access denied: Invalid path.');
    }

    return resolvedPath;
}

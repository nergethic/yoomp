/**
 * @module server/config
 * Centralized configuration constants for the server
 */

import path from 'node:path';
import fs from 'node:fs/promises';

export const PORT = Bun.env.PORT || 3000;
export const __dirname = import.meta.dir;
export const WWW_ROOT = path.join(__dirname, '../www');
export const USER_DATA_ROOT = path.resolve(__dirname, '../userData');
export const INDEX_PATH = path.join(WWW_ROOT, 'index.html');
export const EDITOR_PATH = path.join(WWW_ROOT, 'editor', 'editor.html');

export async function ensureDirectoryExists(dirPath: string, isCritical: boolean = true): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory ensured: ${dirPath}`);
    } catch (err: any) {
        console.error(`${isCritical ? 'FATAL' : 'ERROR'}: Failed to create directory ${dirPath}:`, err);
        if (isCritical) {
            process.exit(1);
        }
    }
}

await ensureDirectoryExists(USER_DATA_ROOT, true);

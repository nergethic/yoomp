/**
 * @module server/apiTypes
 * Defines shared schemas and types for API requests/responses using Elysia and TypeBox.
 */

import { t } from 'elysia';

// NOTE: Schema for the /api/file request body
export const apiBodySchema = t.Object({
    action: t.Union(
        [t.Literal('CREATE_FILE'), t.Literal('READ_FILE')],
        { error: "Invalid action specified. Must be 'CREATE_FILE' or 'READ_FILE'." }
    ),
    path: t.String({
        minLength: 1,
        error: "The 'path' field is required and cannot be empty."
    }),
    data: t.Optional(t.String())
});

// NOTE: TypeScript Type derived from the Schema
// Gives static type checking in code based on the schema
export type ApiRequestBodyType = typeof apiBodySchema.static;

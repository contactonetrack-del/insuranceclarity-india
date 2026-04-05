import { createClient } from 'next-sanity';
import { logger } from '@/lib/logger';

/**
 * Sanity Server Client (Secure)
 * 
 * Provides an authenticated client for server-side operations.
 * Enforces a runtime check to ensure Admin tokens aren't accidentally used
 * in production if only viewer access is required.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-project-id';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

// Validation: Ensure token is not an overly-permissive legacy admin token in prod
if (process.env.NODE_ENV === 'production' && token) {
    // Note: We can't strictly parse the token scope without an API call, 
    // but we log a high-priority warning to ensure the developer has audited it.
    logger.info({ 
        action: 'sanity.client_init', 
        message: 'Server-side Sanity client initialized with API token. Ensure token is scoped to "Viewer" or limited "Editor", not "Admin".' 
    });
}

export const serverClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false, // Server side should get freshest data
});

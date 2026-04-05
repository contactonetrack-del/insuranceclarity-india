import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';
import { getSanityConfig } from './src/lib/security/env';

const sanityConfig = getSanityConfig();

export default defineConfig({
    name: 'insurance-clarity-studio',
    title: 'InsuranceClarity India Studio',

    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,

    basePath: '/studio',

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
});

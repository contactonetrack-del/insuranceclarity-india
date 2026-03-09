import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';

export default defineConfig({
    name: 'insurance-clarity-studio',
    title: 'InsuranceClarity India Studio',

    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-project-id',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

    basePath: '/studio',

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
});

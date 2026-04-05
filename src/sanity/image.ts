import { createImageUrlBuilder } from '@sanity/image-url';
import { dataset, projectId } from './client';

export const imageBuilder = createImageUrlBuilder({
    projectId: projectId || '',
    dataset: dataset || '',
});

export const urlForImage = (source: unknown) => {
    return imageBuilder?.image(source as any).auto('format').fit('max');
};

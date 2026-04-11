import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { dataset, projectId } from './client';

export const imageBuilder = createImageUrlBuilder({
    projectId: projectId || '',
    dataset: dataset || '',
});

export const urlForImage = (source: unknown) => {
    return imageBuilder?.image(source as SanityImageSource).auto('format').fit('max');
};

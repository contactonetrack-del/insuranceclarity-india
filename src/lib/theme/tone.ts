export type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type Surface = 'solid' | 'soft' | 'outline' | 'gradient'

const toneSurfaceClassMap: Record<Tone, Record<Surface, string>> = {
    brand: {
        solid: 'tone-brand-solid',
        soft: 'tone-brand-soft',
        outline: 'tone-brand-outline',
        gradient: 'tone-brand-gradient',
    },
    neutral: {
        solid: 'tone-neutral-solid',
        soft: 'tone-neutral-soft',
        outline: 'tone-neutral-outline',
        gradient: 'tone-neutral-gradient',
    },
    success: {
        solid: 'tone-success-solid',
        soft: 'tone-success-soft',
        outline: 'tone-success-outline',
        gradient: 'tone-success-gradient',
    },
    warning: {
        solid: 'tone-warning-solid',
        soft: 'tone-warning-soft',
        outline: 'tone-warning-outline',
        gradient: 'tone-warning-gradient',
    },
    danger: {
        solid: 'tone-danger-solid',
        soft: 'tone-danger-soft',
        outline: 'tone-danger-outline',
        gradient: 'tone-danger-gradient',
    },
    info: {
        solid: 'tone-info-solid',
        soft: 'tone-info-soft',
        outline: 'tone-info-outline',
        gradient: 'tone-info-gradient',
    },
}

export function resolveToneSurfaceClass(tone: Tone, surface: Surface): string {
    return toneSurfaceClassMap[tone][surface]
}

export function resolveToneDotClass(tone: Tone): string {
    if (tone === 'brand') return 'bg-accent/70'
    if (tone === 'neutral') return 'bg-border-strong/70'
    if (tone === 'success') return 'bg-success-500/80'
    if (tone === 'warning') return 'bg-warning-500/80'
    if (tone === 'danger') return 'bg-danger-500/80'
    return 'bg-info-500/80'
}


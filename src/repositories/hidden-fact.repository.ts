import { prisma } from '@/lib/prisma'
import { logDbQuery, logger } from '@/lib/logger'

export class HiddenFactRepository {
    async findAll() {
        const start = Date.now()
        try {
            const result = await prisma.hiddenFact.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            })
            logDbQuery('HiddenFact', 'findAll', Date.now() - start)
            return result
        } catch (error) {
            logger.error({ error, action: 'findAll', model: 'HiddenFact' }, 'Repository Error: HiddenFact.findAll')
            throw error
        }
    }
}

export const hiddenFactRepository = new HiddenFactRepository()

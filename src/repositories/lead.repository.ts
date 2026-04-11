import type { LeadStatus, Prisma } from '@prisma/client'
import { logDbQuery, logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export class LeadRepository {
    async findRecent(limit = 100) {
        const start = Date.now()
        try {
            const result = await prisma.lead.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
            })
            logDbQuery('Lead', 'findRecent', Date.now() - start, { limit })
            return result
        } catch (error) {
            logger.error({ error, action: 'findRecent', model: 'Lead', limit }, 'Repository Error: Lead.findRecent')
            throw error
        }
    }

    async updateStatus(id: string, status: LeadStatus) {
        const start = Date.now()
        try {
            const result = await prisma.lead.update({
                where: { id },
                data: { status },
            })
            logDbQuery('Lead', 'updateStatus', Date.now() - start, { id, status })
            return result
        } catch (error) {
            logger.error({ error, action: 'updateStatus', model: 'Lead', id, status }, 'Repository Error: Lead.updateStatus')
            throw error
        }
    }

    async create(data: Prisma.LeadCreateInput) {
        const start = Date.now()
        try {
            const result = await prisma.lead.create({ data })
            logDbQuery('Lead', 'create', Date.now() - start)
            return result
        } catch (error) {
            logger.error({ error, action: 'create', model: 'Lead' }, 'Repository Error: Lead.create')
            throw error
        }
    }

    async findNewsletterByEmail(email: string) {
        const start = Date.now()
        try {
            const result = await prisma.lead.findFirst({
                where: { email, insuranceType: 'NEWSLETTER' },
            })
            logDbQuery('Lead', 'findNewsletterByEmail', Date.now() - start, { email })
            return result
        } catch (error) {
            logger.error(
                { error, action: 'findNewsletterByEmail', model: 'Lead', email },
                'Repository Error: Lead.findNewsletterByEmail',
            )
            throw error
        }
    }

    async createNewsletterLead(data: {
        name: string;
        email: string;
        source: 'ORGANIC' | 'REFERRAL' | 'PAID' | 'SOCIAL' | 'EMAIL';
        notes?: string;
    }) {
        const start = Date.now()
        try {
            const result = await prisma.lead.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: 'N/A',
                    insuranceType: 'NEWSLETTER',
                    source: data.source,
                    status: 'NEW',
                    notes: data.notes,
                },
            })
            logDbQuery('Lead', 'createNewsletterLead', Date.now() - start, { email: data.email })
            return result
        } catch (error) {
            logger.error(
                { error, action: 'createNewsletterLead', model: 'Lead', email: data.email },
                'Repository Error: Lead.createNewsletterLead',
            )
            throw error
        }
    }

    async findScanNotifyLead(email: string, scanId: string) {
        const start = Date.now()
        try {
            const result = await prisma.lead.findFirst({
                where: {
                    email,
                    insuranceType: 'SCAN_NOTIFY',
                    notes: { startsWith: `scan:${scanId}` },
                },
                select: { id: true },
            })
            logDbQuery('Lead', 'findScanNotifyLead', Date.now() - start, { email, scanId })
            return result
        } catch (error) {
            logger.error(
                { error, action: 'findScanNotifyLead', model: 'Lead', email, scanId },
                'Repository Error: Lead.findScanNotifyLead',
            )
            throw error
        }
    }

    async createScanNotifyLead(params: {
        name: string;
        email: string;
        scanId: string;
        locale: 'en' | 'hi';
    }) {
        const start = Date.now()
        try {
            const result = await prisma.lead.create({
                data: {
                    name: params.name,
                    email: params.email,
                    phone: 'N/A',
                    insuranceType: 'SCAN_NOTIFY',
                    source: 'EMAIL',
                    status: 'NEW',
                    notes: `scan:${params.scanId} | locale:${params.locale}`,
                },
            })
            logDbQuery('Lead', 'createScanNotifyLead', Date.now() - start, { email: params.email, scanId: params.scanId })
            return result
        } catch (error) {
            logger.error(
                { error, action: 'createScanNotifyLead', model: 'Lead', email: params.email, scanId: params.scanId },
                'Repository Error: Lead.createScanNotifyLead',
            )
            throw error
        }
    }
}

export const leadRepository = new LeadRepository()

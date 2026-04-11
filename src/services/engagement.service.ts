import { leadRepository } from '@/repositories/lead.repository';
import { calculationRepository } from '@/repositories/calculation.repository';
import { advisorHistoryRepository } from '@/repositories/advisor-history.repository';

export async function createLead(data: {
    name: string;
    email: string;
    phone: string;
    insuranceType: string;
    source: 'ORGANIC' | 'REFERRAL' | 'PAID' | 'SOCIAL' | 'EMAIL';
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED' | 'LOST';
    notes?: string;
}) {
    return leadRepository.create(data);
}

export async function findNewsletterLeadByEmail(email: string) {
    return leadRepository.findNewsletterByEmail(email);
}

export async function createNewsletterLead(data: {
    name: string;
    email: string;
    source: 'ORGANIC' | 'REFERRAL' | 'PAID' | 'SOCIAL' | 'EMAIL';
    notes?: string;
}) {
    return leadRepository.createNewsletterLead(data);
}

export async function findScanNotifyLead(email: string, scanId: string) {
    return leadRepository.findScanNotifyLead(email, scanId);
}

export async function createScanNotifyLead(params: {
    name: string;
    email: string;
    scanId: string;
    locale: 'en' | 'hi';
}) {
    return leadRepository.createScanNotifyLead(params);
}

export async function createUserCalculation(params: {
    userId: string;
    type: string;
    inputData: unknown;
    result: unknown;
}) {
    return calculationRepository.createUserCalculation(params);
}

export async function listUserCalculationsByUserId(userId: string, limit = 20) {
    return calculationRepository.listUserCalculationsByUserId(userId, limit);
}

export async function findUserIdByEmail(email: string) {
    return calculationRepository.findUserIdByEmail(email);
}

export async function findAdvisorHistoryById(id: string, userId: string) {
    return advisorHistoryRepository.findHistoryByIdForUser(id, userId);
}

export async function listAdvisorHistories(userId: string) {
    return advisorHistoryRepository.listHistoriesByUser(userId);
}

export async function updateAdvisorHistory(params: {
    id: string;
    userId: string;
    title: string;
    messages: unknown[];
}) {
    return advisorHistoryRepository.updateHistory(params);
}

export async function createAdvisorHistory(params: {
    userId: string;
    title: string;
    messages: unknown[];
}) {
    return advisorHistoryRepository.createHistory(params);
}

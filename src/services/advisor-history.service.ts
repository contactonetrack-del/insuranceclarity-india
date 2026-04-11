import { advisorHistoryRepository } from '@/repositories/advisor-history.repository';

export async function findUserIdByEmail(email: string) {
    return advisorHistoryRepository.findUserIdByEmail(email);
}

export async function findAdvisorHistoryById(id: string, userId: string) {
    return advisorHistoryRepository.findHistoryByIdForUser(id, userId);
}

export async function listAdvisorHistories(userId: string) {
    return advisorHistoryRepository.listHistoriesByUser(userId);
}

export async function createAdvisorHistory(params: {
    userId: string;
    title: string;
    messages: unknown[];
}) {
    return advisorHistoryRepository.createHistory(params);
}

export async function updateAdvisorHistory(params: {
    id: string;
    userId: string;
    title: string;
    messages: unknown[];
}) {
    return advisorHistoryRepository.updateHistory(params);
}

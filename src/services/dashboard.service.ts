import { dashboardRepository } from '@/repositories/dashboard.repository';

export async function findDashboardUserByEmail(email: string) {
    return dashboardRepository.findUserByEmail(email);
}

export async function findDashboardSnapshotByEmail(email: string) {
    return dashboardRepository.findDashboardUserByEmail(email);
}

export async function listUserScans(userId: string) {
    return dashboardRepository.listScansByUserId(userId);
}

export async function listUserQuotes(userId: string) {
    return dashboardRepository.listQuotesByUserId(userId);
}

export async function listUserCalculations(userId: string) {
    return dashboardRepository.listCalculationsByUserId(userId);
}

export async function getUserDashboardCounts(userId: string) {
    return dashboardRepository.getDashboardCountsByUserId(userId);
}

import { calculationRepository } from '@/repositories/calculation.repository';

export async function findUserIdByEmail(email: string) {
    return calculationRepository.findUserIdByEmail(email);
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

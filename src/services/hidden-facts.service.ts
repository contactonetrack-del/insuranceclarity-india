import { hiddenFactRepository } from '@/repositories/hidden-fact.repository';

export async function listHiddenFacts() {
    return hiddenFactRepository.findAll();
}

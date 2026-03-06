'use server';

import { quoteService } from '../../lib/services/quote.service';

export interface ChatMessage {
    id: string;
    role: 'bot' | 'user';
    content: string;
    type?: 'question' | 'summary' | 'action';
    fieldToCollect?: string; // Links response to the application state payload
}

// Simulated User State
export interface ApplicationState {
    insuranceType?: string;
    coverageAmount?: number;
    applicantAge?: number;
    tobaccoUser?: boolean;
}

/**
 * Server Action for managing the Conversational State Machine.
 * This simulates an edge-deployed AI workflow (e.g. LangChain or Vercel AI SDK)
 * transitioning users through a dynamic form.
 */
export async function processChatStep(
    currentState: ApplicationState,
    userInput: string,
    stepNumber: number
): Promise<{
    newState: ApplicationState;
    nextMessage: ChatMessage;
    isComplete: boolean;
    quoteId?: string;
}> {

    const newState = { ...currentState };

    // Simulate Network Latency mapping to LLM inference
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple Rule-Based State Machine for demo purposes
    switch (stepNumber) {
        case 1:
            return {
                newState,
                nextMessage: {
                    id: crypto.randomUUID(),
                    role: 'bot',
                    content: `Hello! I'm your AI Underwriter. First, what type of coverage are you looking for today? (e.g., Term Life, Health, Motor)`,
                    fieldToCollect: 'insuranceType'
                },
                isComplete: false
            };
        case 2:
            newState.insuranceType = userInput;
            return {
                newState,
                nextMessage: {
                    id: crypto.randomUUID(),
                    role: 'bot',
                    content: `Excellent choice looking into ${userInput}. Roughly how much coverage were you hoping to secure?`,
                    fieldToCollect: 'coverageAmount'
                },
                isComplete: false
            };
        case 3:
            newState.coverageAmount = parseInt(userInput.replace(/\D/g, '')) || 250000;
            return {
                newState,
                nextMessage: {
                    id: crypto.randomUUID(),
                    role: 'bot',
                    content: `Got it. To help tailor the pricing, what is your current age?`,
                    fieldToCollect: 'applicantAge'
                },
                isComplete: false
            };
        case 4:
            newState.applicantAge = parseInt(userInput) || 35;
            return {
                newState,
                nextMessage: {
                    id: crypto.randomUUID(),
                    role: 'bot',
                    content: `Lastly, have you used any tobacco products in the last 12 months?`,
                    fieldToCollect: 'tobaccoUser'
                },
                isComplete: false
            };
        default:
            newState.tobaccoUser = userInput.toLowerCase().includes('yes');

            // Generate the Quote utilizing our Hexagonal Service (Phase 3/5)
            try {
                const quoteResult = await quoteService.generateQuote({
                    insuranceType: newState.insuranceType || 'TERM_LIFE',
                    coverageAmount: newState.coverageAmount || 250000,
                    applicantAge: newState.applicantAge || 35,
                    tobaccoUser: newState.tobaccoUser
                });

                return {
                    newState,
                    nextMessage: {
                        id: crypto.randomUUID(),
                        role: 'bot',
                        content: `I've analyzed your responses and generated a binding quote. Your tracking ID is ${quoteResult.documentJobId}. We are rendering your provisional PDF policy now!`,
                        type: 'summary'
                    },
                    isComplete: true,
                    quoteId: (quoteResult.quote as any).id
                };
            } catch (e) {
                return {
                    newState,
                    nextMessage: {
                        id: crypto.randomUUID(),
                        role: 'bot',
                        content: `I apologize, but I encountered an error finalizing your quote constraints. Let's try resetting.`,
                        type: 'summary'
                    },
                    isComplete: false
                };
            }
    }
}

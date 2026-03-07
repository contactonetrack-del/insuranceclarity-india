'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, ArrowUp, Zap, CheckCircle2 } from 'lucide-react';
import { processChatStep, ChatMessage, ApplicationState } from '../../app/actions/advisor-actions';

export default function AiChatWizard() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Internal State Machine Trackers
    const [step, setStep] = useState(1);
    const [appState, setAppState] = useState<ApplicationState>({});
    const [isComplete, setIsComplete] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize the conversation on mount
    useEffect(() => {
        const initChat = async () => {
            setIsTyping(true);
            const res = await processChatStep({}, '', 1);
            setMessages([res.nextMessage]);
            setIsTyping(false);
        };
        initChat();
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim() || isTyping || isComplete) return;

        const currentInput = inputValue;
        setInputValue('');

        // Add User Message
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: currentInput
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Process Server Action (Edge Function)
            // By default, we expect to go to step + 1, but the server might override this
            // if validation fails and we need to reprompt on the same step.
            const expectedNextStep = step + 1;
            const res = await processChatStep(appState, currentInput, expectedNextStep);

            setAppState(res.newState);
            // Crucial: Use the server's overridden step if provided (e.g., failed validation)
            if ('nextStepNumber' in res && typeof res.nextStepNumber === 'number') {
                setStep(res.nextStepNumber);
            } else {
                setStep(expectedNextStep);
            }
            setMessages(prev => [...prev, res.nextMessage]);

            if (res.isComplete) {
                setIsComplete(true);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'bot',
                content: 'Network error communicating with the underwriting engine.',
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-3xl border border-default 
                      bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-glow overflow-hidden relative">

            {/* Header */}
            <div className="px-6 py-4 border-b border-default bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center shadow-md animate-pulse-slow">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-theme-primary flex items-center gap-2">
                            AI Underwriter <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </h3>
                        <p className="text-xs text-theme-muted">Powered by Dynamic Rules Engine</p>
                    </div>
                </div>
                {isComplete && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-fade-in-up" />}
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className="shrink-0 mt-1">
                                {msg.role === 'user' ? (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-default shadow-sm text-lg">
                                        🛡️
                                    </div>
                                )}
                            </div>

                            {/* Bubble */}
                            <div className={`px-5 py-3.5 rounded-2xl ${msg.role === 'user'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 rounded-tr-sm'
                                : 'bg-white dark:bg-slate-800 border border-default text-theme-secondary shadow-sm rounded-tl-sm'
                                } ${msg.type === 'summary' ? 'ring-2 ring-accent border-transparent bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30' : ''}`}>
                                <p className="leading-relaxed text-[15px]">{msg.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-fade-in-up">
                        <div className="flex gap-3 max-w-[85%] flex-row">
                            <div className="shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-default shadow-sm">
                                    <Bot className="w-4 h-4 text-slate-500" />
                                </div>
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-default shadow-sm rounded-tl-sm flex gap-1.5 items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-default">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isTyping || isComplete}
                        placeholder={isComplete ? "Chat completed." : "Type your response..."}
                        className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-default 
                                 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed text-theme-primary"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping || isComplete}
                        className="absolute right-2.5 p-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover 
                                 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors shadow-sm"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                </form>

                {/* State Debugging (Hidden in Prod) */}
                <div className="mt-3 text-[10px] text-theme-muted font-mono flex gap-4 justify-center">
                    <span>STEP: {step}/5</span>
                    <span>STATE: {JSON.stringify(appState)}</span>
                </div>
            </div>
        </div>
    );
}

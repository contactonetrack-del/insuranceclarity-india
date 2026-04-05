export function AdvisorSuggestionChips({ handleSend }: { handleSend: (text: string) => void }) {
    const chips = ['What is term insurance?', 'Health insurance exclusions', 'How to claim?', 'Compare policies']

    return (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-slate-50/50 dark:bg-slate-900/50">
            {chips.map(chip => (
                <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-default
                             rounded-full text-theme-secondary hover:border-accent hover:text-accent transition-all shadow-sm"
                >
                    {chip}
                </button>
            ))}
        </div>
    )
}

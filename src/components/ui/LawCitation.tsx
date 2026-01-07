'use client'

import { Scale, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LawCitationProps {
    act: string
    section: string
    year?: string
    description?: string
    className?: string
}

export default function LawCitation({ act, section, year, description, className }: LawCitationProps) {
    return (
        <div className={cn("inline-flex flex-col group", className)}>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 
                          px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-serif italic">
                    {section}, {act} <span className="text-slate-400 font-sans not-italic">{year && `(${year})`}</span>
                </span>
            </div>
            {description && (
                <div className="mt-2 hidden group-hover:block transition-all duration-200">
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl max-w-xs relative border border-slate-700">
                        {/* Tooltip Arrow */}
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-slate-700"></div>
                        <div className="flex gap-2">
                            <BookOpen className="w-4 h-4 flex-shrink-0 text-slate-400" />
                            <p className="leading-relaxed opacity-90">{description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

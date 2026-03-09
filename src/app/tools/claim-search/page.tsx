"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Gavel,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    BookOpen,
    MessageSquare,
    ShieldAlert,
    Loader2,
    TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

interface ClaimCase {
    id: string;
    category: string;
    title: string;
    status: string;
    amount: number;
    issue: string;
    details: string;
    outcome: string;
    lesson: string;
}

export default function ClaimSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ClaimCase[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Health Insurance", "Life Insurance", "Motor Insurance"];

    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setIsLoading(true);

        try {
            const resp = await fetch(`/api/search/claims?q=${encodeURIComponent(query)}&category=${activeCategory}`);
            const data = await resp.json();
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory]);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="max-w-3xl mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-sm rounded-full mb-4 font-bold border border-emerald-500/20">
                        <Gavel className="w-4 h-4" />
                        INSURANCE CASE LAW SEARCH
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary leading-tight">
                        Learn from <span className="text-gradient">Real-Life Claim</span> Journeys
                    </h1>
                    <p className="text-theme-muted mt-6 text-lg leading-relaxed">
                        Search 1,000+ past insurance claims, ombudsman rulings, and consumer court
                        decisions to see why claims get rejected and how to stay protected.
                    </p>
                </header>

                {/* Search & Filter Bar */}
                <section className="mb-16 space-y-8">
                    <form onSubmit={handleSearch} className="max-w-4xl relative group">
                        <div className="absolute inset-0 bg-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />
                        <div className="relative glass-strong rounded-[2.5rem] p-3 border border-default flex items-center shadow-2xl">
                            <div className="p-4 text-theme-muted">
                                <Search className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for keywords like 'Cataract', 'Drink & Drive', 'Heart Bypass'..."
                                className="flex-1 bg-transparent border-none outline-none text-lg text-theme-primary placeholder:text-theme-muted py-4 px-2"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-[2rem] font-bold transition-all active:scale-95 shadow-lg shadow-accent/20"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "AI Search"}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${activeCategory === cat
                                    ? "bg-theme-primary text-white border-theme-primary shadow-xl"
                                    : "glass border-default text-theme-muted hover:border-accent"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        {isLoading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(n => <div key={n} className="h-64 glass-strong rounded-[2.5rem] animate-pulse" />)}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-20 glass-strong rounded-[3rem] border border-dashed border-default">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <TrendingUp className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-theme-primary">No cases found</h3>
                                <p className="text-theme-muted max-w-sm mx-auto mt-2">Try searching for broader terms or changing categories.</p>
                            </div>
                        ) : (
                            results.map((item, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={item.id}
                                    className="glass-strong rounded-[2.5rem] p-10 border border-default hover:border-accent/30 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity text-accent">
                                        <TrendingUp className="w-32 h-32" />
                                    </div>

                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            item.status === 'Partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                            }`}>
                                            {item.status} Verdict
                                        </span>
                                        <span className="text-[10px] text-theme-muted font-bold uppercase tracking-widest">• {item.category}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-theme-primary group-hover:text-accent transition-colors relative z-10 mb-4">{item.title}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 mb-8">
                                        <div className="space-y-3">
                                            <p className="text-xs font-black text-theme-muted uppercase flex items-center gap-2">
                                                <ShieldAlert className="w-3 h-3" /> The Issue
                                            </p>
                                            <p className="text-sm text-theme-secondary leading-relaxed">{item.issue}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs font-black text-theme-muted uppercase flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> The Outcome
                                            </p>
                                            <p className="text-sm text-theme-secondary leading-relaxed">{item.outcome}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10 relative z-10">
                                        <p className="text-xs font-black text-accent uppercase flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4" /> Principal Lesson Learned
                                        </p>
                                        <p className="text-theme-primary font-medium leading-relaxed italic">
                                            &quot;{item.lesson}&quot;
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-strong rounded-[2.5rem] p-8 border border-default shadow-xl sticky top-32">
                            <h4 className="text-xl font-bold text-theme-primary mb-6">Expert FAQ</h4>
                            <div className="space-y-6">
                                <FAQItem
                                    q="What is the Ombudsman?"
                                    a="A neutral mediator between you and the insurer for claims up to ₹30 Lakhs."
                                />
                                <FAQItem
                                    q="Rejected vs Repudiated?"
                                    a="Rejected is a temporary bar for missing docs; Repudiated is a flat 'No' based on policy terms."
                                />
                                <FAQItem
                                    q="Can I appeal after 2 years?"
                                    a="Yes, but you usually have to explain the delay to the courts or ombudsman."
                                />
                            </div>

                            <div className="mt-10 p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageSquare className="w-16 h-16" />
                                </div>
                                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Stuck with a claim?</p>
                                <h5 className="font-bold text-lg mb-4">Talk to a Neutral Claims Specialist</h5>
                                <button className="flex items-center gap-2 text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                                    Request a Callback <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FAQItem({ q, a }: { q: string, a: string }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-bold text-theme-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent" /> {q}
            </p>
            <p className="text-xs text-theme-muted leading-relaxed">{a}</p>
        </div>
    );
}

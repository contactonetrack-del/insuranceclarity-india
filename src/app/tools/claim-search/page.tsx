"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useTranslations } from "next-intl";

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
    const t = useTranslations("tools.claimSearch");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ClaimCase[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = useMemo(
        () => ([
            { value: "All", label: t("categories.all") },
            { value: "Health Insurance", label: t("categories.health") },
            { value: "Life Insurance", label: t("categories.life") },
            { value: "Motor Insurance", label: t("categories.motor") },
        ]),
        [t],
    );

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

    const getStatusToneClass = (status: string) => {
        const normalized = status.toLowerCase();
        if (normalized === "approved") return "bg-success-500/10 text-success-500 border-success-500/20";
        if (normalized === "partial") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    };

    const getStatusLabel = (status: string) => {
        const normalized = status.toLowerCase();
        if (normalized === "approved") return t("status.approved");
        if (normalized === "partial") return t("status.partial");
        return t("status.rejected");
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="max-w-3xl mb-12">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
                        <Gavel className="w-4 h-4" />
                        {t("hero.badge")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-theme-primary leading-tight">
                        {t("hero.titlePrefix")} <span className="text-gradient">{t("hero.titleHighlight")}</span> {t("hero.titleSuffix")}
                    </h1>
                    <p className="text-theme-muted mt-6 text-lg leading-relaxed">
                        {t("hero.subtitle")}
                    </p>
                </header>

                <section className="mb-16 space-y-8">
                    <form onSubmit={handleSearch} className="max-w-4xl relative group">
                        <div className="absolute inset-0 bg-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />
                        <div className="relative glass-strong rounded-[2.5rem] p-3 border border-default flex items-center shadow-2xl">
                            <div className="p-4 text-theme-muted">
                                <Search className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                placeholder={t("search.placeholder")}
                                className="flex-1 bg-transparent border-none outline-none text-lg text-theme-primary placeholder:text-theme-muted py-4 px-2"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-[2rem] font-bold transition-all active:scale-95 shadow-lg shadow-accent/20"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("search.action")}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${activeCategory === cat.value
                                    ? "bg-theme-primary text-white border-theme-primary shadow-xl"
                                    : "glass border-default text-theme-muted hover:border-accent"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        {isLoading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map((n) => <div key={n} className="h-64 glass-strong rounded-[2.5rem] animate-pulse" />)}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-20 glass-strong rounded-[3rem] border border-dashed border-default">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <TrendingUp className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-theme-primary">{t("empty.title")}</h3>
                                <p className="text-theme-muted max-w-sm mx-auto mt-2">{t("empty.description")}</p>
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
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusToneClass(item.status)}`}>
                                            {getStatusLabel(item.status)} {t("status.verdictSuffix")}
                                        </span>
                                        <span className="text-[10px] text-theme-muted font-bold uppercase tracking-widest">- {item.category}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-theme-primary group-hover:text-accent transition-colors relative z-10 mb-4">{item.title}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 mb-8">
                                        <div className="space-y-3">
                                            <p className="text-xs font-black text-theme-muted uppercase flex items-center gap-2">
                                                <ShieldAlert className="w-3 h-3" /> {t("result.issueTitle")}
                                            </p>
                                            <p className="text-sm text-theme-secondary leading-relaxed">{item.issue}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs font-black text-theme-muted uppercase flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-success-500" /> {t("result.outcomeTitle")}
                                            </p>
                                            <p className="text-sm text-theme-secondary leading-relaxed">{item.outcome}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10 relative z-10">
                                        <p className="text-xs font-black text-accent uppercase flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4" /> {t("result.lessonTitle")}
                                        </p>
                                        <p className="text-theme-primary font-medium leading-relaxed italic">
                                            &quot;{item.lesson}&quot;
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-strong rounded-[2.5rem] p-8 border border-default shadow-xl sticky top-32">
                            <h4 className="text-xl font-bold text-theme-primary mb-6">{t("faq.title")}</h4>
                            <div className="space-y-6">
                                <FAQItem
                                    q={t("faq.items.ombudsman.q")}
                                    a={t("faq.items.ombudsman.a")}
                                />
                                <FAQItem
                                    q={t("faq.items.rejectedVsRepudiated.q")}
                                    a={t("faq.items.rejectedVsRepudiated.a")}
                                />
                                <FAQItem
                                    q={t("faq.items.appealAfterTwoYears.q")}
                                    a={t("faq.items.appealAfterTwoYears.a")}
                                />
                            </div>

                            <div className="mt-10 p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageSquare className="w-16 h-16" />
                                </div>
                                <p className="mb-2 text-xs font-black uppercase tracking-widest text-accent">{t("cta.badge")}</p>
                                <h5 className="font-bold text-lg mb-4">{t("cta.title")}</h5>
                                <button className="flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-accent">
                                    {t("cta.action")} <ArrowRight className="w-4 h-4" />
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

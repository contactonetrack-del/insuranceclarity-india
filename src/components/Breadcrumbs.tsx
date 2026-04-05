import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    const items = segments.map((seg, idx) => {
        const href = '/' + segments.slice(0, idx + 1).join('/');
        // humanize segment
        const name = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return { name, item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://insuranceclarity.in'}${href}` };
    });

    if (items.length === 0) return null;

    return (
        <>
            <nav aria-label="Breadcrumb" className="text-sm text-theme-secondary mb-4">
                <ol className="flex flex-wrap items-center gap-1">
                    <li>
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                    </li>
                    {segments.map((seg, idx) => {
                        const href = '/' + segments.slice(0, idx + 1).join('/');
                        const name = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                        const isLast = idx === segments.length - 1;
                        return (
                            <li key={href} className="flex items-center gap-1">
                                <span aria-hidden="true">/</span>
                                {isLast ? (
                                    <span className="font-medium text-theme-primary">{name}</span>
                                ) : (
                                    <Link href={href} className="hover:underline">
                                        {name}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}

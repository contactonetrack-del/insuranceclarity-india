import { useEffect, useRef } from 'react';

export function useCalculationSave(type: string, inputData: Record<string, unknown>, result: Record<string, unknown>, debounceMs: number = 2000) {
    const lastSavedString = useRef('');

    useEffect(() => {
        const handler = setTimeout(async () => {
            const currentString = JSON.stringify({ inputData, result });
            if (currentString === lastSavedString.current) return;
            
            try {
                const res = await fetch('/api/calculations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type,
                        inputData,
                        result
                    })
                });

                if (res.ok) {
                    lastSavedString.current = currentString;
                }
            } catch (err) {
                console.error(`Failed to save ${type} calculation`, err);
            }
        }, debounceMs);

        return () => clearTimeout(handler);
    }, [type, inputData, result, debounceMs]);
}

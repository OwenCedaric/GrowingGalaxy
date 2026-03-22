import React, { useEffect, useState } from 'react';

export default function LiveTime() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
            setTime(`${h}:${m}:${s} — ${tz}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <span
            style={{
                fontVariantNumeric: 'tabular-nums',
            }}
        >
            {time}
        </span>
    );
}

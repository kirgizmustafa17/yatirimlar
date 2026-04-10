import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SOURCES = {
    '22-ayar-bilezik': { url: 'https://altin.doviz.com/22-ayar-bilezik', key: '22-ayar-bilezik' },
    'gumus': { url: 'https://altin.doviz.com/gumus', key: 'gumus' },
    'fiziksel-altin': { url: 'https://altin.doviz.com/kapalicarsi/gram-altin', key: '20-gram-altin' },
    'gram-altin': { url: 'https://altin.doviz.com/dunya-katilim/gram-altin', key: '38-gram-altin' }
};

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
};

function parsePrice(str) {
    if (!str) return null;
    const cleaned = str.trim().replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
}

async function fetchPrice(sourceItem) {
    try {
        const response = await fetch(sourceItem.url, {
            headers: FETCH_HEADERS,
            cache: 'no-store',
            next: { revalidate: 0 }
        });
        if (!response.ok) return null;
        const html = await response.text();
        const regex = new RegExp(`data-socket-key="${sourceItem.key}"[^>]*>\\s*([\\d.,]+)`);
        const match = html.match(regex);
        return match ? parsePrice(match[1]) : null;
    } catch (e) {
        console.error(`Error fetching ${sourceItem.url}:`, e);
        return null;
    }
}

export async function GET() {
    try {
        const keys = Object.keys(SOURCES);
        const promises = keys.map(k => fetchPrice(SOURCES[k]));
        const results = await Promise.all(promises);

        const data = {
            updateDate: new Date().toISOString()
        };

        keys.forEach((k, index) => {
            data[k] = results[index];
        });

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prices', detail: error.message },
            { status: 500 }
        );
    }
}

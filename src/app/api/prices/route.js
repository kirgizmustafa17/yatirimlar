import { NextResponse } from 'next/server';

const GRAM_ALTIN_URL = 'https://bigpara.hurriyet.com.tr/altin/gram-altin-fiyati/';
const AYAR22_URL = 'https://bigpara.hurriyet.com.tr/altin/22-ayar-bilezik-fiyati/';

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
};

// Helper: parse Turkish-formatted number "6.822,89" -> 6822.89
function parsePrice(str) {
    if (!str) return null;
    const cleaned = str.trim().replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
}

// Extract the first <span class="value dw">...</span> from HTML
function extractValue(html) {
    // Matches: <span class="value dw">6.822,89</span>
    const match = html.match(/<span[^>]*class="value dw"[^>]*>([\d.,]+)<\/span>/);
    return match ? match[1] : null;
}

// Extract update time from page (e.g. "17:01")
function extractTime(html) {
    // Bigpara typically shows time like: <span class="time">17:01</span>
    const match = html.match(/<span[^>]*class="time"[^>]*>(\d{2}:\d{2})<\/span>/);
    return match ? match[1] : null;
}

async function fetchPage(url) {
    const response = await fetch(url, {
        headers: FETCH_HEADERS,
        next: { revalidate: 0 }, // Always fresh - caching handled at caller level
    });
    if (!response.ok) {
        throw new Error(`Fetch failed for ${url}: ${response.status}`);
    }
    return response.text();
}

export async function GET() {
    try {
        // Fetch both pages in parallel
        const [gramHtml, ayar22Html] = await Promise.all([
            fetchPage(GRAM_ALTIN_URL),
            fetchPage(AYAR22_URL),
        ]);

        const gramPriceRaw = extractValue(gramHtml);
        const ayar22PriceRaw = extractValue(ayar22Html);

        const gramPrice = parsePrice(gramPriceRaw);
        const ayar22Price = parsePrice(ayar22PriceRaw);

        // Try to get update time from gram altın page
        const updateTime = extractTime(gramHtml);

        // Build updateDate
        let updateDate = new Date().toISOString();
        if (updateTime && updateTime.includes(':')) {
            try {
                const [hours, minutes] = updateTime.split(':');
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const trTime = `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+03:00`;
                updateDate = new Date(trTime).toISOString();
            } catch (e) {
                console.error('Time parsing error', e);
            }
        }

        const data = {
            'gram-altin': gramPrice,
            '22-ayar-bilezik': ayar22Price,
            updateDate,
        };

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prices', detail: error.message },
            { status: 500 }
        );
    }
}

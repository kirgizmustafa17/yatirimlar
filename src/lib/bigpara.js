export async function getGoldPrices() {
    const URL = 'https://bigpara.hurriyet.com.tr/altin/';

    try {
        const response = await fetch(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error(`Bigpara fetch failed: ${response.status}`);
        }

        const html = await response.text();
        const regex = /<li class="cell009">(.*?)<\/li>/g;
        const matches = [];
        let match;

        while ((match = regex.exec(html)) !== null) {
            matches.push(match[1]);
        }

        const goldPrice = matches[4];
        const goldTime = matches[7];
        const braceletPrice = matches[8];
        const silverPrice = matches[92];

        const parsePrice = (str) => {
            if (!str) return null;
            return parseFloat(str.replace(/\./g, '').replace(',', '.'));
        };

        const data = {
            'gram-altin': parsePrice(goldPrice),
            '22-ayar-bilezik': parsePrice(braceletPrice),
            'gumus': parsePrice(silverPrice),
            'updateDate': new Date().toISOString()
        };

        if (goldTime && goldTime.includes(':')) {
            try {
                const [hours, minutes] = goldTime.split(':');
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const trTime = `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+03:00`;
                data.updateDate = new Date(trTime).toISOString();
            } catch (e) {
                console.error('Time parsing error', e);
            }
        }

        return data;
    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}

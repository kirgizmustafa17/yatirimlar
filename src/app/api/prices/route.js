import { NextResponse } from 'next/server';
import { getGoldPrices } from '@/lib/bigpara';

export async function GET() {
    const data = await getGoldPrices();

    if (!data) {
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

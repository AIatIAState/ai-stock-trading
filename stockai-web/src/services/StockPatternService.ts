import { API_BASE, type Bar} from "./api.ts";

export interface StockPattern {
    startDate: Date,
    trendLength: number,
    similarityScore: number,
}
export async function fetchStockPatterns(stockSymbol: string, timeframe: "daily", trendLength?: number, similarityScore?: number) : Promise<{results: StockPattern[]}> {
    try {
        const params = new URLSearchParams({
            symbol: stockSymbol,
            timeframe: timeframe,
            trend_length: trendLength ? trendLength.toString() : "7",
            similarity_score: similarityScore ? similarityScore.toString() : "95"
        })
        const response = await fetch(`${API_BASE}/api/getPatterns?${params.toString()}`)
        response.json()['result'].forEach((item: never) => {
            console.log(item)
        })
        return response.json() as Promise<{results: StockPattern[]}>
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch symbols')
    }
}
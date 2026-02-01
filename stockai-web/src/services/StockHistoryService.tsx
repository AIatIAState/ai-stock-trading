import {type SymbolInfo, API_BASE, type Bar} from "./api.ts";

export async function fetchStockSymbols(query: string, limit: number = 25): Promise<SymbolInfo[]> {
    try {
        const params = new URLSearchParams({ q: query, limit: String(limit) })
        const response = await fetch(`${API_BASE}/api/symbols?${params.toString()}`)
        return response.json()
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch symbols')
    }
}
export async function fetchStockHistory(stockSymbol: string, timeframe: "daily", limit?: string) : Promise<{results: Bar[]}> {
    try {
        const limitString = limit ? limit : '12000'
        const params = new URLSearchParams({
            symbol: stockSymbol,
            timeframe: timeframe,
            limit: limitString,
            order: "asc"})
        const response = await fetch(`${API_BASE}/api/bars?${params.toString()}`)
        return response.json() as Promise<{results: Bar[]}>
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch symbols')
    }
}
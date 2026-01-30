import {fetchStockHistory, fetchStockSymbols} from "../services/StockHistoryService.tsx";
import {type ReactElement, useState} from "react";
import Box from "@mui/material/Box";
import { Button, Card, CardContent, Stack, TextField, Typography} from "@mui/material";
import type {Bar, SymbolInfo} from "../services/api.ts";
import Grid from "@mui/material/Grid";


export interface StockSearchProps {
    setBars: (data: Bar[]) => void
}
export default function StockSearch(props: StockSearchProps) {
    const [symbolData, setSymbolData] = useState<SymbolInfo[]>([])
    const [searchValue, setSearchValue] = useState<string>("")

    function getAutocompleteSymbols(symbolList: SymbolInfo[]) {
        if (searchValue == "" && symbolData.length === 0){
            return <Stack spacing={1}>
                <br/>
                <Typography color="text.secondary">Search for a ticker to view its data.</Typography>
                <br/>
            </Stack>
        }
        if (searchValue == ""){
            return <></>
        }
        const symbolSelectElements : ReactElement[] = []
        symbolList.forEach((symbol) => {symbolSelectElements.push(
            <Button
                key={symbol.symbol}
                variant={'outlined'}
                onClick={() => {
                    getSymbolData(symbol.symbol)
                    setSearchValue("")
                }}
                sx={{ justifyContent: 'space-between' }}
            >
                <Box width={'120px'}sx={{ textAlign: 'left' }}>
                    <Typography>{symbol.symbol}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {(symbol.exchange || 'N/A').toUpperCase()} | {symbol.asset_type ?? 'asset'}
                    </Typography>
                </Box>
            </Button>
        )})
        return <>
            <Typography color="text.primary">Matched Tickers</Typography>
            <br/>
            <Grid container spacing={4}>
                {symbolSelectElements}
             </Grid>
            <br/>
            </>
    }

    async function updateAutocompleteSymbols(searchValue: string){
        setSymbolData((await fetchStockSymbols(searchValue, 12))['results'])
    }
    async function getSymbolData(symbol: string) {
        setSearchValue("")
        const response = await fetchStockHistory(symbol, "daily")
        props.setBars(response.results)

    }



    return (
        <>
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
                            <TextField
                                label="Symbol search"
                                value={searchValue}
                                placeholder="AAPL, TSLA, SPY"
                                fullWidth
                                onChange={async (e) => {
                                    setSearchValue(e.target.value)
                                    if(e.target.value == '') {
                                        return
                                    }
                                    await updateAutocompleteSymbols(e.target.value)
                                }}
                            />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
            <Card style={{paddingLeft: '16px', paddingRight: '16px'}}>
                {getAutocompleteSymbols(symbolData)}
            </Card>
        </>

    );
}

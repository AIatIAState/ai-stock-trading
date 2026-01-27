import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {fetchStockHistory, fetchStockSymbols} from "../services/StockHistoryService.tsx";
import {type ReactElement, useState} from "react";
import Box from "@mui/material/Box";
import {List, Typography } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import type {LineSeries} from "@mui/x-charts/LineChart";
import EarningsScatterChart, {type EarningsScatterChartProps} from "./EarningsScatterChart.tsx";

function getDateFromYYYYMMDD(yyyymmdd: string): string {
    const year = parseInt(yyyymmdd.substring(0, 4), 10);
    const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
    const day = parseInt(yyyymmdd.substring(6, 8), 10);

    return new Date(Date.UTC(year, month, day)).toLocaleDateString();
}

export default function StockSearch() {
    const [searchSymbols, setSearchSymbols] = useState<Array<string>>([]);
    const [data, setData] = useState<EarningsScatterChartProps>(null as unknown as EarningsScatterChartProps);

    function autoCompleteDropdown(symbols: Array<string>) {
        if(searchSymbols.length == 0) {
            return <></>
        }
        const dropdownElements : ReactElement[] = []
        symbols.forEach((symbol) => {
            dropdownElements.push(<ListItemButton key={symbol} onClick={async ()=> {
                await getSymbolData(symbol);
            }}>
                <Box>
                    <Typography>
                        {symbol}
                    </Typography>
                </Box>
            </ListItemButton>);
        })
        return <List  sx={{position: 'absolute',zIndex: 9999,bgcolor: 'background.paper', width: '100%'}}>
            {dropdownElements}
        </List>
    }

    function getDataTable(series: EarningsScatterChartProps) {
        if (series === null) {
            return <></>
        }

        return <EarningsScatterChart {...series}/>
    }

    async function getSymbolData(symbol: string) {
        console.log("Fetching data for symbol: " + symbol)
        setSearchSymbols([])
        const response = await fetchStockHistory(symbol, "daily")

        const data: number[] = []
        const x_axis: string[] = []
        response.results.forEach((item: any) => {
            data.push(item.open)
            x_axis.push(item.date)
        })
        setData({
            series: [
                {
                    id: symbol,
                    label: symbol,
                    showMark: false,
                    curve: 'linear',
                    stack: 'total',
                    area: true,
                    stackOrder: 'ascending',
                    data: data,
                } as LineSeries
            ],
            x_axis: x_axis,
            heading: `Stock Prices for ${symbol}`,
            percent: 0,
        })
        console.log(data)
        console.log(x_axis)

    }



    return (
        <>
            <FormControl variant="outlined" fullWidth={true} key={'stock-search-control'}>
                <OutlinedInput
                    size="small"
                    id="search"
                    placeholder="Search with stock symbol..."
                    sx={{ flexGrow: 1 }}
                    startAdornment={
                        <InputAdornment position="start" sx={{ color: 'text.primary' }}>
                            <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                    }
                    inputProps={{
                        'aria-label': 'search',
                    }}
                    onChange={async (e) => {
                        if(e.target.value == '') {
                            return
                        }
                        const result = await fetchStockSymbols(e.target.value, 5)

                        const completeSet : string[] = []
                        result['results'].forEach((item: any) => {
                            completeSet.push(item['symbol'])
                        })
                        setSearchSymbols(completeSet)
                    }}
                    onFocus={async (e) => {
                        if(e.target.value == '') {
                            return
                        }
                        const result = await fetchStockSymbols(e.target.value, 5)

                        const completeSet : string[] = []
                        result['results'].forEach((item: any) => {
                            completeSet.push(item['symbol'])
                        })
                        setSearchSymbols(completeSet)
                    }}
                    onBlur={async () => {
                        await new Promise(r => setTimeout(r, 100));
                        setSearchSymbols([])
                    }}
                />
            </FormControl>
            {autoCompleteDropdown(searchSymbols)}
            <br/>
            {getDataTable(data)}
        </>

    );
}

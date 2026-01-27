import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {fetchStockHistory, fetchStockSymbols} from "../services/StockHistoryService.tsx";
import {type ReactElement, useState} from "react";
import Box from "@mui/material/Box";
import {List, Typography } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";

export default function StockSearch() {
    const [searchSymbols, setSearchSymbols] = useState<Array<string>>([]);
    const [symbolData, setSymbolData] = useState<any>(null);
    const [searchValue, setSearchValue] = useState<string>('');

    function autoCompleteDropdown(symbols: Array<string>) {
        if(searchSymbols.length == 0) {
            return <></>
        }
        const dropdownElements : ReactElement[] = []
        symbols.forEach((symbol) => {
            dropdownElements.push(<ListItemButton key={symbol} onClick={async ()=> {
                setSearchValue(symbol)
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

    async function getSymbolData(symbol: string) {
        console.log("Fetching data for symbol: " + symbol)
        setSearchSymbols([])
        const response = await fetchStockHistory(symbol, "daily")
        console.log(response.results)
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
        </>

    );
}

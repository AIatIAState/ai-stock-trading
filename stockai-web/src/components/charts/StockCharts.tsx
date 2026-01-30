import {Card, CardContent, Grid, InputLabel} from "@mui/material";
import type {Bar} from "../../services/api.ts";
import StockScatterChart from "./StockScatterChart.tsx";
import {useState} from "react";
import StockBarChart from "./StockBarChart.tsx";
import { StockPieChart } from "./StockPieChart.tsx";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface StockChartsProps {
    bars: Bar[],
}

function getDateFromYYYYMMDD(yyyymmdd: string): Date {

    const year = parseInt(yyyymmdd.substring(0, 4), 10);
    const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
    const day = parseInt(yyyymmdd.substring(6, 8), 10);

    return new Date(Date.UTC(year, month, day));
}

export function StockCharts(props : StockChartsProps) {
    const [startDate, setStartDate] = useState<Date>(props.bars[0]?.date.toString() ? getDateFromYYYYMMDD(props.bars[0]?.date.toString()) : getDateFromYYYYMMDD('20000101'))
    const [endDate, setEndDate] = useState<Date>(props.bars[props.bars.length - 1]?.date ? getDateFromYYYYMMDD(props.bars[props.bars.length - 1]?.date.toString()): new Date())
    console.log(startDate)
    console.log(endDate)
    if(props.bars.length == 0){
        return <></>
    }

    return (<>
            <Box sx={{ml: 'auto'}} fullWidth>
                <FormControl>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                        label={"BRO"} value={"BRO"} defaultValue={"1 Year"} onChange={(e) => setEndDate(e.target.value)}>
                        <MenuItem value={"1 Week"}>1 Week</MenuItem>
                        <MenuItem value={"1 Month"}>1 Month</MenuItem>
                        <MenuItem value={"3 Months"}>3 Months</MenuItem>
                        <MenuItem value={"6 Months"}>6 Months</MenuItem>
                        <MenuItem value={"1 Year"}>1 Year</MenuItem>
                        <MenuItem value={"5 Years"}>5 Years</MenuItem>
                        <MenuItem value={"20 Years"}>20 Years</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        <Grid container spacing={2} columns={12}>

            <Grid size={{ xs: 12, md: 8 }}>
                <StockBarChart bars={props.bars} startDate={startDate} endDate={endDate}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4}}>
                <Card
                    variant="outlined"
                    sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
                >
                    <CardContent>
                        <StockPieChart bars={props.bars} startDate={startDate} endDate={endDate}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12}}>
                <StockScatterChart bars={props.bars} startDate={startDate} endDate={endDate}/>

            </Grid>
        </Grid>
        </>
    )
}


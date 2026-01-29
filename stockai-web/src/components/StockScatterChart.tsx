import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {LineChart} from '@mui/x-charts/LineChart';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {InputLabel} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import type {Bar} from "../services/api.ts";
import { useState} from "react";


function getDateFromYYYYMMDD(yyyymmdd: string): Date {
    const year = parseInt(yyyymmdd.substring(0, 4), 10);
    const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
    const day = parseInt(yyyymmdd.substring(6, 8), 10);

    return new Date(Date.UTC(year, month, day));
}
export interface StockScatterChartProps {
        data: Bar[]
}
export default function StockScatterChart(props: StockScatterChartProps) {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState("1 Year");
    if(props.data.length <= 0) {
        return <></>
    }

    function getMinDate(dateTimeFrame: string){
        const tempDate = new Date()
        tempDate.setDate(dateTimeFrame === "1 Week" ? today.getDate() - 7 :
            dateTimeFrame === "1 Month" ? today.getDate() - 30:
                dateTimeFrame === "3 Months" ? today.getDate() - 90 :
                    dateTimeFrame === "6 Months" ? today.getDate() - 183 :
                        dateTimeFrame === "1 Year" ? today.getDate() - 365:
                            dateTimeFrame === "5 Years" ? today.getDate() - 1825:
                                today.getDate() - 3650)
        return tempDate
    }
    const today = new Date()
  const dates: Date[] = []
    const opens: number[] = []
    props.data.forEach((item: Bar)=> {
        const parsedDate = getDateFromYYYYMMDD(item.date.toString())
        if(parsedDate > getMinDate(timeframe)){
            dates.push(parsedDate)
            opens.push(item.open == null ? 0 : item.open)
        }
    })

    const symbol = props.data[0].symbol
  const heading = "Stock Open Costs for " + symbol
    const percentage = ((props.data[props.data.length - 1].open! - props.data[props.data.length - 2].open!) / props.data[props.data.length - 2].open! * 100)
  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Total Earnings
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
                {heading}
            </Typography>
            <Chip size="small" color={percentage > 0 ? "success" : "warning"} label={percentage > 0 ? "+" + percentage.toFixed(2) : percentage.toFixed(2)} />
              <Stack sx={{ ml: 'auto' }}>
              <FormControl>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                      label={timeframe} value={timeframe} defaultValue={"1 Year"} onChange={(e) => setTimeframe(e.target.value)}>
                      <MenuItem value={"1 Week"}>1 Week</MenuItem>
                      <MenuItem value={"1 Month"}>1 Month</MenuItem>
                      <MenuItem value={"3 Months"}>3 Months</MenuItem>
                      <MenuItem value={"6 Months"}>6 Months</MenuItem>
                      <MenuItem value={"1 Year"}>1 Year</MenuItem>
                      <MenuItem value={"5 Years"}>5 Years</MenuItem>
                      <MenuItem value={"20 Years"}>All Time</MenuItem>
                  </Select>
              </FormControl>
              </Stack>
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Portfolio earnings for {timeframe.toLowerCase()}
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'time',
              data: dates,
              tickInterval: (_index, i) => (i + 1) % 50 === 0,
              height: 24,
                max: today,
                min: getMinDate(timeframe),
              valueFormatter: (value: Date) => {
                  return `${value.getMonth() + 1}/${value.getDate()}/${value.getFullYear()}`;
              }
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[{
              id: symbol,
              label: symbol,
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: opens
        }]}
          height={250}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-fidelity': {
              fill: "url('#fidelity')",
            },
            '& .MuiAreaElement-series-s&p500': {
              fill: "url('#s&p500')",
            },
            '& .MuiAreaElement-series-user': {
              fill: "url('#user')",
            },
          }}
          hideLegend
        >
        </LineChart>
      </CardContent>
    </Card>
  );
}

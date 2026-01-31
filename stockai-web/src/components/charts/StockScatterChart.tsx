import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {LineChart} from '@mui/x-charts/LineChart';
import type {Bar} from "../../services/api.ts";


function getDateFromYYYYMMDD(yyyymmdd: string): Date {
    const year = parseInt(yyyymmdd.substring(0, 4), 10);
    const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
    const day = parseInt(yyyymmdd.substring(6, 8), 10);

    return new Date(Date.UTC(year, month, day));
}
export interface StockScatterChartProps {
        bars: Bar[]
        startDate: Date,
}
export default function StockScatterChart(props: StockScatterChartProps) {
  const theme = useTheme();
    if(props.bars.length <= 0) {
        return <></>
    }

  const dates: Date[] = []
    const opens: number[] = []
    props.bars.forEach((item: Bar)=> {
        const parsedDate = getDateFromYYYYMMDD(item.date.toString())
        if(parsedDate >= props.startDate && item.open != null){
            dates.push(parsedDate)
            opens.push(item.open == null ? 0 : item.open)
        }
    })

    const symbol = props.bars[0].symbol
  const heading = symbol + " Price"
    const percentage = ((props.bars[props.bars.length - 1].open! - props.bars[props.bars.length - 2].open!) / props.bars[props.bars.length - 2].open! * 100)
  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
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
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Open prices from {props.startDate.toDateString()}
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
                min: props.startDate,
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

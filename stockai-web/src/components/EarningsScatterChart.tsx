import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {LineChart, type LineSeries} from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}



export interface EarningsScatterChartProps {
        series: LineSeries[]
        x_axis: string[]
        heading: string
        percent: number
}
export default function EarningsScatterChart(props: EarningsScatterChartProps) {
  const theme = useTheme();
  const data = props.x_axis;

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
                {props.heading}
            </Typography>
            <Chip size="small" color="success" label={props.percent} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Portfolio earnings for the last 30 days
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data,
              tickInterval: (_index, i) => (i + 1) % 50 === 0,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={props.series}
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

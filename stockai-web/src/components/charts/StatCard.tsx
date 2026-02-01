import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
};


function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard(props: StatCardProps) {
  const theme = useTheme();
  const maxValue = Math.max(...props.data)
  const minValue = Math.min(...props.data)
  const trendColors = {
    up:
      theme.palette.mode === 'light'
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === 'light'
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === 'light'
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const color = labelColors[props.trend];
  const chartColor = trendColors[props.trend];

  return (
<Stack direction={'row'} alignItems={'end'}>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {props.title}
        </Typography>
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Chip size="small" color={color} label={props.value} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {props.interval}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={props.data}
              area
              showHighlight
              showTooltip
              yAxis={{max:maxValue * 1.1, min: minValue * .9 > 0 ? minValue * .9 : 0}}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${props.value})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${props.value}`} />
            </SparkLineChart>
          </Box>
      </Stack>
  );
}

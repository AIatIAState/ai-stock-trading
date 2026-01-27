import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress'
import { styled, useTheme } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { useDrawingArea } from '@mui/x-charts/hooks'
import { useMemo, useState } from 'react'
import { fetchBars, fetchSymbols, type Bar, type SymbolInfo } from '../api'
import AppTheme from '../themes/AppTheme'
import AppAppBar from '../components/AppAppBar'
import Footer from '../components/Footer'

const timeframes = [
  { label: 'Daily', value: 'daily' },
  { label: '5 Minute', value: '5 min' },
]

const DEFAULT_BARS_LIMIT = 200
const BARS_LIMIT_STEP = 200
const MAX_BARS_LIMIT = 5000

function formatDate(value: number) {
  const str = String(value)
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
}

function formatTime(value: number) {
  const str = String(value).padStart(6, '0')
  return `${str.slice(0, 2)}:${str.slice(2, 4)}`
}

type TrendSummary = {
  up: number
  down: number
  flat: number
  total: number
}

type StockChartData = {
  labels: string[]
  closes: number[]
  volumes: number[]
  rangeLabel: string
  barsCount: number
  firstClose: number | null
  lastClose: number | null
  firstVolume: number | null
  prevClose: number | null
  lastVolume: number | null
  avgVolume: number | null
  trend: TrendSummary
  tickStep: number
}

type ChangeTag = {
  label: string
  color: 'success' | 'error' | 'default'
}

function formatCompactNumber(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

function getChangeTag(current: number | null, previous: number | null): ChangeTag {
  if (current == null || previous == null || previous === 0) {
    return { label: 'N/A', color: 'default' }
  }
  const change = ((current - previous) / previous) * 100
  const sign = change > 0 ? '+' : ''
  const label = `${sign}${change.toFixed(1)}%`
  const color = change > 0 ? 'success' : change < 0 ? 'error' : 'default'
  return { label, color }
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

interface StyledTextProps {
  variant: 'primary' | 'secondary'
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme, variant }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  fontSize:
    variant === 'primary'
      ? theme.typography.h5.fontSize
      : theme.typography.body2.fontSize,
  fontWeight:
    variant === 'primary'
      ? theme.typography.h5.fontWeight
      : theme.typography.body2.fontWeight,
}))

interface PieCenterLabelProps {
  primaryText: string
  secondaryText: string
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea()
  const primaryY = top + height / 2 - 10
  const secondaryY = primaryY + 24

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  )
}

function StockCharts({
  data,
  symbol,
  timeframe,
}: {
  data: StockChartData
  symbol: string
  timeframe: string
}) {
  const theme = useTheme()
  const priceChange = getChangeTag(data.lastClose, data.firstClose)
  const volumeChange = getChangeTag(data.lastVolume, data.firstVolume)
  const tickInterval = (_index: number, i: number) => i % data.tickStep === 0
  const safeSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '-')
  const priceGradientId = `price-gradient-${safeSymbol}`
  const timeframeLabel = timeframe === 'daily' ? 'Daily' : timeframe
  const trendTotal = data.trend.total
  const barLabel = timeframe === 'daily' ? 'days' : 'bars'
  const upPercent =
    trendTotal === 0 ? 0 : Math.round((data.trend.up / trendTotal) * 100)
  const trendRows = [
    {
      label: 'Up',
      value: data.trend.up,
      color: theme.palette.success.main,
    },
    {
      label: 'Down',
      value: data.trend.down,
      color: theme.palette.error.main,
    },
    {
      label: 'Flat',
      value: data.trend.flat,
      color: theme.palette.grey[500],
    },
  ]

  return (
    <Grid container spacing={2} columns={12}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              {symbol} Price
            </Typography>
            <Stack sx={{ justifyContent: 'space-between' }}>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', gap: 1 }}
              >
                <Typography variant="h4" component="p">
                  {data.lastClose == null ? '--' : `${data.lastClose.toFixed(2)} USD`}
                </Typography>
                <Chip size="small" color={priceChange.color} label={priceChange.label} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {timeframeLabel} | {data.barsCount} {barLabel} | {data.rangeLabel}
              </Typography>
            </Stack>
            <LineChart
              colors={[theme.palette.primary.main]}
              xAxis={[
                {
                  scaleType: 'point',
                  data: data.labels,
                  tickInterval,
                  height: 24,
                },
              ]}
              yAxis={[{ width: 50 }]}
              series={[
                {
                  id: 'close',
                  label: 'Close',
                  showMark: false,
                  curve: 'linear',
                  area: true,
                  data: data.closes,
                },
              ]}
              height={250}
              margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
              grid={{ horizontal: true }}
              sx={{
                '& .MuiAreaElement-series-close': {
                  fill: `url('#${priceGradientId}')`,
                },
              }}
              hideLegend
            >
              <AreaGradient color={theme.palette.primary.main} id={priceGradientId} />
            </LineChart>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              {symbol} Volume
            </Typography>
            <Stack sx={{ justifyContent: 'space-between' }}>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', gap: 1 }}
              >
                <Typography variant="h4" component="p">
                  {data.lastVolume == null ? '--' : formatCompactNumber(data.lastVolume)}
                </Typography>
                <Chip size="small" color={volumeChange.color} label={volumeChange.label} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                First bar: {data.firstVolume == null ? 'N/A' : formatCompactNumber(data.firstVolume)} | Avg: {' '}
                {data.avgVolume == null ? 'N/A' : formatCompactNumber(data.avgVolume)}
              </Typography>
            </Stack>
            <BarChart
              colors={[
                (theme.vars || theme).palette.primary.dark,
                (theme.vars || theme).palette.primary.main,
              ]}
              xAxis={[
                {
                  scaleType: 'band',
                  categoryGapRatio: 0.6,
                  data: data.labels,
                  tickInterval,
                  height: 24,
                },
              ]}
              yAxis={[{ width: 50 }]}
              series={[
                {
                  id: 'volume',
                  label: 'Volume',
                  data: data.volumes,
                },
              ]}
              height={250}
              margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
              grid={{ horizontal: true }}
              hideLegend
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card
          variant="outlined"
          sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              {symbol} Trend Breakdown
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PieChart
                colors={trendRows.map((row) => row.color)}
                margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
                series={[
                  {
                    data: trendRows.map((row) => ({
                      label: row.label,
                      value: row.value,
                    })),
                    innerRadius: 75,
                    outerRadius: 100,
                    paddingAngle: 0,
                    highlightScope: { fade: 'global', highlight: 'item' },
                  },
                ]}
                height={260}
                width={260}
                hideLegend
              >
                <PieCenterLabel primaryText={`${upPercent}%`} secondaryText={`Up ${barLabel}`} />
              </PieChart>
            </Box>
            {trendRows.map((row) => {
              const percent = trendTotal === 0 ? 0 : (row.value / trendTotal) * 100
              return (
                <Stack
                  key={row.label}
                  direction="row"
                  sx={{ alignItems: 'center', gap: 2, pb: 2 }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '999px',
                      backgroundColor: row.color,
                    }}
                  />
                  <Stack sx={{ gap: 1, flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {row.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {Math.round(percent)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      aria-label={`${row.label} ${barLabel}`}
                      value={percent}
                      sx={{
                        [`& .${linearProgressClasses.bar}`]: {
                          backgroundColor: row.color,
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              )
            })}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default function DataSearchPage(props: { disableCustomTheme?: boolean }) {
  const [query, setQuery] = useState('')
  const [symbols, setSymbols] = useState<SymbolInfo[]>([])
  const [selected, setSelected] = useState<SymbolInfo | null>(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [bars, setBars] = useState<Bar[]>([])
  const [barsLimit, setBarsLimit] = useState(DEFAULT_BARS_LIMIT)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const barsByDateDesc = useMemo(() => {
    if (!bars.length) return []
    return [...bars].sort((a, b) => {
      if (a.date !== b.date) return b.date - a.date
      return (b.time ?? 0) - (a.time ?? 0)
    })
  }, [bars])

  const barsByDateAsc = useMemo(() => {
    if (!barsByDateDesc.length) return []
    return [...barsByDateDesc].reverse()
  }, [barsByDateDesc])

  const displayBars = useMemo(() => {
    return sortOrder === 'newest' ? barsByDateDesc : barsByDateAsc
  }, [barsByDateAsc, barsByDateDesc, sortOrder])

  const stats = useMemo(() => {
    if (!barsByDateDesc.length) return null
    const closes = barsByDateDesc.map((bar) => bar.close || 0)
    const highs = barsByDateDesc.map((bar) => bar.high || 0)
    const lows = barsByDateDesc.map((bar) => bar.low || 0)
    return {
      total: barsByDateDesc.length,
      maxHigh: Math.max(...highs).toFixed(2),
      minLow: Math.min(...lows).toFixed(2),
      lastClose: closes[0]?.toFixed(2),
    }
  }, [barsByDateDesc])

  const chartData = useMemo<StockChartData | null>(() => {
    if (!barsByDateAsc.length) return null
    const labels = barsByDateAsc.map((bar) => {
      const dateLabel = formatDate(bar.date)
      const timeLabel =
        timeframe !== 'daily' && bar.time ? ` ${formatTime(bar.time)}` : ''
      return `${dateLabel}${timeLabel}`
    })
    const closes = barsByDateAsc.map((bar) => bar.close ?? 0)
    const volumes = barsByDateAsc.map((bar) => bar.volume ?? 0)
    const firstClose = closes.length ? closes[0] : null
    const lastClose = closes.length ? closes[closes.length - 1] : null
    const prevClose = closes.length > 1 ? closes[closes.length - 2] : null
    const firstVolume = volumes.length ? volumes[0] : null
    const lastVolume = volumes.length ? volumes[volumes.length - 1] : null
    const avgVolume = volumes.length
      ? volumes.reduce((sum, value) => sum + value, 0) / volumes.length
      : null
    const trend = barsByDateAsc.reduce(
      (acc, bar) => {
        if (bar.open == null || bar.close == null) return acc
        if (bar.close > bar.open) acc.up += 1
        else if (bar.close < bar.open) acc.down += 1
        else acc.flat += 1
        return acc
      },
      { up: 0, down: 0, flat: 0 }
    )
    const total = trend.up + trend.down + trend.flat
    const rangeLabel =
      labels.length > 1 ? `${labels[0]} to ${labels[labels.length - 1]}` : labels[0] ?? ''
    const tickStep = Math.max(1, Math.ceil(labels.length / 6))

    return {
      labels,
      closes,
      volumes,
      rangeLabel,
      barsCount: barsByDateAsc.length,
      firstClose,
      lastClose,
      firstVolume,
      prevClose,
      lastVolume,
      avgVolume,
      trend: { ...trend, total },
      tickStep,
    }
  }, [barsByDateAsc, timeframe])

  async function runSearch() {
    if (!query.trim()) return
    setError(null)
    setLoading(true)
    try {
      const response = await fetchSymbols(query.trim(), 30)
      setSymbols(response.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch symbols')
    } finally {
      setLoading(false)
    }
  }

  async function loadBars(
    symbolInfo: SymbolInfo,
    limitOverride?: number,
    orderOverride?: 'newest' | 'oldest'
  ) {
    setSelected(symbolInfo)
    setBars([])
    setError(null)
    setLoading(true)
    try {
      const limitValue = limitOverride ?? barsLimit
      const orderValue = orderOverride ?? sortOrder
      const order = orderValue === 'newest' ? 'desc' : 'asc'
      const response = await fetchBars({
        symbol: symbolInfo.symbol,
        timeframe,
        start: start ? start.replaceAll('-', '') : undefined,
        end: end ? end.replaceAll('-', '') : undefined,
        limit: limitValue,
        order,
      })
      setBars(response.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadMoreBars() {
    if (!selected) return
    const nextLimit = Math.min(barsLimit + BARS_LIMIT_STEP, MAX_BARS_LIMIT)
    if (nextLimit === barsLimit) return
    setBarsLimit(nextLimit)
    await loadBars(selected, nextLimit, sortOrder)
  }

  async function handleSortOrderChange(nextOrder: 'newest' | 'oldest') {
    if (nextOrder === sortOrder) return
    setSortOrder(nextOrder)
    if (selected) {
      await loadBars(selected, barsLimit, nextOrder)
    }
  }

  return (
    <AppTheme {...props}>
      <AppAppBar />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="overline">
                  Market Data Explorer
                </Typography>
                <Typography variant="h3">Search tickers and inspect OHLCV history.</Typography>
                <Typography variant="body1" color="text.secondary">
                  Search for stock symbols and load historical price data directly from our database.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
                  <TextField
                    label="Symbol search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => (event.key === 'Enter' ? runSearch() : null)}
                    placeholder="AAPL, TSLA, SPY"
                    fullWidth
                  />
                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel id="timeframe-label">Timeframe</InputLabel>
                    <Select
                      labelId="timeframe-label"
                      label="Timeframe"
                      value={timeframe}
                      onChange={(event) => setTimeframe(event.target.value as string)}
                    >
                      {timeframes.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Start date"
                    type="date"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End date"
                    type="date"
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button variant="contained" onClick={runSearch} disabled={loading}>
                    Search
                  </Button>
                </Stack>
                {error ? <Alert severity="error">{error}</Alert> : null}
                {loading ? <Typography color="text.secondary">Loading...</Typography> : null}
              </Stack>
            </CardContent>
          </Card>

          <Typography color="text.secondary">Note: Currently data is purely historical based on our own curated database.</Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1.6fr' },
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Symbols
                </Typography>
                <Stack spacing={1}>
                  {symbols.length === 0 ? (
                    <Typography color="text.secondary">Search for a ticker to populate results.</Typography>
                  ) : (
                    symbols.map((symbol) => (
                      <Button
                        key={symbol.symbol}
                        variant={selected?.symbol === symbol.symbol ? 'contained' : 'outlined'}
                        onClick={() => loadBars(symbol)}
                        sx={{ justifyContent: 'space-between' }}
                      >
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography>{symbol.symbol}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(symbol.exchange || 'N/A').toUpperCase()} | {symbol.asset_type ?? 'asset'}
                          </Typography>
                        </Box>
                      </Button>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
          {/* CHARTS */}
          <Box>
            <Card>
              <CardContent>

                <Stack spacing={2}>
                  <Typography variant="h5">Charts</Typography>
                  {chartData && selected ? (
                    <StockCharts data={chartData} symbol={selected.symbol} timeframe={timeframe} />
                  ) : (
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="text.secondary">
                          Select a symbol to load charts with real market data.
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
          {/* END CHARTS */}

          {/* RECENT BARS TABLE */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent bars
              </Typography>
              {selected ? (
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Symbol
                      </Typography>
                      <Typography variant="h6">{selected.symbol}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    {stats ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Bars loaded
                          </Typography>
                          <Typography variant="h6">{stats.total}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Last close
                          </Typography>
                          <Typography variant="h6">{stats.lastClose}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            High / Low
                          </Typography>
                          <Typography variant="h6">
                            {stats.maxHigh} / {stats.minLow}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : null}
                  </Stack>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {displayBars.length
                        ? `Showing ${displayBars.length} of ${barsLimit} bars`
                        : 'No bars loaded yet.'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={sortOrder}
                        onChange={(_, value) => {
                          if (value) {
                            void handleSortOrderChange(value as 'newest' | 'oldest')
                          }
                        }}
                      >
                        <ToggleButton value="newest">Newest</ToggleButton>
                        <ToggleButton value="oldest">Oldest</ToggleButton>
                      </ToggleButtonGroup>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLoadMoreBars}
                        disabled={!selected || loading || barsLimit >= MAX_BARS_LIMIT}
                      >
                        Load {BARS_LIMIT_STEP} more
                      </Button>
                    </Stack>
                  </Stack>

                  {displayBars.length > 0 ? (
                    <TableContainer component={Paper} sx={{ maxHeight: 360 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Open</TableCell>
                            <TableCell>High</TableCell>
                            <TableCell>Low</TableCell>
                            <TableCell>Close</TableCell>
                            <TableCell>Volume</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayBars.map((bar) => (
                            <TableRow key={`${bar.symbol}-${bar.date}-${bar.time}`}>
                              <TableCell>{formatDate(bar.date)}</TableCell>
                              <TableCell>{bar.time ? formatTime(bar.time) : 'N/A'}</TableCell>
                              <TableCell>{bar.open?.toFixed(2) ?? 'N/A'}</TableCell>
                              <TableCell>{bar.high?.toFixed(2) ?? 'N/A'}</TableCell>
                              <TableCell>{bar.low?.toFixed(2) ?? 'N/A'}</TableCell>
                              <TableCell>{bar.close?.toFixed(2) ?? 'N/A'}</TableCell>
                              <TableCell>{bar.volume?.toFixed(0) ?? 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">Select a symbol to load recent bars.</Typography>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">Select a symbol to load recent bars.</Typography>
              )}
            </CardContent>
          </Card>
          {/* END BARS TABLE */}
        </Box>
      </Container>
      <Footer />
    </AppTheme>
  )
}

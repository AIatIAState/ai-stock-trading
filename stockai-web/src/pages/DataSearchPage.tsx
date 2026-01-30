import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDrawingArea } from '@mui/x-charts/hooks'
import { useMemo, useState } from 'react'
import { fetchBars, type Bar, type SymbolInfo } from '../services/api'
import AppTheme from '../themes/AppTheme'
import AppAppBar from '../components/AppAppBar'
import Footer from '../components/Footer'
import StockSearch from "../components/StockSearch.tsx";
import {StockCharts} from "../components/charts/StockCharts.tsx";



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



interface StyledTextProps {
  variant: 'primary' | 'secondary'
}





export default function DataSearchPage(props: { disableCustomTheme?: boolean }) {
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
            <StockSearch setBars={setBars}/>
            <StockCharts bars={bars}/>

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

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
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
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { fetchBars, fetchSymbols, type Bar, type SymbolInfo } from '../api'
import AppTheme from '../shared-theme/AppTheme'
import AppAppBar from './components/AppAppBar'
import Footer from './components/Footer'

const timeframes = [
  { label: 'Daily', value: 'daily' },
  { label: '5 Minute', value: '5 min' },
]

function formatDate(value: number) {
  const str = String(value)
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
}

function formatTime(value: number) {
  const str = String(value).padStart(6, '0')
  return `${str.slice(0, 2)}:${str.slice(2, 4)}`
}

export default function DataSearchPage(props: { disableCustomTheme?: boolean }) {
  const [query, setQuery] = useState('')
  const [symbols, setSymbols] = useState<SymbolInfo[]>([])
  const [selected, setSelected] = useState<SymbolInfo | null>(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [bars, setBars] = useState<Bar[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stats = useMemo(() => {
    if (!bars.length) return null
    const closes = bars.map((bar) => bar.close || 0)
    const highs = bars.map((bar) => bar.high || 0)
    const lows = bars.map((bar) => bar.low || 0)
    return {
      total: bars.length,
      maxHigh: Math.max(...highs).toFixed(2),
      minLow: Math.min(...lows).toFixed(2),
      lastClose: closes[0]?.toFixed(2),
    }
  }, [bars])

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

  async function loadBars(symbolInfo: SymbolInfo) {
    setSelected(symbolInfo)
    setBars([])
    setError(null)
    setLoading(true)
    try {
      const response = await fetchBars({
        symbol: symbolInfo.symbol,
        timeframe,
        start: start ? start.replaceAll('-', '') : undefined,
        end: end ? end.replaceAll('-', '') : undefined,
        limit: 200,
      })
      setBars(response.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
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

                    {bars.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table size="small">
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
                            {bars.map((bar) => (
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
          </Box>
        </Box>
      </Container>
      <Footer />
    </AppTheme>
  )
}

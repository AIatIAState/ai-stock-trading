import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const quickWins = [
  'Search historical prices in seconds',
  'Understand trends with AI',
  'Practice trades with zero risk',
]

export default function Hero() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
          alignItems: 'center',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="overline">StockTrAIder</Typography>
          <Typography variant="h2">Learn markets faster with AI powered insights.</Typography>
          <Typography variant="body1" color="text.secondary">
            StockTrAIder is a friendly, modern dashboard for exploring stocks, spotting patterns, and building
            confidence before you trade.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" component={RouterLink} to="/data">
              Explore data
            </Button>
            <Button variant="outlined">
              Made to learn, not to paywall
            </Button>
          </Stack>
        </Stack>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              What you get
            </Typography>
            <Stack spacing={1}>
              {quickWins.map((item) => (
                <Typography key={item} variant="body2" color="text.secondary">
                  {item}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

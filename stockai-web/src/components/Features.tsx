import { Box, Card, CardContent, Typography } from '@mui/material'

const features = [
  {
    title: 'Market context',
    description: 'Quick summaries highlight what is moving and why it matters.',
  },
  {
    title: 'Historical search',
    description: 'Filter by symbol, timeframe, and date range to explore trends.',
  },
  {
    title: 'Practice mode',
    description: 'Simulate trades and learn without putting real capital at risk.',
  },
]

export default function Features() {
  return (
    <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 5 } }}>
      <Typography variant="h4" gutterBottom>
        Focused features
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography color="text.secondary">{feature.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

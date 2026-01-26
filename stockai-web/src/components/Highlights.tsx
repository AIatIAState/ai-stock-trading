import { Box, Card, CardContent, Typography } from '@mui/material'

const highlights = [
  { label: 'Data coverage', value: 'Daily + 5 min bars' },
  { label: 'Search speed', value: 'Instant queries' },
  { label: 'Experience', value: 'Fun, simple, professional' },
]

export default function Highlights() {
  return (
    <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 5 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        {highlights.map((item) => (
          <Card key={item.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6">
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

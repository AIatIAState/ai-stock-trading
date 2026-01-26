import { Box, Container, Stack, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, mt: 4 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Typography variant="body2">StockTrAIder 2026</Typography>
          <Typography variant="body2" color="text.secondary">
            Built for practical learning and clear market context.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const faqs = [
  {
    question: 'Is this real trading?',
    answer: 'No. StockTrAIder is a learning platform with virtual trades only.',
  },
  {
    question: 'Where does the data come from?',
    answer: 'We use historical market data dating back to the 1970s.',
  },
  {
    question: 'Who is this for?',
    answer: 'Students, new traders, and anyone who wants a clear view of market history.',
  },
]

export default function FAQ() {
  return (
    <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 5 } }}>
      <Typography variant="h4" gutterBottom>
        FAQs
      </Typography>
      {faqs.map((item) => (
        <Accordion key={item.question}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

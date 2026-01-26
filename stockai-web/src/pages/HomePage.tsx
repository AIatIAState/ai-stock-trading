import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import AppTheme from '../themes/AppTheme'
import AppAppBar from '../components/AppAppBar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

export default function HomePage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <div>
        <Features />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  )
}

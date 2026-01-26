import type { ReactNode } from 'react'

type AppThemeProps = {
  children: ReactNode
  disableCustomTheme?: boolean
}

export default function AppTheme({ children }: AppThemeProps) {
  return <>{children}</>
}

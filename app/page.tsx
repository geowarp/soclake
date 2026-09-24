import { AppProvider } from '@/components/app-provider'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}

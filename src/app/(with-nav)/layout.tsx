import { NavigationLayout } from '@/components/layouts/navigation-layout'
import { FxProvider } from '@/components/fx/FxProvider'

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FxProvider>
      <NavigationLayout>{children}</NavigationLayout>
    </FxProvider>
  )
}

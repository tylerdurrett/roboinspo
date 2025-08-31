import { NavigationLayout } from '@/components/layouts/navigation-layout'
import LenisProvider from '@/components/providers/lenis-provider'
import { FxProvider } from '@/components/fx/FxProvider'

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LenisProvider>
      <FxProvider>
        <NavigationLayout>{children}</NavigationLayout>
      </FxProvider>
    </LenisProvider>
  )
}

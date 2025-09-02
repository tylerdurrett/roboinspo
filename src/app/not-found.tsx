import type { Metadata } from 'next'
import { NavigationLayout } from '@/components/layouts/navigation-layout'
import LenisProvider from '@/components/providers/lenis-provider'
import { FxProvider } from '@/components/fx/FxProvider'

export const metadata: Metadata = {
  title: 'Not Found',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <LenisProvider>
      <FxProvider>
        <NavigationLayout>
          <div className="px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center min-h-[calc(100vh-136px)]">
            <div className="relative isolate py-16 mb-8">
              <h1 className="relative z-10 px-4 text-5xl sm:text-7xl md:text-8xl sm:px-6 lg:px-8 font-hepta-slab uppercase text-yellow text-center">
                Not Found
              </h1>
            </div>
            <div className="text-center px-4 sm:px-6 lg:px-8">
              <p className="text-lg text-muted-foreground mb-8">
                The page you are looking for could not be found.
              </p>
            </div>
          </div>
        </NavigationLayout>
      </FxProvider>
    </LenisProvider>
  )
}

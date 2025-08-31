import AnimationsInit from '@/components/AnimationsInit'
import Image from 'next/image'
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
          <div className="px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center h-[calc(80lvh-136px)]">
            <AnimationsInit animations={['stretch']} />
            <div className="relative isolate py-16 mb-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
              >
                <Image
                  src="/static/pyramid.svg"
                  alt=""
                  width={385}
                  height={280}
                  className="h-auto w-[360px] -translate-y-2 sm:-translate-y-3 md:-translate-y-4 lg:-translate-y-5 xl:-translate-y-6"
                  priority={false}
                />
              </div>
              <h1 className="relative z-10 px-4 text-5xl sm:text-7xl md:text-8xl sm:px-6 lg:px-8 font-brachial uppercase text-yellow text-center">
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

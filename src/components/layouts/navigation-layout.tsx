'use client'
import FxLayer from '@/components/fx/FxLayer'
import { useFx } from '@/components/fx/FxProvider'
import { TopNav } from '@/components/layouts/top-nav'

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const { fx } = useFx()

  return (
    <div className="relative min-h-dvh">
      {/* Global FX layer behind header, content, and footer */}
      <div className="absolute inset-0 -z-10">
        <FxLayer
          spots={fx?.spots}
          gradients={fx?.gradients}
          ornaments={fx?.ornaments}
          enableParallax={fx?.enableParallax}
        />
      </div>

      <TopNav />

      <main className="pt-12 md:pt-10 lg:pt-12 xl:pt-20 min-[1200px]:pt-16">
        {children}
      </main>
    </div>
  )
}

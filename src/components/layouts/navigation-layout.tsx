import { TopNav } from '@/components/layouts/top-nav'

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <TopNav />

      <main className="pt-12 md:pt-10 lg:pt-12 xl:pt-20 min-[1200px]:pt-16">
        {children}
      </main>
    </div>
  )
}

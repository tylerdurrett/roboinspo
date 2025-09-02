'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'READING', href: '/reading' },
  // { label: 'LOOKING', href: '/looking' },
  // { label: 'THINKING', href: '/thinking' },
  // { label: 'WATCHING', href: '/watching' },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between bg-background">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-[3vw] py-[2vw] text-[2vw] font-medium tracking-wider transition-colors
                ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <Link
        href="/"
        className="mr-[3vw] flex h-[3vw] w-[3vw] min-h-[20px] min-w-[20px] items-center justify-center bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
        aria-label="Home"
      >
        <div className="h-full w-full" />
      </Link>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'THINGS', href: '/things' },
  { label: 'READING', href: '/reading' },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full min-h-[44px] justify-start bg-nav-inactive">
      <Link
        href="/"
        className="w-[calc(2vw+44px)] h-[calc(2vw+44px)] flex items-center justify-center bg-blue-600 transition-colors hover:bg-blue-600/90"
        aria-label="Home"
      />
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-[3vw] py-[1vw] text-[2vw] min-h-[44px] flex items-center font-medium tracking-wider transition-colors min-[1200px]:text-lg
                ${
                  isActive
                    ? 'bg-nav-active text-nav-active-foreground'
                    : 'bg-nav-inactive text-nav-inactive-foreground hover:text-nav-active-foreground'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

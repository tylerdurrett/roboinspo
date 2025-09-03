'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'READING', href: '/reading' },
  { label: 'LOOKING', href: '/looking' },
  { label: 'THINKING', href: '/thinking' },
  { label: 'WATCHING', href: '/watching' },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-[6vw] min-h-[40px] w-full items-center justify-between bg-nav-inactive">
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
                    ? 'bg-nav-active text-nav-active-foreground'
                    : 'bg-nav-inactive text-nav-inactive-foreground hover:text-nav-active-foreground'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <Link
        href="/"
        className="h-full w-[6vw] min-w-[40px] bg-nav-active transition-colors hover:bg-nav-active/90"
        aria-label="Home"
      />
    </nav>
  )
}

# Robo Inspo

This is a Next.js 15 application using the App Router pattern with TypeScript and Tailwind CSS v4.

## Tech Stack

- **Next.js 15.3.3** with App Router
- **React 19.0.0**
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS v4** (alpha/beta) with PostCSS
- **Shadcn/ui** for component library
- **ESLint 9** with Next.js configuration and Prettier integration
- **Prettier** for code formatting (auto-format on save in VS Code)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:7777](http://localhost:7777) with your browser to see the result.

**Note:** The development server runs on port 7777, not the default 3000.

## Essential Commands

```bash
# Development server (runs on port 7777 with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint the codebase
npm run lint

# Format all files with Prettier
npm run format

# Check formatting without modifying files
npm run format:check

# Add a new Shadcn component
npm run add <component-name>
```

## Project Structure

- `/src/app/` - App Router pages and layouts
- TypeScript path alias: `@/*` maps to `./src/*`
- Tailwind CSS uses the new v4 inline theme approach with CSS custom properties

## Key Patterns

- Font optimization using `next/font`
- Dark mode support via CSS variables in `globals.css`
- Component files should use `.tsx` extension
- Styles use Tailwind CSS utility classes

## Blog System

The application includes a fully-featured markdown blog system:

### Creating Blog Posts

1. Create a new markdown file in the `/content/blog/` directory
2. Use the naming convention: `YYYY-MM-DD_post-slug.md` (e.g., `2025-06-25_my-first-post.md`)
3. Include frontmatter at the top of the file with metadata:

```markdown
---
title: Your Post Title
excerpt: A brief description of your post
author: Your Name
tags: [tag1, tag2, tag3]
featured: true
---

Your markdown content goes here...
```

### Blog Features

- **Automatic Processing**: Posts are automatically processed from markdown to HTML
- **Syntax Highlighting**: Code blocks are highlighted with proper syntax coloring
- **Reading Time**: Automatically calculated and displayed
- **SEO Optimization**: Metadata is generated from frontmatter for search engines
- **Responsive Design**: Blog posts look great on all devices
- **Typography**: Styled with Tailwind Typography for optimal readability

### Blog Routes

- `/blog` - Lists all blog posts
- `/blog/[slug]` - Individual blog post pages

### Key Dependencies

- `gray-matter` - Parse frontmatter from markdown files
- `remark` & `remark-html` - Convert markdown to HTML
- `rehype-highlight` - Syntax highlighting for code blocks
- `reading-time` - Calculate reading time statistics
- `@tailwindcss/typography` - Beautiful typography styles

## Development Tips

If you're seeing linting errors in CSS files related to Tailwind features (like `@theme` or other Tailwind directives), install the **PostCSS Language Support** VS Code extension. This will provide proper syntax highlighting and resolve false linting errors for Tailwind CSS v4 features.

## GSAP animations

This project includes a small, reusable GSAP setup for initializing animations via `data-animate` attributes.

- Library location:
  - `src/lib/gsap/register.ts` – registers `ScrollTrigger` (client-only)
  - `src/lib/gsap/animations/` – animation initializers (e.g. `stretch`)
  - `src/lib/gsap/animations/index.ts` – animation registry and defaults
  - `src/hooks/useAnimations.ts` – React hook to init selected animations
  - `src/components/AnimationsInit.tsx` – client component wrapper around the hook

### Usage

- In server components (App Router pages by default):
  Add the client component somewhere in the page tree. It renders nothing and runs the effects.

```tsx
// In a server component file (no 'use client')
import AnimationsInit from '@/components/AnimationsInit'

export default function Page() {
  return (
    <div>
      <AnimationsInit animations={['stretch']} />
      <h1>
        Hell
        <span
          className="[font-stretch:100%] inline-block"
          data-animate="stretch"
          data-duration="1.1"
        >
          o
        </span>
      </h1>
    </div>
  )
}
```

- In client components: use the hook to optionally scope initialization to part of the DOM.

```tsx
'use client'
import { useRef } from 'react'
import { useAnimations } from '@/hooks/useAnimations'

export default function ClientSection() {
  const scopeRef = useRef<HTMLDivElement | null>(null)
  useAnimations({ scopeRef, animations: ['stretch'] })
  return (
    <div ref={scopeRef}>
      <span className="[font-stretch:100%]" data-animate="stretch">
        A
      </span>
    </div>
  )
}
```

### Defaults and options

- If `animations` is omitted, the hook/component initializes the default set from `DEFAULT_ANIMATIONS` (currently `['stretch']`).
- You can pass per-page custom animations:

```tsx
import type { AnimationInit } from '@/lib/gsap/animations'

const wiggle: AnimationInit = ({ scope }) => {
  const els = Array.from(
    scope.querySelectorAll('[data-animate="wiggle"]')
  ) as HTMLElement[]
  const kills = els.map((el) => {
    const { gsap } = require('gsap')
    const t = gsap.to(el, { rotate: 5, yoyo: true, repeat: 1, duration: 0.2 })
    return () => t.kill()
  })
  return () => kills.forEach((k) => k())
}

;<AnimationsInit animations={['stretch', 'wiggle']} custom={{ wiggle }} />
```

### Adding a new built-in animation

1. Create a file in `src/lib/gsap/animations/yourAnimation.ts` that exports an initializer of type `AnimationInit`.
2. Add it to the registry in `src/lib/gsap/animations/index.ts` and update `BaseAnimationId` and `DEFAULT_ANIMATIONS` if desired.
3. Use it by adding `data-animate="yourAnimation"` to elements and including it in `animations` (or in the default list).

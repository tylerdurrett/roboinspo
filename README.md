# Robo Inspo

A personal portfolio and content curation site built with Next.js 16, Sanity CMS, and modern web technologies.

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **React 19**
- **TypeScript 5** with strict mode
- **Tailwind CSS v4** with PostCSS
- **Sanity CMS** for content management
- **Velite** for markdown-based content (TD Resources)
- **Mux** for video hosting and streaming
- **GSAP** for animations
- **Shadcn/ui** for component library
- **Resend** for transactional emails
- **Cloudflare Turnstile** for bot protection

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:9600](http://localhost:9600) with your browser to see the result.

## Essential Commands

```bash
# Development server (runs on port 9600 with Turbopack)
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

# Extract Sanity schema and generate types
npm run gen
```

## Project Structure

```
content/                    # Markdown content for TD Resources
├── creators/               # Creator profiles
├── organizations/          # Organization profiles
└── resources/              # Learning resources

src/
├── app/                    # Next.js App Router pages
│   ├── (with-nav)/         # Pages with navigation layout
│   │   ├── blog/           # Blog posts (Sanity CMS)
│   │   ├── contact/        # Contact form
│   │   ├── looking/        # Visual gallery from reading list
│   │   ├── oldthings/      # Portfolio/things gallery
│   │   ├── reading/        # Curated reading list
│   │   └── touchdesigner/  # TD Resources pages
│   ├── admin/              # Sanity Studio (/admin)
│   └── actions/            # Server actions
├── components/             # React components
│   ├── blog/               # Blog-related components
│   ├── contact/            # Contact form components
│   ├── fx/                 # Visual effects (FxLayer)
│   ├── graphics/           # Background graphics (noise, shaders)
│   ├── layouts/            # Navigation and layout components
│   ├── td-resources/       # TD Resources components
│   ├── things/             # Portfolio item components
│   ├── typography/         # Text animation components
│   ├── ui/                 # Shadcn UI components
│   └── video/              # Video player components (Mux)
├── features/               # Feature modules
│   └── video-feed/         # Video feed functionality
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── gsap/               # GSAP animation system
│   └── td-resources/       # TD Resources data access layer
├── models/                 # Sanity data fetching functions
└── sanity/                 # Sanity configuration
    └── schemaTypes/        # Content type definitions
```

## Main Sections

### Things (`/oldthings`)

A portfolio gallery displaying creative projects with featured images and Mux videos. Each "thing" can have multiple images, videos, and rich text content.

### Reading (`/reading`)

A curated reading list with AI-summarized articles. Features include:

- Article summaries and key points
- Discussion analysis (e.g., Hacker News sentiment)
- Category filtering
- Pagination

### Looking (`/looking`)

A visual gallery view of featured images from the reading list.

### Blog (`/blog`)

A traditional blog powered by Sanity CMS with:

- Rich text content with syntax-highlighted code blocks
- Mux video support
- Category organization
- Author attribution

### Contact (`/contact`)

A contact form with Cloudflare Turnstile bot protection, built with react-hook-form and Zod validation.

### TouchDesigner Resources (`/touchdesigner/resources`)

A curated database of TouchDesigner learning resources built with markdown files and Velite. Features include:

- Filterable table of tutorials, courses, YouTube channels, and more
- Multi-select filters for source type, pricing, skill level, topics, and domains
- Detail pages for each resource with creator/organization info
- Type-safe content with build-time schema validation

See [\_docs/td-resources-system.md](_docs/td-resources-system.md) for full documentation.

## Sanity CMS

Content is managed through Sanity CMS, accessible at `/admin`.

### Content Types

- **Post** - Blog posts with rich text, images, and videos
- **Reading List** - Curated articles with summaries and discussion analysis
- **Thing** - Portfolio items with images and videos
- **Category** - Taxonomy for organizing content
- **Author** - Blog post authors

### Working with Sanity

```bash
# Generate TypeScript types from schema
npm run gen
```

Types are generated to `sanity.types.ts`. Data fetching functions live in `src/models/`.

## GSAP Animations

The project includes a reusable GSAP animation system using `data-animate` attributes.

### Available Animations

- `stretch` - Font stretch animation
- `revealOnLoad` - Reveal animation on page load
- `fadeUp` - Fade up on scroll

### Usage in Server Components

```tsx
import AnimationsInit from '@/components/AnimationsInit'

export default function Page() {
  return (
    <div>
      <AnimationsInit animations={['stretch']} />
      <span data-animate="stretch" data-duration="1.1">
        Animated text
      </span>
    </div>
  )
}
```

### Usage in Client Components

```tsx
'use client'
import { useRef } from 'react'
import { useAnimations } from '@/hooks/useAnimations'

export default function ClientSection() {
  const scopeRef = useRef<HTMLDivElement | null>(null)
  useAnimations({ scopeRef, animations: ['stretch'] })

  return (
    <div ref={scopeRef}>
      <span data-animate="stretch">Animated</span>
    </div>
  )
}
```

### Adding New Animations

1. Create a file in `src/lib/gsap/animations/yourAnimation.ts` exporting an `AnimationInit` function
2. Register it in `src/lib/gsap/animations/index.ts`
3. Use via `data-animate="yourAnimation"` attribute

## Video Integration

Videos are hosted on Mux and played using the Mux Player React component. The `video-feed` feature module provides utilities for mapping Sanity video data to a consistent format.

## Theming

The site supports light and dark mode via CSS custom properties in `globals.css`. Currently defaults to dark mode. Colors use the OKLCH color space for perceptually uniform adjustments.

## Development Tips

- Install the **PostCSS Language Support** VS Code extension for Tailwind CSS v4 syntax highlighting
- Use semantic color variables (e.g., `text-foreground`, `bg-background`) for theme compatibility
- Run `npm run format` to fix Prettier formatting issues
- Types are auto-generated from Sanity schema - run `npm run gen` after schema changes

# Working With This Repo

## Project Overview

This is a Next.js 15 application using the App Router pattern with TypeScript and Tailwind CSS v4.

## Architecture

### Tech Stack

- **Next.js 15.3.3** with App Router
- **React 19.0.0**
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS v4** with PostCSS
- **Shadcn/ui** for component library
- **ESLint 9** with Next.js configuration and Prettier integration
- **Prettier** for code formatting (auto-format on save in VS Code)

### Project Structure

- `/src/app/` - App Router pages and layouts
- TypeScript path alias: `@/*` maps to `./src/*`
- Tailwind CSS uses the new v4 inline theme approach with CSS custom properties

### UI Components

- Use Shadcn components for standard UI components, located in src/components/ui
- Common UI components live in `/src/components/ui/` and you import them with `@/components/ui/...`
- This site may be in light or dark mode, so always use semantic coloring that is compatible with both color modes.
- To add a component, use `npm run add <component-name>` to add the component
- It's preferred to use Tailwind classes over inline styles or external CSS. If you do need to create custom external CSS rules, add them to a file co-located with the component or page and import it.

## Sanity CMS

- The site uses Sanity CMS to bring in some of the content.
- Sanity settings are in `sanity.donfig.ts` and `src/sanity/`
- Sanity types are generated with `npm run gen` and land in `sanityp.types.ts`
- Fetch functions are in `src/models/*`

## Important Reminders

- Don't run the dev server - it's already running.
- Don't use `any` types. They'll get flagged by the linter and you'll have to fix them.
- Always ask the user before making changes to which packages are installed.
- You have outdated knowledge of the libraries used in this project. Always reference the current documenation before making changes.
- You must always look up the correct types before implementing code. Your knowledge is incomplete and outdated. Look up the correct types. Solve the root of the problem, do NOT create workarounds or bypass the error.

## Claude Only

- Always run format and lint to check your work when you're done. Running format first will fix a lot of the lint errors.

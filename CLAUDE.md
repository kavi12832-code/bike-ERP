# Development Rules & Architectural Standards

## Rules
- **JSX Component Integrity**: Every component used in JSX must be imported or defined in the same file. No undefined components or missing imports are tolerated.
- **Single Source of Truth for Reusable UI**: Reusable UI components belong in `src/components/ui/` and must be exported from its barrel file `src/components/ui/index.js`. Never define a reusable component inside a page file.
- **Verification Gates**: Before finishing any task or milestone, run `npm run check` (`eslint src && vite build`) and fix all errors. Do not report any task as done until `npm run check` passes with zero errors.
- **Dev Mode Logging**: Error boundaries must log the complete error, component stack, and active route to the browser console during development so issues are never silently masked.


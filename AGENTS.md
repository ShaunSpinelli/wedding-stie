# AGENTS.md - AI Agent Guidelines for Sakeenah

Guidelines for AI coding agents working in this repository.

## Project Overview

Modern Islamic wedding invitation platform:

- **Frontend**: React 18 + Vite 6 + Tailwind CSS
- **Backend**: Hono 4 REST API running on Bun
- **Database**: PostgreSQL with multi-tenant architecture
- **Deployment**: Cloudflare Workers (edge deployment)

## Build, Lint, and Test Commands

### Development

```bash
bun run dev           # Run both client (5173) and server (3000) concurrently
bun run dev:client    # Start Vite dev server only
bun run dev:server    # Start Hono API server only
```

### Build and Lint

```bash
bun run build         # Production build with Vite
bun run lint          # Run ESLint on all files
bun run preview       # Preview production build locally
```

### Deployment (Cloudflare Workers)

```bash
bun run deploy        # Build and deploy to Cloudflare Workers
bun run cf:dev        # Test with Cloudflare Workers runtime locally
```

### Testing

**No test framework currently implemented.** When adding tests:

- Use Vitest (recommended for Vite projects)
- Co-locate unit tests with source: `*.spec.js`, integration: `*.integration.spec.js`
- E2E tests go in `/e2e` directory
- Run single test: `bunx vitest run path/to/file.spec.js`

## Code Style Guidelines

### File Naming

- **All files**: `kebab-case.js` or `kebab-case.jsx`
- **Components**: `hero.jsx`, `events-card.jsx`
- **Hooks**: `use-config.js`, `use-invitation.js`

### Naming Conventions

| Type                | Convention           | Example                        |
| ------------------- | -------------------- | ------------------------------ |
| Components          | PascalCase           | `Hero`, `LandingPage`          |
| Functions/Variables | camelCase            | `formatEventDate`, `guestName` |
| Constants           | SCREAMING_SNAKE_CASE | `API_URL`, `ATTENDING`         |
| Hooks               | `use` prefix         | `useConfig`, `useInvitation`   |

### Imports

```javascript
// External dependencies first
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// Internal imports using @ alias (maps to src/)
import { useInvitation } from "@/features/invitation";
import { cn } from "@/lib/utils";
```

### Component Structure

```jsx
export default function ComponentName() {
  // 1. Hooks at the top
  const config = useConfig();
  const [state, setState] = useState(initialValue);
  // 2. Effects
  useEffect(() => {
    /* Side effects */
  }, [dependencies]);
  // 3. Event handlers
  const handleClick = () => {
    /* ... */
  };
  // 4. Render
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* JSX content */}
    </motion.div>
  );
}
```

### Styling with Tailwind CSS

```javascript
import { cn } from "@/lib/utils";
// Use cn() helper for conditional classes
<div className={cn("flex items-center", isActive && "border-rose-500")} />;
```

### State Management

- **Local state**: React `useState`
- **Server state**: TanStack Query (`@tanstack/react-query`)
- **Global state**: React Context (`InvitationProvider`)

## Error Handling

1. **Never fail silently** - No empty catch blocks
2. **Fail fast** - Validate at system boundaries
3. **Provide context** - Include error codes for debugging
4. **Sanitize externally** - Don't expose internals to users

### Backend Error Response Format

```javascript
// Success
return c.json({ success: true, data: result });
// Error
return c.json(
  { success: false, error: "Message", code: "ERROR_CODE" },
  statusCode,
);
```

### HTTP Status Codes

`200` Success | `201` Created | `204` No Content | `400` Validation | `404` Not Found | `409` Conflict | `500` Server Error

## API Design (Hono)

### Request Validation with Zod

```javascript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const createWishSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  message: z.string().min(1).max(500).trim(),
  attendance: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]).default("MAYBE"),
});

api.post(
  "/:uid/wishes",
  zValidator("param", uidParamSchema),
  zValidator("json", createWishSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const { name, message } = c.req.valid("json");
    // ...
  },
);
```

- Mount API routes under `/api` prefix
- Use resource-based URLs: `/api/:uid/wishes`
- Validate all inputs with Zod schemas

## Project Structure

**Feature-based organization for scalability** (vertical slices over horizontal layers):

```
src/
├── features/                    # Business features (vertical slices)
│   ├── invitation/              # Core invitation display & state
│   │   ├── components/          # Feature-specific components
│   │   │   ├── hero.jsx         # Hero section with couple info
│   │   │   ├── landing-page.jsx # Entry page with invitation open
│   │   │   └── main-content.jsx # Main invitation content wrapper
│   │   ├── hooks/
│   │   │   └── use-config.js    # Config fetching hook
│   │   ├── invitation-context.jsx  # Global invitation state
│   │   └── index.js             # Public exports
│   ├── wishes/                  # Guest wishes/RSVP
│   │   ├── components/
│   │   │   └── wishes.jsx       # Wishes form and list
│   │   └── index.js
│   ├── events/                  # Wedding events/agenda
│   │   ├── components/
│   │   │   ├── events.jsx       # Events section
│   │   │   └── events-card.jsx  # Event card with calendar
│   │   └── index.js
│   ├── gifts/                   # Gift registry
│   │   ├── components/
│   │   │   └── gifts.jsx        # Bank accounts display
│   │   └── index.js
│   └── location/                # Venue and maps
│       ├── components/
│       │   └── location.jsx     # Map embed and details
│       └── index.js
├── components/                  # Shared UI components
│   ├── ui/                      # Reusable primitives (shadcn/ui)
│   │   └── marquee.jsx
│   └── layout/                  # Layout components
│       ├── layout.jsx           # App layout wrapper
│       ├── bottom-bar.jsx       # Navigation bar
│       └── index.js
├── lib/                         # Shared utilities
│   ├── utils.js                 # cn() helper for Tailwind
│   ├── api.js                   # API client functions
│   ├── base64.js                # Base64 encoding
│   ├── format-event-date.js     # Date formatting
│   └── invitation-storage.js    # localStorage helpers
├── services/                    # API service layer
│   └── api.js                   # HTTP client for backend
├── config/                      # Static configuration
│   └── config.js                # Fallback/default config
├── server/                      # Backend API (Hono)
│   ├── features/                # Feature-based routes
│   │   ├── invitation/          # Invitation API routes
│   │   │   ├── routes.js        # GET /api/invitation/:uid
│   │   │   └── index.js
│   │   └── wishes/              # Wishes API routes
│   │       ├── routes.js        # CRUD /api/:uid/wishes
│   │       └── index.js
│   ├── lib/                     # Shared server utilities
│   │   └── db-client.js         # Database connection helper
│   ├── db/                      # Database layer
│   │   ├── index.js             # PostgreSQL connection
│   │   └── migrations/          # SQL migrations
│   ├── index.js                 # Hono app (CF Workers entry)
│   ├── server.js                # Node.js/Bun server entry
│   └── schemas.js               # Zod validation schemas
├── app.jsx                      # Root app component
├── main.jsx                     # React entry point
└── index.css                    # Global styles
```

### Feature Module Pattern

Each feature exports its public API via `index.js`:

```javascript
// features/invitation/index.js
export { InvitationProvider, useInvitation } from "./invitation-context";
export { useConfig } from "./hooks/use-config";
export { default as Hero } from "./components/hero";
export { default as LandingPage } from "./components/landing-page";
export { default as MainContent } from "./components/main-content";

// Usage in other files
import { useInvitation, useConfig } from "@/features/invitation";
import { Wishes } from "@/features/wishes";
```

## Key Dependencies

| Package                 | Purpose                 |
| ----------------------- | ----------------------- |
| `react`                 | UI framework            |
| `hono`                  | Backend API framework   |
| `@tanstack/react-query` | Server state management |
| `framer-motion`         | Animations              |
| `zod`                   | Schema validation       |
| `tailwindcss`           | Utility-first CSS       |
| `lucide-react`          | Icons                   |

## Additional Guidelines

This project has extensive AI agent rules in `.agent/rules/`. Key principles:

1. **Write idiomatic JavaScript/React code** - Follow community conventions
2. **Organize by feature, not layer** - Vertical slices over horizontal layers
3. **Test pyramid**: 70% unit, 20% integration, 10% E2E
4. **TDD cycle**: Red-Green-Refactor when adding new features
5. **Security**: Never expose stack traces or SQL queries to users

See `.agent/rules/` for guidelines on error handling, testing, API design, and project structure.

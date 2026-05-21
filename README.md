# GiveWay

GiveWay is a local-first NGO discovery and donation platform built with Next.js. It is designed to help donors discover vetted organizations, follow causes, track activity, donate, volunteer, and explore NGO-facing management flows in a polished demo environment.

The application runs without a separate backend service. Most data is seeded from local source files and persisted in the browser with `localStorage`, which makes the project easy to run, demo, and reset.

## What The App Does

- Helps users discover NGOs by cause, state, and verification status.
- Provides donor flows for following NGOs, donating, and tracking impact.
- Includes a personalized activity feed with read/unread controls and curated recommendations.
- Offers NGO dashboard pages for managing posts, needs, team members, and donations.
- Supports lightweight local authentication and role-based navigation.

## Main Features

- NGO discovery with filtering and verification controls.
- Individual NGO profile pages with donations and volunteer actions.
- Donor profile and impact dashboard views.
- NGO admin dashboard and operational management tools.
- Personal feed with sections for activity, recommendations, and urgent causes.
- Toast notifications, modal dialogs, tabs, progress indicators, and charts throughout the experience.

## Routes

- `/` - Landing page and top-level NGO discovery entry point.
- `/discover` - Filterable NGO browser.
- `/ngos/[id]` - NGO detail page.
- `/login` - Local login form.
- `/signup` - Account creation with donor or NGO role selection.
- `/forgot-password`, `/reset-password`, `/verify-email` - Supporting auth flows.
- `/dashboard` - Donor impact dashboard.
- `/my-feed` - Personalized activity feed.
- `/profile` - User profile, followed NGOs, and recent searches.
- `/ngo-dashboard` - NGO operations hub.
- `/admin` - Admin page.

## Tech Stack

- Next.js 15 with the App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- shadcn/ui and Radix UI components.
- Recharts for dashboard visualizations.
- React Hook Form, Zod, and `@hookform/resolvers` for form handling.
- `date-fns` for date formatting and comparisons.

## Prerequisites

- Node.js 18 or newer.
- npm.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:9002
```

## Available Scripts

- `npm run dev` - Starts the development server on port 9002 with Turbopack.
- `npm run build` - Builds the production bundle.
- `npm run start` - Starts the production server after a build.
- `npm run lint` - Runs Next.js linting.
- `npm run typecheck` - Runs the TypeScript compiler in no-emit mode.

## Docker

The repository includes `Dockerfile` and `docker-compose.yml` files for containerized local development.

Build and run with Docker Compose:

```bash
docker compose up --build
```

The container maps port `9002` to the host, so the application will still be available at `http://localhost:9002`.

If you use the compose workflow, provide any expected environment variables in your shell or `.env` file before starting the container. The compose file forwards `GEMINI_API_KEY` into the container when present.

## Data And State

GiveWay is intentionally local-first for demo and development use.

- Seed data lives in `src/lib/data.ts`, `src/data/feedData.ts`, and related content files.
- Auth and user state are stored in browser `localStorage`.
- NGO records, donations, and user activity are managed by the local API client layer in `src/lib/api-client.ts`.
- Refreshing browser storage will reset local session data and any demo-created state.

## Key User Journeys

### Donor Journey

1. Open the landing page or go directly to `Discover`.
2. Filter NGOs by cause, state, or verification status.
3. Open an NGO profile to review its mission, impact, and funding progress.
4. Donate or volunteer from the NGO detail page.
5. Review activity and contribution history in `Dashboard`, `My Feed`, and `Profile`.

### NGO Journey

1. Sign up as an NGO user.
2. Access the NGO dashboard from the top navigation.
3. Create or manage NGO posts and needs.
4. Review supporters, volunteer requests, and donation activity.

## Project Structure

- `src/app` - App Router pages and route segments.
- `src/components` - Shared UI and feature components.
- `src/contexts` - Authentication state.
- `src/data` - Feed and demo data.
- `src/lib` - Local API client, utilities, and seed data.
- `src/types` - Shared TypeScript types.

## Notes

- The app is optimized for a demo-style local setup, not for production authentication or payments.
- Some content is seeded and static by design to keep the experience consistent.
- The UI uses a custom visual system with a Montserrat-based typography setup and Tailwind styling.

## Troubleshooting

- If the app does not load, make sure another process is not already using port `9002`.
- If local state looks stale, clear the browser storage for the site and reload.
- If Docker fails to start, verify that the image build completed successfully and that your environment variables are available to Compose.

# Resume Builder (SQLite Backend + CCAvenue)

This project uses a local SQLite backend (`Express + better-sqlite3`) for auth and template purchases, with CCAvenue as the payment gateway.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create env file and configure CCAvenue keys.
cp .env.example .env

# Step 5: Start frontend + backend together.
npm run dev
```

Backend API runs at `http://localhost:3001` and frontend at `http://localhost:8080`.
SQLite DB file is created at `server/data/resume-builder.sqlite`.

Create a `.env` file for production checkout:

```env
# Backend (server-side secret keys)
CCAVENUE_MERCHANT_ID=xxxxxxxx
CCAVENUE_ACCESS_CODE=xxxxxxxx
CCAVENUE_WORKING_KEY=xxxxxxxx
CCAVENUE_ENV=production

# Optional
API_PORT=3001
JWT_SECRET=replace-with-strong-secret
```

Payment flow now runs as:
1. User adds template(s) to cart.
2. Backend creates encrypted CCAvenue request (`/api/checkout/create-order`).
3. Frontend posts user to CCAvenue payment page.
4. CCAvenue posts result to backend callback (`/api/checkout/ccavenue/response`), backend unlocks templates, then redirects back to frontend.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express
- SQLite (better-sqlite3)

## How can I deploy this project?

You can deploy this as a single Node service (backend + built frontend from `dist`).

### Production Build

```sh
npm ci
npm run build
npm run start
```

### Required Environment Variables

```env
NODE_ENV=production
API_PORT=3001
JWT_SECRET=replace-with-strong-secret
ALLOWED_ORIGINS=https://your-domain.com
CCAVENUE_MERCHANT_ID=xxxxxxxx
CCAVENUE_ACCESS_CODE=xxxxxxxx
CCAVENUE_WORKING_KEY=xxxxxxxx
CCAVENUE_ENV=production
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Notes:
- In production, the server now serves the built SPA (`dist`) and all API routes under `/api/*`.
- If frontend and backend are on the same domain, `ALLOWED_ORIGINS` can be set to that domain.
- Health check endpoint: `/api/health`

### Deploy on Render/Railway/Fly/VM

1. Build command: `npm ci && npm run build`
2. Start command: `npm run start`
3. Set all required environment variables.
4. Persist storage for SQLite at `server/data/` if your platform uses ephemeral disks.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

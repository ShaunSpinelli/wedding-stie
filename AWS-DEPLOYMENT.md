# AWS & GitHub Pages Deployment Guide

This guide outlines the steps to deploy the Sakeenah Wedding Invitation platform using **AWS Lambda** for the backend, **Neon.tech** for the database, and **GitHub Pages** for the frontend.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [Bun](https://bun.sh/) installed
- A [Neon.tech](https://neon.tech) account (for the "Free Forever" PostgreSQL tier)
- GitHub repository for frontend hosting

---

## 1. Database Setup (Neon.tech)

1.  **Create a Project**: Log in to Neon and create a new PostgreSQL project.
2.  **Get Connection String**: Copy the "Connection String" (it should look like `postgresql://user:password@endpoint/neondb`).
3.  **Apply Migrations**: Run the SQL files in `src/server/db/` against your Neon database in this order:
    - `schema.sql.example` (Initial tables)
    - `003-migrate-guests-uuid.sql` (UUID support)
    - `004-add-guest-details.sql` (Additional guest fields)
    - `005-add-guest-language.sql` (Language support)
4.  **Seed Data**: Run `seed-shaun-manon.sql` to populate the initial wedding configuration.

---

## 2. Backend Deployment (AWS Lambda)

The backend is deployed using **AWS CDK** into the "Always Free" tier.

### Step 1: Configure Environment
Add the following to your root `.env` file:
```env
DATABASE_URL=your_neon_connection_string
ADMIN_SECRET=your_chosen_admin_password
AWS_PROFILE=your_personal_aws_profile_name
```

### Step 2: Bootstrap AWS (First time only)
```bash
bun run aws:bootstrap
```

### Step 3: Deploy
```bash
bun run aws:deploy
```
After deployment, copy the **`ApiUrl`** output (e.g., `https://a1b2c3d4.execute-api.us-west-1.amazonaws.com`).

---

## 3. Frontend Deployment (GitHub Pages)

### Step 1: Configure GitHub Variables
1.  Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions**.
2.  In the **Variables** tab, click **New repository variable**.
3.  **Name**: `VITE_API_URL`
4.  **Value**: Your AWS `ApiUrl` (without a trailing slash).

### Step 2: Deploy
Push your changes to the `main` branch. The GitHub Action in `.github/workflows/deploy.yml` will automatically build and deploy the site.

```bash
git add .
git commit -m "deploy: update configuration"
git push origin main
```

---

## 4. Maintenance & Operations

### Useful Commands
- `bun run aws:whoami`: Verify which AWS account is currently being used by the project.
- `bun run aws:synth`: Preview the AWS CloudFormation template without deploying.
- `bun run aws:deploy`: Update the backend after making code changes.

### Troubleshooting CORS
The backend CORS is configured in `src/server/index.js`. If you change your frontend domain, ensure you add it to the `origin` array in that file and redeploy the backend.

### Project Scoping
AWS operations are scoped to this project via `cdk.json` and `dotenv-cli`. This ensures that even if you have work AWS accounts, this project will always use the profile specified in your `.env`.

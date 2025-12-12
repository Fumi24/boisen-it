# GitHub Actions Setup Guide

To enable automatic deployments via GitHub Actions, you need to configure secrets and environments.

## Step 1: Create Production Environment

1. Go to your repository on GitHub
2. Click **Settings** → **Environments**
3. Click **New environment**
4. Name it: `production`
5. Click **Configure environment**
6. (Optional) Add protection rules:
   - ✅ Required reviewers (add yourself)
   - ✅ Wait timer: 0 minutes

## Step 2: Get Your Cloudflare Credentials

### Get API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template or create custom token with:
   - **Permissions**:
     - Account → Workers Scripts → Edit
     - Account → Workers KV Storage → Edit
     - Account → D1 → Edit
     - Account → Cloudflare Pages → Edit
     - Account → Account Settings → Read
   - **Account Resources**:
     - Include → Your Account
4. Click **Continue to summary** → **Create Token**
5. **Copy the token** (you won't see it again!)

### Get Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on **Workers & Pages**
3. Your **Account ID** is shown in the right sidebar
4. Copy it

## Step 3: Add Secrets to GitHub

### Option A: Environment Secrets (Recommended)

1. Go to **Settings** → **Environments** → **production**
2. Under "Environment secrets", click **Add secret**
3. Add these two secrets:

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: (paste your API token)

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: (paste your Account ID)

### Option B: Repository Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the same two secrets as above

## Step 4: Test Deployment

### Automatic Deployment

Push any commit to `main` branch:
```bash
git commit --allow-empty -m "test: trigger deployment"
git push
```

### Manual Deployment

1. Go to **Actions** tab
2. Click **Deploy to Cloudflare** workflow
3. Click **Run workflow** → **Run workflow**

## Step 5: Verify Deployment

1. Go to **Actions** tab
2. Click on the running workflow
3. Watch the deployment progress
4. Check for any errors

## Troubleshooting

### Error: "CLOUDFLARE_API_TOKEN not found"
- Make sure you added the secret with the exact name `CLOUDFLARE_API_TOKEN`
- Check it's in the correct environment (`production`)

### Error: "Permission denied"
- Verify your API token has all required permissions
- Try regenerating the token with correct scopes

### Error: "Account ID invalid"
- Double-check you copied the correct Account ID
- It should be a 32-character hexadecimal string

### Error: "Namespace not found"
- Make sure you've created the KV namespace and D1 database
- Verify the IDs in `wrangler.toml` are correct

## What Gets Deployed

On each push to `main`:

1. ✅ Dependencies installed
2. ✅ Frontend built (Vite)
3. ✅ Worker deployed to Cloudflare
4. ✅ Pages deployed to Cloudflare

## Deployment URLs

After successful deployment:

- **Worker**: `https://interactive-pipeline.<your-subdomain>.workers.dev`
- **Pages**: `https://interactive-pipeline.pages.dev`

You can find the exact URLs in:
- Cloudflare Dashboard → Workers & Pages
- GitHub Actions logs (after deployment)

## Manual Deployment Alternative

If you prefer manual deployment over GitHub Actions:

1. Disable the workflow:
   - Rename `.github/workflows/deploy.yml` to `.github/workflows/deploy.yml.disabled`

2. Deploy manually:
   ```bash
   npm run build
   npm run worker:deploy
   npm run deploy
   ```

## Security Notes

- ✅ Never commit API tokens to git
- ✅ Use environment protection for production
- ✅ Rotate API tokens periodically
- ✅ Use minimal permissions for tokens
- ✅ Review deployment logs regularly

---

**Need help?** Check [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.

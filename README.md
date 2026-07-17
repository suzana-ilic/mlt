# MLT & AI Communities

A global community of 20,000 engineers, researchers and domain experts in AI learning, collaborating, and contributing to open source and open science.

- [Website](https://mlt.ai)
- [Events](https://luma.com/AI-Communities)
- [Newsletter](https://mltaicommunities.substack.com/)

## Run locally

```bash
python3 -m http.server 8765
```

Open http://localhost:8765

## Deploy on Vercel

### 1. Import the project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. **Add New → Project**
3. Import `suzana-ilic/mlt`
4. Settings:
   - **Framework Preset:** Other
   - **Build Command:** leave empty
   - **Output Directory:** leave empty
   - **Install Command:** leave empty
5. Click **Deploy**

Vercel will give you a preview URL like `mlt-xxxx.vercel.app`. Confirm the site looks correct.

### 2. Add your domain in Vercel

1. Open the project → **Settings → Domains**
2. Add `mlt.ai`
3. Add `www.mlt.ai` and set it to redirect to `mlt.ai` (recommended)

Vercel will show the DNS records you need.

### 3. Configure Namecheap DNS

In **Namecheap → Domain List → mlt.ai → Manage → Advanced DNS**:

Remove or disable old records pointing to a previous host (old A/CNAME/URL redirect records).

Add:

| Type  | Host | Value                 |
|-------|------|-----------------------|
| **A Record**   | `@`  | `76.76.21.21`         |
| **CNAME Record** | `www` | `cname.vercel-dns.com` |

Save changes. DNS can take a few minutes to a few hours.

Vercel will automatically provision HTTPS once DNS propagates.

### 4. Verify

- https://mlt.ai loads the site
- https://www.mlt.ai redirects to https://mlt.ai

**Optional:** Instead of manual DNS records, you can switch Namecheap nameservers to Vercel’s (shown in the Domains settings). Vercel then manages DNS for you.

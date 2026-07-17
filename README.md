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

## Deploy

This is a static site (`index.html` + `assets/`). Deploy to any static host, then point your Namecheap domain at it.

**Easy options:** [Cloudflare Pages](https://pages.cloudflare.com), [Netlify](https://netlify.com), or [GitHub Pages](https://pages.github.com)

Connect your GitHub repo, set the publish directory to `/` (root), and add `mlt.ai` as a custom domain in the host's dashboard. In Namecheap → Advanced DNS, point `www` (CNAME) and `@` (ALIAS or A record) to the values your host provides.

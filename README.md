# MLT & AI Communities

A global community of 20,000 engineers, researchers and domain experts in AI learning, collaborating, and contributing to open source and open science.

- [Website](mlt.ai)
- [Events](https://luma.com/AI-Communities)
- [Newsletter](https://mltaicommunities.substack.com/)

## Run locally

```bash
npm install
cp .env.example .env   # set ANALYTICS_TOKEN to a secret string
npm start
```

If port 8765 is already in use (e.g. an old static server), stop it first:

```bash
lsof -ti :8765 | xargs kill
```

- Site: http://localhost:8765
- Analytics dashboard: http://localhost:8765/dashboard.html

To use a different port, change `PORT` in `.env` and restart.

## Analytics

The site records page views and referrer sources (e.g. Google, Twitter, direct). Data is stored locally in `data/analytics.json`. The dashboard is protected by `ANALYTICS_TOKEN` in `.env`.

**Note:** Analytics requires the Node server (`npm start`). Static hosting alone (e.g. GitHub Pages) will not collect visits unless you deploy the server or adapt the API.

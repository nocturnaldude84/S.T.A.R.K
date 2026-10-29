# S.T.A.R.K. frontend preview

A one-page cinematic dark UI for **S.T.A.R.K. — System for Thinking, Analysis, Research and Knowledge**.

This is a frontend-only preview. AI models, web research, authentication, database persistence, and cloud synchronization are not connected yet. The composer deliberately shows a notice instead of pretending to send an AI request.

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Included

- Single-page responsive mindspace
- Five selectable agent identities
- Central conversation composer (UI preview only)
- Expandable evidence-network placeholder
- Desktop sidebar and mobile-friendly layout
- Dark cinematic styling and reduced-motion support

## Next implementation stage

Connect Supabase authentication and persistence, then add server-side model adapters and durable council jobs. Keep provider keys on the server and never add them to `NEXT_PUBLIC_` variables.

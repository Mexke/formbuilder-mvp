# FormBuilder (MVP)

Minimal repo for a FormBuilder that generates HTML forms and can upload them via WebDAV to TOPdesk. Deploy to Vercel.

## Setup

1. Copy repo files.
2. `npm install`
3. Add environment variables (see `.env.example` / Vercel project settings).
4. `npm run dev` to run locally.
5. Deploy to Vercel and set env vars.

## Notes
- API routes `/api/test-webhook` and `/api/upload` are implemented server-side and use Basic Auth when calling remote endpoints.
- Payment example uses Mollie; replace with your provider if desired.

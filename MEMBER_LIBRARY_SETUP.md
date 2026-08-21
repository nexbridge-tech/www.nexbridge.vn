# NexBridge Member Library Setup

The member-library code is complete but remains inactive until a Supabase project is connected.

## 1. Create and configure Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_member_library.sql` in the SQL editor.
3. In Authentication URL Configuration, set the production site URL to `https://nexbridge.vn`.
4. Add `https://nexbridge.vn/account.html` and the local development account URL to Redirect URLs.
5. Keep email confirmation enabled for production.

## 2. Configure Netlify environment variables

Add these variables in Netlify Site configuration:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The publishable key is included in member-page JavaScript and is safe to expose when RLS is enabled. The secret key is server-only and must never be placed in `_data`, templates, or client scripts.

## 3. Upload the first free document

Upload a PDF to the private `member-documents` bucket, for example:

`free/pcba-design-review-checklist-v1.pdf`

Then insert its metadata:

```sql
insert into public.documents
  (slug, title, summary, topic, version, access_level, status, storage_path, published_at)
values
  ('pcba-design-review-checklist',
   'PCBA Design Review Checklist',
   'A practical checklist for schematic, layout, DFM and validation reviews.',
   'Prototyping, PCBA & Component Supply',
   '1.0',
   'free_member',
   'published',
   'free/pcba-design-review-checklist-v1.pdf',
   now());
```

## 4. Verify the access flow

1. Register at `/register.html`.
2. Confirm the email and sign in at `/login.html`.
3. Open `/account.html` and confirm the free document appears.
4. Download it and verify the generated URL expires after five minutes.
5. Confirm the private bucket does not expose a permanent public URL.

## Security boundaries

- Decap CMS / Netlify Identity remains admin-only and is separate from customers.
- PDFs are never copied into `assets/` or `_site/`.
- The browser never receives `SUPABASE_SECRET_KEY` or `storage_path`.
- The Netlify Function verifies the access token with `auth.getUser()` before checking entitlement.
- Paid documents require an active row in `entitlements`.
- Payment checkout and webhook handling will be added in the paid-library phase.

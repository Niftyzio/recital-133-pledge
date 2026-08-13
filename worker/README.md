# Review worker

Signatures are emailed to the initiator with a review page. If the submitted name looks real, press **Publish this name**. Only the public display name is committed to `signatories.json`. No signer emails are stored.

Gmail prefetches links, so the email link opens a review page instead of publishing on GET.

## Deploy

From this folder:

```bash
npx wrangler login
npx wrangler secret put HMAC_SECRET
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put NOTIFY_EMAIL
npx wrangler deploy
```

`GITHUB_TOKEN` needs Contents: Read and write on `Niftyzio/recital-133-pledge`.
`NOTIFY_EMAIL` is `sara@nocodelab.ai`.
`HMAC_SECRET` is a long random string.

Then set `moderationUrl` in `config.js` to the workers.dev URL (no trailing slash) and push.

# Operator handoff

Use this file to continue in a **new Cursor chat**. Do not rely on the old thread.

## What this is

Independent public letter: **The Recital 133 Pledge**. Assisted is not generated.

- Live page: https://niftyzio.github.io/recital-133-pledge/
- Repo: https://github.com/Niftyzio/recital-133-pledge
- GitHub account/hosting: Niftyzio (not the public brand)
- Signature notices: `sara@nocodelab.ai` via FormSubmit
- Originating LinkedIn post: https://www.linkedin.com/posts/sarasimeone_myideasaremine-activity-7493221327546408961-bkKX
- Recital 133: https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-133
- Article 50: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50

## Voice

Sara Simeone. No em dashes. British English. No NoCodeLab product pitch on the page. Credit: content by Sara, crowd-sourced by LinkedIn users, page created by Cursor Grok 4.6.

## How signing works (live)

1. Person fills the form. No signer email is collected.
2. FormSubmit emails Sara. Stay on our page after submit (ajax). Do not show FormSubmit’s “an email was sent” screen.
3. Sara pastes the mail into chat. Agent adds a row to `signatories.json` and pushes `main`. Pages rebuilds.
4. Public name: first name + surname initial, unless `publish_full_name` is `yes`.
5. Delete the FormSubmit email after the name is on the page.
6. Checkboxes always send `publish_full_name` and `consent` as `yes`/`no`.

The Cloudflare worker in `worker/` is **off**. `moderationUrl` in `config.js` is empty. Do not revive it unless Sara asks. Too cumbersome.

## Names on the page now

Sara Simeone (Initiator); Antonio P. (CEO); Magnus Söderberg (CEO, Triolith Games AB); Eric H. (CEO); Bruno De Stefano (Relationship manager); Claire Owen (Founder, COCO Software); Mark H. (Inventor, Phoenix Bridge Solutions).

## Crowd-sourced lines

LinkedIn user 1–10 on the page. Real names only in local gitignored `ATTRIBUTION.private.md`. Do not publish those names unless they opt in.

## What not to do

- Do not store signer emails in git or on the page.
- Do not put `sara@nocodelab.ai` in the sign box.
- Do not add Google Forms, newsletters, or lead magnets.
- Do not write watermark-stripping instructions.
- Do not rewrite the original LinkedIn post; a new post is the launch of the page.

## Typical next task

Sara: “new one:” + FormSubmit table. Add to `signatories.json`, commit, push `main`.

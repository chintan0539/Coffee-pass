# Coffee Pass survey

A single-page survey built from `../Form/formQuestions.md`.

- `site/index.html` is the whole website (HTML, CSS and JS in one file). Deploy the `site` folder.
- `google-apps-script.gs` saves responses to a Google Sheet.

## Preview

Open `site/index.html` in a browser. Until `submitUrl` is set, responses are only saved in that browser
(and logged to the console), and the intro screen shows a "Preview mode" note.

Add `?reset` to the URL to clear saved progress and start fresh.

## Collect responses in Google Sheets

1. Create a Google Sheet, then open **Extensions → Apps Script**.
2. Replace the editor contents with `google-apps-script.gs` and save.
3. **Deploy → New deployment →** type **Web app**. Execute as **Me**, who has access **Anyone**. Authorise when asked.
4. Copy the web app URL (ends in `/exec`).
5. In `site/index.html`, set `submitUrl: 'https://script.google.com/macros/s/…/exec'` in `CONFIG`.
6. Submit one test response and check that a **Responses** tab appears in the sheet.

If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.

Each row has `status`: `complete`, or `screened_out` for people who answered "I don't drink coffee"
(their answers up to that question are saved). `waitlist_consent` is `Yes`/`No`.

## Publish

**GitHub Pages (set up):** `.github/workflows/pages.yml` publishes the `site` folder on every push to `main`.
One-time setup: in the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
The site is then at `https://chintan0539.github.io/Coffee-pass/`.

Any other static host also works, for example Netlify (`netlify.toml` points it at `survey/site`), Vercel or Cloudflare Pages.

## Track where people come from

Add `?src=` to the link you share, e.g. `…/?src=whatsapp` or `…/?src=instagram`. It's saved in the `source` column.

## How progress is saved

Answers are saved on the respondent's device as they go. If they close the page, they can come back and
tap **Continue**. Saved progress expires after 30 days, and personal details are removed from the device once the survey is submitted.

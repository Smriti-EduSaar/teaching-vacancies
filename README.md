# Smriti EduSar Teaching Vacancy Portal — Starter

A static, mobile-friendly GitHub Pages website for displaying approved government teaching vacancy records.

## Files
- `index.html` — page structure
- `style.css` — responsive design
- `app.js` — filtering and data loading

## Important before launch
The site initially runs in demo mode. The sample record is explicitly marked as a demo and is not a real vacancy. Do not advertise the website as containing live vacancies until the approved data feed has been connected and tested.

## Publish on GitHub Pages
1. Create a public repository in your new GitHub account, e.g. `teaching-vacancies`.
2. Upload the contents of this folder to the repository root.
3. In repository Settings → Pages, select Deploy from a branch, branch `main`, folder `/(root)`.
4. Save and wait for the Pages URL to appear.
5. Test the website on desktop and mobile.

## Google Sheets / Apps Script integration
1. Create a private Google spreadsheet with these tabs:
   - `Vacancies`
   - `Review Queue`
   - `Official Sources`
   - `Change Log`
2. Keep pending records separate from approved public records.
3. Create an Apps Script web app that returns only approved public fields as JSON.
4. Deploy it with access configured appropriately for public read-only requests.
5. Put the web app URL in the `DATA_URL` constant at the top of `app.js`.
6. Test that the response contains only approved records and no private notes, email addresses, credentials, or review comments.

Never put a service-account key, API key, password, or GitHub token in `app.js` or any other public repository file. If Apps Script needs a token for GitHub publishing, store it in Script Properties and restrict access to the script project.

## Recommended Vacancies columns
`id, organisation, post, subject, locationType, state, vacancyCount, notificationDate, applicationStart, lastDate, status, eligibilitySummary, notificationUrl, applyUrl, lastVerified, reviewStatus, approved`

Use `reviewStatus=Approved` only after checking the official notice and any corrigendum. Only approved records should be returned by the public data feed.

## Security and accuracy
- A public endpoint must return only fields intended for public display.
- A public spreadsheet or CSV is visible to anyone; never publish the private master sheet.
- Validate official links and review deadlines before approval.
- Keep a change log for corrections and deadline extensions.
- Do not imply that monitoring is comprehensive or real-time unless that is demonstrably true.

# Nightly Check-in

One black page for your daily and weekly goals, wins, and consistency streaks. Runs from `index.html` with no build step. Data lives in your own Google Sheet, free.

## 1. Host it on GitHub Pages (2 minutes)

```bash
cd nightly-tracker
git init
git add .
git commit -m "Nightly check-in"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nightly-tracker.git
git push -u origin main
```

Create the empty repo `nightly-tracker` on GitHub first (public or private). Then: repo **Settings > Pages > Build and deployment > Source: Deploy from a branch > main / (root) > Save**.
Your page appears at `https://YOUR-USERNAME.github.io/nightly-tracker/` in about a minute. (Pages on a private repo needs a paid plan, so keep the repo public. Your data is not in the repo.)

## 2. Connect the Google Sheet backend (5 minutes)

1. Go to sheets.new and create a blank sheet named **Nightly Check-in**.
2. **Extensions > Apps Script**. Delete the sample code and paste all of `apps-script/Code.gs`.
3. On the line `const TOKEN = '...'`, replace the text with a long random string (a password you make up). Keep it private. Press **Save**.
4. **Deploy > New deployment > gear icon > Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, then **Authorize access** and accept the Google prompts (choose Advanced > Go to project if it warns).
5. Copy the **Web app URL** (ends in `/exec`).
6. Open your page. In **Setup**, paste the URL and your token, add your GitHub username, press **Save and sync**.

The sheet creates two tabs by itself: `days` (one row per day) and `weeks`. You can add charts on top of them.

If you edit Code.gs later, use **Deploy > Manage deployments > edit > New version** so the URL stays the same.

## 3. Put it on your phone

Open the Pages link in Chrome (Android) or Safari (iPhone), then **Add to Home Screen**. It opens full screen and works offline; ticks sync when you are back online.
Do the Setup step once on each device.

## What is automatic

- **Update git projects** ticks itself when your public GitHub activity shows a push today, and shows the commit count.
- Streaks, longest streak, perfect days, the 17-week map and the countdown are computed from your data.
- Syncing to the sheet happens a moment after every tap, and again when you reopen the page.
- The "current focus" line changes by date following the Dec 2026 to Jun 2027 plan.

Not automatic: LeetCode (tap + after each problem; LeetCode blocks browser access to its data) and private repo pushes (tick by hand).

## Safety notes

- The token is the only thing protecting your sheet endpoint. Do not commit it, and change it in Code.gs (then re-deploy) if it leaks.
- Settings are saved only in your browser's local storage.

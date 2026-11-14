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

The sheet creates three tabs by itself: `days` (one row per day, with todos and focus minutes), `weeks`, and `config` (your custom daily tasks and deadlines). You can add charts on top of them.

If you edit Code.gs later, use **Deploy > Manage deployments > edit > New version** so the URL stays the same.

## 3. Put it on your phone

Open the Pages link in Chrome (Android) or Safari (iPhone), then **Add to Home Screen**. It opens full screen and works offline; ticks sync when you are back online.
Do the Setup step once on each device.

## Updating Code.gs (do this after every new version of the project)

Your deployed Code.gs holds your real token, so do not paste the zip's copy over it blindly.

1. Open the sheet, **Extensions > Apps Script**.
2. Copy your real `TOKEN = '...'` line somewhere. Select all, paste the new `apps-script/Code.gs`, then put your real token back in the first line.
3. Save, then **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. Allow the "connect to an external service" permission if asked. The web app URL stays the same.
4. Open the page, go to Setup, press **Sync now**. Old sheets get the new columns (`focusmin`, `todos`) added automatically.


## Reminders, calendar events and the other new bits (Code.gs update needed)

After pasting the new Code.gs and redeploying (steps above), do these once:

1. **Calendar events on Today**: redeploy and approve the Calendar permission. Today's events from your main Google Calendar then show at the top of Today.
2. **Email reminders**: in the Apps Script editor pick `installReminder` in the toolbar, press Run, approve. You get an email at 9 PM and 11 PM only if the day is not kept yet, with your streak at risk. Run `testReminder` to send one now. Run `removeReminder` to stop. In Project Settings, set the time zone to Asia/Kolkata so the hours are right.
3. **Exam mode** (Goals > Mode): a day is kept with 3 ticks instead of 6. Past days keep the rule they were logged under.
4. **Focus labels** (Timer): pick DSA, College, Project and so on before you start; tap + for your own. Totals show in Progress and the weekly review.
5. **Week review** (Log): the week's numbers, focus by label, your wins, plus "one thing to fix" and "next week's priority". On Sunday after 5 PM, Today nudges you to do it, and next week's Today shows the priority at the top.
6. **Internship pipeline** (Goals, tap to expand): company, role, next action and date. Tap the status chip to move Target > Referral > Applied > OA > Interview > Offer > Rejected.

## Updating the page on GitHub

```
cd ~/Desktop/tracker
unzip -o ~/Downloads/nightly-tracker.zip -d /tmp/nt && cp -r /tmp/nt/nightly-tracker/. .
git add -A && git commit -m "Add log, timer, todos" && git push
```

Pages rebuilds in about a minute. Reload twice on your phone to get past the cache.

## Screens

- **Today**: daily checklist, a Todo list for that day (with "bring over unfinished from yesterday"), win of the day. Tap **Edit** by Daily to add or remove your own daily tasks; it stays hidden otherwise.
- **Timer**: timer with presets and custom minutes, or a stopwatch. The expand button gives a fullscreen clock. Minutes you run are added to the day as focus time.
- **Calendar**: your Google Calendar inside the app in dark mode (Week, Month, Agenda). Add your Gmail address under Setup first. It uses Google's embed, so you must be signed in to Google in that browser; if your phone blocks it, the Open Google Calendar button opens the real site. Google does not allow the full calendar site to be embedded, so this is the embed view.
- **Log**: week strip, weekly goals, and a day by day history showing what you ticked, LeetCode solved, commits, todos, focus minutes and the win. Tap any day (here, on the Progress map) to open it.
- **Progress**: streaks, 17-week map, LeetCode and GitHub stats, recent LeetCode solves, wins.
- **Goals**: countdowns and deadlines (tap **+ Add** to add one).
- **Setup**: behind the gear icon, top right.

The quote on top is the `QUOTE` line near the top of the script in `index.html`.

## What is automatic

- **Update git projects** ticks itself when your public GitHub activity shows a push today, and shows the commit count. The Progress tab shows 90 days of pushes.
- **LeetCode**: totals and your latest solves come from your profile. Each solve fills the counter on the day you solved it (LeetCode only exposes your last 20 accepted submissions, so older days cannot be rebuilt).
- Streaks, longest streak, perfect days, the 17-week map and the countdown are computed from your data.
- Syncing to the sheet happens a moment after every tap, and again when you reopen the page.
- The "current focus" line changes by date following the Dec 2026 to Jun 2027 plan.

Not automatic: pushes to private repos (tick by hand). Custom daily tasks and deadlines now sync through the `config` sheet tab, so they follow you across devices.

## Safety notes

- The token is the only thing protecting your sheet endpoint. Do not commit it, and change it in Code.gs (then re-deploy) if it leaks.
- Settings are saved only in your browser's local storage.

# Winvells — Complete Email & Google Sheets Setup Guide

## What happens when someone submits a form:
1. Their data is saved instantly to **your Google Sheet** (colour-coded by type)
2. **You get an email** at kvsvenu9000@gmail.com with all their details
3. **They get a thank-you email** with confirmation and next steps

---

## STEP 1 — Create your Google Sheet

1. Go to **https://sheets.google.com**
2. Click **"+"** to create a new blank spreadsheet
3. Name it: **Winvells Submissions** (top-left, click "Untitled spreadsheet")
4. The sheet columns will be auto-created on first submission

---

## STEP 2 — Open Apps Script

1. In your Google Sheet, click **Extensions** (top menu bar)
2. Click **Apps Script**
3. A new tab opens with a code editor

---

## STEP 3 — Paste the backend code

1. **Select all** existing code in the editor (Ctrl+A)
2. **Delete** it
3. Open the file **winvells_backend.gs** (provided with this guide)
4. **Copy all** the code (Ctrl+A → Ctrl+C)
5. **Paste** it into the Apps Script editor (Ctrl+V)
6. Click the **Save** icon (💾) or press **Ctrl+S**
7. Give the project a name when asked: **Winvells Backend**

---

## STEP 4 — Deploy as Web App

1. Click **Deploy** button (top right)
2. Select **New Deployment**
3. Click the **⚙️ gear icon** next to "Select type"
4. Choose **Web App**
5. Fill in:
   - Description: `Winvells Backend v1`
   - **Execute as: Me (kvsvenu9000@gmail.com)**
   - **Who has access: Anyone**
6. Click **Deploy**

---

## STEP 5 — Authorize permissions

1. A popup appears: "Authorization required"
2. Click **Authorize access**
3. Choose your Google account: **kvsvenu9000@gmail.com**
4. You may see "Google hasn't verified this app" — click **Advanced**
5. Click **"Go to Winvells Backend (unsafe)"** — this is safe, it's your own script
6. Click **Allow**

---

## STEP 6 — Copy your Web App URL

After deploying, you'll see:
```
Web App URL: https://script.google.com/macros/s/AKfycbXXXXXXXXXXXXXXX/exec
```
**Copy this entire URL**

---

## STEP 7 — Paste URL into your website

1. Open **winvells.html** in any text editor (Notepad, VS Code, etc.)
2. Press **Ctrl+F** and search for:
   ```
   PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
   ```
3. Replace that text with your copied URL
4. Save the file

**Example — before:**
```javascript
const BACKEND_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

**Example — after:**
```javascript
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbXXXXX/exec';
```

---

## STEP 8 — Test it

1. Open **winvells.html** in your browser
2. Go to **We Buy** page → click **Register as Farmer**
3. Fill in all fields including **your own email** for testing
4. Click **Submit Registration**
5. You should see: ✅ "Submitted successfully! A confirmation email has been sent..."
6. Check **kvsvenu9000@gmail.com** — you'll get the full details email
7. Check the **test email you entered** — you'll get the thank-you email
8. Open your **Google Sheet** — a new row will appear with all the data

---

## What your Google Sheet looks like:

| Timestamp | Form Type | Name | Phone | Email | Company | Location | Crop/Product | ... |
|-----------|-----------|------|-------|-------|---------|----------|--------------|-----|
| 09-03-2026 10:30 | 🌾 Farmer Reg. | Ramu | 9876543210 | ramu@gmail.com | | Coimbatore | Moringa | ... |
| 09-03-2026 11:15 | 🏭 Company Enq. | Priya | 9123456789 | priya@abc.com | ABC Foods | Chennai | Moringa Powder | ... |

- **🌾 Farmer** rows → green shading
- **🏭 Company** rows → yellow shading  
- **📩 Contact** rows → blue shading
- **🛒 Order** rows → dark green shading

---

## IMPORTANT: Re-deploy after any code changes

If you ever edit the backend script, you must:
1. Click **Deploy → Manage Deployments**
2. Click the **pencil ✏️** edit icon
3. Change version to **"New version"**
4. Click **Deploy**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Form shows ⚠️ error | Check that BACKEND_URL is correctly pasted in winvells.html |
| No email received | Check Gmail spam folder; verify you authorized the script |
| Sheet not created | Make sure you opened Apps Script FROM your Google Sheet (via Extensions menu) |
| "Script function not found" error | Re-paste the backend code and save again |

---

## Free limits (more than enough for Winvells):

| Service | Free Limit |
|---------|-----------|
| Google Sheets rows | Unlimited (5M cells) |
| Gmail via Apps Script | 100 emails/day |
| Apps Script runtime | 6 min/execution, 90 min/day |


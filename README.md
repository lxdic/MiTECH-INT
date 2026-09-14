# Mi-Tech International — Website

A 4-page static site: the group hub, plus one page per division (Driving School, Computer College, Logistics). Pure HTML/CSS/JS — no build step, no dependencies to install.

## How to open it in VS Code

1. Unzip/copy this whole `mitech-website` folder onto your computer.
2. Open the folder in VS Code (`File → Open Folder…`).
3. Install the **Live Server** extension (search "Live Server" by Ritwick Dey in the Extensions panel).
4. Right-click `index.html` → **Open with Live Server**.

That's it — it'll open in your browser at `http://127.0.0.1:5500` and reload automatically whenever you save a change.

(No Live Server? You can also just double-click `index.html` to open it directly in a browser — everything still works, links included.)

## Folder structure

```
mitech-website/
├── index.html              ← Hub page (mitechinternational.com)
├── driving/index.html      ← Driving School division
├── college/index.html      ← Computer College division
├── logistics/index.html    ← Logistics division
├── assets/
│   ├── css/style.css       ← Shared design system (all 4 pages use this)
│   ├── js/main.js          ← Mobile nav, course filter, hire-type tabs
│   └── images/             ← Photos used across the site
└── README.md
```

## What's a placeholder right now

- **Hub page → "Trusted By" section**: empty logo slots, waiting on partner logos.
- **Computer College → "Student Reviews" section**: 3 testimonial cards with placeholder photo icons, names, and quotes — swap in real photos/quotes when you have them.

Both are marked clearly in the HTML with `<!-- placeholder -->`-style content so they're easy to find and replace.

## When you're ready to go live

- Point your DNS subdomains at wherever you host each folder (or serve the whole thing as one app with subdomain-aware routing — see the earlier discussion on site architecture).
- Swap `tel:`, `mailto:`, and social links for the real ones if any placeholders remain.
- Replace the Google Fonts CDN links in the `<head>` of each page with self-hosted fonts if you want zero external requests.

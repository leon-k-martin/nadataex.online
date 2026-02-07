# NADAtäx.online

Playful upcycling label website with early 2000s web aesthetics and water/floating theme.

## 🚀 Deploy to GitHub Pages

### Quick Deploy
1. Push your code to a GitHub repository
2. Go to repository **Settings** → **Pages**
3. Under "Source", select **main** branch and **/ (root)** folder
4. Click **Save**
5. Your site will be live at `https://yourusername.github.io/repository-name/`

### Custom Domain (Optional)
1. Add a `CNAME` file in the root with your domain name
2. Configure DNS at your domain registrar to point to GitHub Pages
3. Enable HTTPS in GitHub Pages settings

## 📧 Contact Form

Form is integrated with **Formspree** (free tier: 50 submissions/month).

### Activate the Form (2-minute setup):

1. **Sign up** at [formspree.io](https://formspree.io) (free account, no credit card)
2. Click **"+ New Form"**
3. Name it (e.g., "NADAtäx Contact")
4. Copy your **Form ID** (looks like `abc123xyz`)
5. **Edit [`index.html`](index.html#L136)** and replace `YOUR_FORM_ID`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
   Replace `YOUR_FORM_ID` with your actual ID
6. Done! Form submissions will go to your email

**Current state:** Form is ready but needs your Formspree ID to work.

## 🎨 Adding Content

### Product Photos
- Add images to `static/img/products/`
- Site automatically discovers and displays new photos

### Process Photos
- Add images to `static/img/process/`
- Automatically loaded in About section

### About Text
- Edit `content/about.md` (supports EN/DE toggle)

### FAQ
- Edit `content/faq.md`

### Reviews (ticker at bottom)
- Edit `content/reviews.json`

## 🛠️ Local Development

Serve locally with Python (needed for video streaming):
```bash
python3 scripts/serve.py
```
Or use the simple Python server:
```bon3 -m http.server 8081
```

Then open: `http://localhost:8081`

## 📁 Project Structure
```
├── index.html              # Main HTML
├── style.css               # All styles
├── content/                # Markdown content
│   ├── about.md
│   ├── faq.md
│   └── reviews.json
├── js/                     # JavaScript modules
│   ├── main.js
│   ├── interactions.js
│   ├── float.js
│   └── ...
└── static/
    ├── cursor/             # Custom scissor cursor
    ├── img/
    │   ├── products/       # Product photos
    │   ├── process/        # Behind-the-scenes
    │   └── plane_background.jpg
    └── video/
        └── water-bg.mp4    # Water background video
```

## 🎯 Features
- ✂️ Custom scissor cursor (opens/closes on click)
- 🌊 Water ripple effect on mousedown
- 💧 Animated water video background
- 🎈 Floating elements with random delays
- 📱 Fully responsive (mobile-first)
- 📧 Working contact form via Formspree (needs activation)

## 🔧 Tech Stack
- **Vanilla HTML/CSS/JS** (no build step)
- **GitHub Pages** hosting
- **Formspree** for contact form (free tier)
# VAES — Visitor Approval Entry System

A browser-based visitor management system for residential societies, built with vanilla HTML, CSS, and JavaScript. No backend or build tools required.

---

## Features

### Tenant / Owner Portal
- Register and log in as a flat owner
- Approve or reject incoming visitor requests in real time
- Pre-approve guests with scheduled time windows
- Manage notification preferences and account settings

### Security Guard Portal
- Register visitors at the gate and send approval requests to tenants
- View live approval status and gate access logs
- Manually override or flag entries with guard-level permissions

---

## Project Structure

```
├── index.html   # App shell and all screen markup
├── style.css    # Design system, layout, components
└── script.js    # All app logic, state, and interactions
```

---

## Getting Started

No install or build step needed.

1. Clone or download this repository
2. Open `index.html` in any modern browser

```bash
git clone https://github.com/your-username/vaes.git
cd vaes
open index.html   # or just double-click it
```

> Works fully offline. All state is held in memory for the session.

---

## Demo Credentials

These accounts are hardcoded in `script.js` and ready to use immediately — no signup needed.

### 🛡️ Security Guard

| Name  | Email | Password |
|-------|-------|----------|
| Ramya | ramya@gmail.com | security@123 |

### 🏠 Tenants

| Name | Email | Password | Block | Flat |
|------|-------|----------|-------|------|
| Shamika Hasini | shamikahasini@gmail.com | shamika2002 | A | 101 |
| Udaya | udaya@gmail.com | shamika2002 | B | 402 |
| Kishore | kishore@gmail.com | shamika2002 | C | 202 |

### Registration Codes

If signing up as a new user, use these codes:

| Type | Valid Codes |
|------|-------------|
| Flat (Tenant) | `flat-001`, `flat-002`, `flat-003`, `flat-101`, `flat-102` |
| Security | `sec-001`, `sec-002`, `sec-003` |

---

## Tech Stack

| Layer      | Details                                      |
|------------|----------------------------------------------|
| Markup     | HTML5, semantic structure                    |
| Styling    | CSS custom properties, responsive grid       |
| Logic      | Vanilla JavaScript (ES6+), no frameworks     |
| Fonts      | Playfair Display, Outfit, JetBrains Mono (Google Fonts) |

---

## Customisation

- **Colors & theme** — all design tokens are CSS variables at the top of `style.css` inside `:root {}`
- **Flat codes** — edit the `VALID_FLAT_CODES` array in `script.js`
- **Approval logic** — see the `handleApproval()` function in `script.js`

---

## License

MIT — free to use, modify, and distribute.

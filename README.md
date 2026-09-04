# Hearth — Employee Assistant Dashboard

Frontend React app for an internal employee desk: landing page, Gemini chat, people directory, headcount analytics, and profile settings.

Built as a complete client application. There is no company backend. Gemini is called through a local Vite proxy so the API key stays on the machine running `npm run dev`. Theme, profile, notification toggles, and chat history persist in `localStorage`.

---

## Quick start (for reviewers)

```bash
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

**Gemini (optional but needed for live AI replies)**

1. Create a key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Copy `.env.example` to `.env` and set:

```env
GEMINI_API_KEY=your_key_here
```

3. Restart the dev server after changing `.env`.

You can also paste a key under **You → Gemini key**. The `.env` value takes priority.

If Gemini returns `403` (project denied), chat still answers from the local Northfield directory so the rest of the UI can be reviewed.

```bash
npm run build    # production bundle
npm run preview  # serve the build
```

---

## What to click in a review (5–7 min)

| Step | Route        | What to check                                                                 |
| ---- | ------------ | ----------------------------------------------------------------------------- |
| 1    | `/`          | Hero, intro, features, CTA, theme toggle, motion                              |
| 2    | `/desk`      | Suggested prompts, send a message, loading dots, typing animation, error copy |
| 3    | `/desk`      | Mic button (Chrome / Edge), **Clear thread**                                  |
| 4    | `/people`    | Search (`finance`, `Menon`), department chips, empty state + Reset            |
| 5    | `/pulse`     | Totals, bar chart, pie chart, resize the window                               |
| 6    | `/you`       | Edit name (sidebar updates), Paper / Ink theme, notification switches         |
| 7    | Mobile width | Sidebar collapses to a top rail; landing nav still usable                     |

Suggested chat prompt: `Who handles payroll if Nikhil is out?`

---

## Assignment coverage

| Requirement                                               | Implementation                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| Landing — hero, intro, features, CTA, animation           | `src/pages/Landing.jsx`                                                     |
| AI chat — messages, loading, history, Gemini, errors      | `src/pages/Chat.jsx`, `vite-plugin-gemini.js`                               |
| Directory — cards, search, department filter, empty state | `src/pages/Directory.jsx`                                                   |
| Analytics — totals, bar + pie, mock data                  | `src/pages/Analytics.jsx`, `src/data/analytics.js`                          |
| Settings — profile, theme, notifications (no backend)     | `src/pages/Settings.jsx`                                                    |
| Routing                                                   | React Router v6 in `src/App.jsx`                                            |
| State                                                     | React context + `localStorage` (`src/context/AppContext.jsx`)               |
| Reusable components                                       | `Brand`, `AppShell`, `EmployeeCard`, `ChatBubble`, `EmptyState`, `StatCard` |
| Responsive layout                                         | CSS in `src/index.css` (desktop rail + mobile stack)                        |

**Bonus**

- Dark mode (Paper / Ink)
- Chat history in `localStorage`
- Voice input (`webkitSpeechRecognition`, `en-IN`)
- Typing animation on the latest assistant message
- Suggested prompts on an empty thread

---

## Tech stack

| Piece   | Choice                            |
| ------- | --------------------------------- |
| UI      | React 18                          |
| Bundler | Vite 5                            |
| Routing | `react-router-dom` 6              |
| Charts  | Recharts                          |
| AI      | Google Gemini (`generateContent`) |
| Styling | Hand-written CSS (no UI kit)      |

No Redux, no component library. Routing, context, and CSS were enough for this scope.

---

## Architecture

```
Browser (React)
  └─ POST /api/chat          ← same origin, Vite middleware
        └─ Gemini generateContent (API key injected on the server)
             └─ on 403 → local directory replies (src/services/localDesk.js)
```

The key is **not** prefixed with `VITE_`, so it is not baked into the client bundle. The browser talks only to `/api/chat`. `src/services/gemini.js` is the client helper; `vite-plugin-gemini.js` is the proxy.

```
src/
  App.jsx                 routes + lazy-loaded app pages
  main.jsx                providers
  index.css               theme, layout, pages
  context/AppContext.jsx  theme, profile, prefs, chat, optional UI key
  pages/                  Landing, Chat, Directory, Analytics, Settings
  components/             shell, cards, bubbles, empty/stat
  data/                   employees, analytics, system prompt
  services/               gemini client, local fallback
  hooks/                  speech, typing
vite-plugin-gemini.js     /api/chat + /api/chat/status
```

**State**

- `AppProvider` holds theme, profile, notification prefs, messages, optional pasted key.
- Writes go to `localStorage` (`hearth.*` keys).
- Directory search/filter is local component state (does not need to be global).

**Chat flow**

1. User sends text (Enter, button, suggested prompt, or voice).
2. Message is appended; a typing indicator shows while the request is in flight.
3. Proxy tries several Gemini Flash models, then returns text.
4. `403` / project denied → `localDeskReply()` using the employee list.
5. Other failures surface as an error bubble (no silent fail).

---

## Routes

| Path      | Screen                            |
| --------- | --------------------------------- |
| `/`       | Marketing landing (no app chrome) |
| `/desk`   | Assistant                         |
| `/people` | Directory                         |
| `/pulse`  | Analytics                         |
| `/you`    | Settings                          |
| `*`       | Redirects to `/`                  |

App pages share `AppShell` (side rail + header). Landing is a separate layout.

---

## Data

Employee list is mock data in `src/data/employees.js` (14 people, Indian names/cities). Analytics totals are derived from that list. Charts also include a small year-by-year headcount series.

---

## Design notes

- Product name: **Hearth**, company: **Northfield**.
- Type: Fraunces (headings) + Schibsted Grotesk (UI).
- Palette: paper / ink / rust / moss — not a generic purple “AI” theme.
- Motion is CSS-only (`prefers-reduced-motion` respected).

---

## Known limits

- Frontend-only. Profile and prefs never hit a real HR system.
- Gemini needs a valid Google AI Studio key. Some new AI Studio _projects_ return `403 Permission Denied` even with a fresh key; a key on a project Google still allows works. The local fallback keeps chat usable either way.
- Voice input depends on the browser Speech API (reliable in Chrome / Edge).
- The Vite proxy is what holds the secret in dev/preview. A static host (`vite build` on GitHub Pages, etc.) would need a small backend or the key pasted in Settings (then sent to `/api/chat`, which only exists when Vite is running).

---

## Scripts

| Command           | Purpose                      |
| ----------------- | ---------------------------- |
| `npm run dev`     | Dev server, port 5173        |
| `npm run build`   | Production build → `dist/`   |
| `npm run preview` | Preview the production build |

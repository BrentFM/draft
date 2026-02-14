# Draft - Prompt Library

A small, fast desktop app for storing and reusing prompts.

**Local-first. No account. No backend.**  
Your data lives in a JSON file on your machine.

---

## Features

### Library

Create prompts with:

- Title
- Body
- Tags
- Collection (optional)
- Model hint (optional)

Search instantly. Filter by collection or model. Star favorites.

### Quick Copy

- Click any prompt to copy its body
- Use a global hotkey to open a lightweight search palette from anywhere
- Press Enter to copy and return to what you were doing

### Settings

- Light / Dark / System theme
- Custom global hotkey
- Confirm before delete
- Import / Export (JSON)
- Open data folder

---

## Data & Privacy

- All prompts are stored locally in your app data directory.
- No cloud sync.
- No telemetry.
- No external services.

You can back up, move, or inspect your data at any time.

---

## Tech Stack

Electron · React · TypeScript · Vite (electron-vite) · Tailwind CSS · Radix UI

macOS and Windows supported.

---

## Develop

**Prerequisites:** Node.js 20+ (LTS) and npm or pnpm.

```bash
npm ci
npm run dev
```

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Dev server + Electron    |
| `npm run build`   | Production build         |
| `npm run start`   | Run built app            |
| `npm run build:mac` / `build:win` / `build:linux` | Packaged app |

## Support

[Buy me a coffee](https://buymeacoffee.com/55fsgd75gwx) — optional way to support the app.

## License

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) — use and share for noncommercial purposes only; commercial use (including selling the app or a derivative) is not permitted. See [LICENSE](LICENSE).

# nocodile

Browser-only Naruto shadow-clone gesture trainer.

Each user runs collect → train → test → effect entirely in their own browser. Samples and models are stored in IndexedDB on that device (no shared server files), so multiple users can use the same website at once.

## Run

```bash
npx serve -p 3000
```

Then open:

- Trainer: http://localhost:3000/trainer.html
- Main app: http://localhost:3000/index.html

Use Chrome and allow webcam access.

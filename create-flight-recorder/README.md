# create-flight-recorder

Initialize local `.env.local` defaults for Agnost Flight Recorder projects.

## Usage

```bash
npx create-flight-recorder my-recorder
```

## Output

Creates target folder if needed and writes:

```bash
.env.local
```

With defaults:

```bash
DATABASE_URL=file:./flight-recorder.db
AGNOST_ORG_ID=your-org-id
```

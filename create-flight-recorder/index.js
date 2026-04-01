#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = process.argv[2] || "agnost-flight-recorder";
const cwd = process.cwd();
const outputDir = path.join(cwd, target);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const envContent = `DATABASE_URL=file:./flight-recorder.db
AGNOST_ORG_ID=your-org-id
`;

fs.writeFileSync(path.join(outputDir, ".env.local"), envContent);
console.log(`Initialized ${target}. Next steps:
1) npm install
2) npm run db:generate && npm run db:migrate
3) npm run dev`);

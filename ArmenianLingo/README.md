# ArmenianLingo (Phase 2)

Duolingo-style Armenian learner built with Next.js + TypeScript.

## Run

```bash
cd ArmenianLingo
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm run test
npm run test:smoke
```

## Content location

- Curriculum map: `src/content/curriculum.ts`
- Seed lesson data (Unit 1 Lesson 1): `src/content/unit1/lesson1.json`
- Schema: `src/lib/schema.ts`

## SRS / Review

- SM-2-like scheduler logic: `src/lib/srs.ts`
- SRS tests: `src/lib/srs.test.ts`
- Review queue UI: `src/components/review-overview.tsx`

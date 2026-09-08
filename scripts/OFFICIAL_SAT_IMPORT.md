# Official SAT import

The importer is idempotent: rerunning it updates questions by their original
College Board source ID instead of creating duplicates.

1. Install the pinned one-time extraction dependencies:

   ```sh
   npm run questions:setup:official
   ```

2. Put the PDF at `../Keplerly/Official Tests.pdf`, or set
   `OFFICIAL_SAT_PDF` to its location, then extract and validate it:

   ```sh
   npm run questions:extract:official
   ```

3. Apply `supabase/migrations/013_sat_question_codes.sql` in the Supabase SQL
   Editor.

4. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Never use a
   `NEXT_PUBLIC_` prefix for this key.

5. Validate the staged data without making network changes:

   ```sh
   npm run questions:import:official
   ```

6. Upload the 127 visuals and upsert all 1,688 questions:

   ```sh
   npm run questions:import:official:execute
   ```

Generated JSON, images, and reports are stored under `.question-import/`,
which is excluded from Git.

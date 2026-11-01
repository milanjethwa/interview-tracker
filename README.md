# InterviewPulse — Interview Logs, Calendar & Skills Tracker

A React + Vite + Tailwind CSS application to schedule interviews on an interactive calendar, log detailed round retrospectives (**What went well**, **What can be improved**, **Questions asked**), and track technical/behavioral skill proficiency over time.

## Quick Start

```bash
cd interview-tracker
npm run dev
```

## Supabase Configuration

1. Copy [.env.example](./.env.example) to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
2. Run the SQL schema located in [supabase/schema.sql](./supabase/schema.sql) inside your Supabase SQL Editor.
3. Alternatively, click **"Supabase Setup"** in the top-right header of the app to paste your URL & Anon Key at runtime and push existing local data to Supabase with one click.

// Required dependencies: express, cors, dotenv, @supabase/supabase-js
// Install them using: npm install express cors dotenv @supabase/supabase-js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = 3001; // Or any port of your choice

app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side
);

// GET /api/current-scores – fetch latest scores from the view
app.get('/api/current-scores', async (req, res) => {
  const { data, error } = await supabase.from('current_scores').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/project-scores – fetch all raw project scores
app.get('/api/project-scores', async (req, res) => {
  const { data, error } = await supabase.from('project_scores').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/project-scores – add a new project score (triggers Supabase trigger)
app.post('/api/project-scores', async (req, res) => {
  const { crn_id, record_date, rag_profile } = req.body;
  if (!crn_id || !record_date || !rag_profile) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { data, error } = await supabase.from('project_scores').insert([
    { crn_id, record_date, rag_profile },
  ]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
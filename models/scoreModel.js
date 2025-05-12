// models/scoreModel.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const getCurrentScores = async () => {
  const { data, error } = await supabase.from('current_scores').select('*');
  if (error) throw error;
  return data;
};

export const getAllProjectScores = async () => {
  const { data, error } = await supabase.from('project_scores').select('*');
  if (error) throw error;
  return data;
};

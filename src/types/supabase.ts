// src/types/supabase.ts

// This is a placeholder file.
// You should generate your Supabase types and replace the content of this file.
// For example, using: supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
// Or refer to Supabase documentation for the latest type generation commands.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Example: replace with your actual table definitions
      leaderboard_entries: {
        Row: {
          id: string
          created_at?: string
          name: string
          role: string // 'OM' | 'TL' | 'SPM'
          city: string
          score: number
          project_count?: number | null
          profile_pic?: string | null
          rank_change?: number | null
          // Add other columns from your 'leaderboard_entries' table
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: string
          city: string
          score: number
          project_count?: number | null
          profile_pic?: string | null
          rank_change?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string
          city?: string
          score?: number
          project_count?: number | null
          profile_pic?: string | null
          rank_change?: number | null
        }
        Relationships: []
      }
      historical_winners: {
        Row: {
          id: number
          created_at?: string
          week: number
          name: string
          city: string
          profile_pic?: string | null
          role?: string // 'OM' | 'TL' | 'SPM'
        }
        Insert: {
          id?: number
          created_at?: string
          week: number
          name: string
          city: string
          profile_pic?: string | null
          role?: string
        }
        Update: {
          id?: number
          created_at?: string
          week?: number
          name?: string
          city?: string
          profile_pic?: string | null
          role?: string
        }
        Relationships: []
      }
      om_trends: {
          Row: {
            id: number;
            om_id: string;
            om_name: string;
            weekly_scores: Json; // Expects an array of { week: number, score: number }
            subordinate_ranks?: Json | null; // Expects an array of { week: number, tlRank?: number, spmRank?: number }
          };
          Insert: {
            id?: number;
            om_id: string;
            om_name: string;
            weekly_scores: Json;
            subordinate_ranks?: Json | null;
          };
          Update: {
            id?: number;
            om_id?: string;
            om_name?: string;
            weekly_scores?: Json;
            subordinate_ranks?: Json | null;
          };
          Relationships: [
            {
              foreignKeyName: "om_trends_om_id_fkey"
              columns: ["om_id"]
              referencedRelation: "leaderboard_entries"
              referencedColumns: ["id"]
            }
          ]
      }
      reward_configurations: {
        Row: {
            id: number;
            config_name: string; // e.g., "current_season"
            awards_config: Json | null; // JSONB for RewardAward structure
            incentives_ops_metrics: string[] | null; // text[]
            incentives_vm_metrics: string[] | null; // text[]
            programs_config: Json | null; // JSONB for programs structure
        };
        Insert: {
            id?: number;
            config_name: string;
            awards_config?: Json | null;
            incentives_ops_metrics?: string[] | null;
            incentives_vm_metrics?: string[] | null;
            programs_config?: Json | null;
        };
        Update: {
            id?: number;
            config_name?: string;
            awards_config?: Json | null;
            incentives_ops_metrics?: string[] | null;
            incentives_vm_metrics?: string[] | null;
            programs_config?: Json | null;
        };
        Relationships: []
      }
      recent_activities: {
          Row: {
            id: string;
            created_at: string;
            type: 'milestone' | 'status_change' | 'assignment' | 'completion' | 'general';
            description: string;
            time_description?: string | null; // e.g., "2 hours ago"
            details_json?: Json | null; // JSONB for { text: string, type: 'positive' | 'negative' | 'neutral' }
          };
          Insert: {
            id?: string;
            created_at?: string;
            type: 'milestone' | 'status_change' | 'assignment' | 'completion' | 'general';
            description: string;
            time_description?: string | null;
            details_json?: Json | null;
          };
          Update: {
            id?: string;
            created_at?: string;
            type?: 'milestone' | 'status_change' | 'assignment' | 'completion' | 'general';
            description?: string;
            time_description?: string | null;
            details_json?: Json | null;
          };
          Relationships: []
      }
      // Define other tables like 'projects', 'cities' if you have them
    }
    Views: {
      // Define your views here
    }
    Functions: {
      // Define your RSPs or functions here
    }
    Enums: {
      // Define your enums here
    }
    CompositeTypes: {
      // Define your composite types here
    }
  }
}

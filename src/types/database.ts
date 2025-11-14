// Database type definitions for Franklin: Perfect Day
// Auto-generated types from Supabase + custom application types

// ============================================
// SUPABASE GENERATED TYPES
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      content_library: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      day_block_attachments: {
        Row: {
          day_block_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          day_block_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          day_block_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "day_block_attachments_day_block_id_fkey"
            columns: ["day_block_id"]
            isOneToOne: false
            referencedRelation: "day_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_block_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      day_blocks: {
        Row: {
          assigned_to: string | null
          block_outcome: string | null
          block_rating: number | null
          block_type: Database["public"]["Enums"]["block_type"]
          created_at: string | null
          day_plan_id: string
          end_time: string
          focus_score: number | null
          id: string
          metrics: Json | null
          notes: string | null
          outcome_notes: string | null
          sort_index: number
          start_time: string
          tasks: Json | null
          template_block_id: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          block_outcome?: string | null
          block_rating?: number | null
          block_type: Database["public"]["Enums"]["block_type"]
          created_at?: string | null
          day_plan_id: string
          end_time: string
          focus_score?: number | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          outcome_notes?: string | null
          sort_index: number
          start_time: string
          tasks?: Json | null
          template_block_id?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          block_outcome?: string | null
          block_rating?: number | null
          block_type?: Database["public"]["Enums"]["block_type"]
          created_at?: string | null
          day_plan_id?: string
          end_time?: string
          focus_score?: number | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          outcome_notes?: string | null
          sort_index?: number
          start_time?: string
          tasks?: Json | null
          template_block_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_blocks_day_plan_id_fkey"
            columns: ["day_plan_id"]
            isOneToOne: false
            referencedRelation: "day_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_blocks_template_block_id_fkey"
            columns: ["template_block_id"]
            isOneToOne: false
            referencedRelation: "perfect_day_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      day_plans: {
        Row: {
          adherence_score: number | null
          automation_wins: string[] | null
          bedtime_hit: boolean | null
          created_at: string | null
          date: string
          focus_blocks_completed: number | null
          id: string
          key_outcomes: Json | null
          learning_completed: boolean | null
          protein_actual: number | null
          protein_target: number | null
          score_small: number | null
          scorecard_data: Json | null
          user_id: string
          wakeup_hit: boolean | null
        }
        Insert: {
          adherence_score?: number | null
          automation_wins?: string[] | null
          bedtime_hit?: boolean | null
          created_at?: string | null
          date: string
          focus_blocks_completed?: number | null
          id?: string
          learning_completed?: boolean | null
          protein_actual?: number | null
          protein_target?: number | null
          score_small?: number | null
          scorecard_data?: Json | null
          user_id: string
        }
        Update: {
          adherence_score?: number | null
          automation_wins?: string[] | null
          bedtime_hit?: boolean | null
          created_at?: string | null
          date?: string
          focus_blocks_completed?: number | null
          id?: string
          learning_completed?: boolean | null
          protein_actual?: number | null
          protein_target?: number | null
          score_small?: number | null
          scorecard_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfect_day_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at: string | null
          end_time: string
          id: string
          sort_index: number
          start_time: string
          template_id: string
          title: string
        }
        Insert: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at?: string | null
          end_time: string
          id?: string
          sort_index: number
          start_time: string
          template_id: string
          title: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["block_type"]
          created_at?: string | null
          end_time?: string
          id?: string
          sort_index?: number
          start_time?: string
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfect_day_blocks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "perfect_day_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      perfect_day_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfect_day_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          timezone: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          timezone?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          timezone?: string | null
        }
        Relationships: []
      }
      skill_gaps: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          drills: Json | null
          id: string
          is_global: boolean | null
          name: string
          ooda_loop: Json | null
          priority: string | null
          resolved_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          drills?: Json | null
          id?: string
          is_global?: boolean | null
          name: string
          ooda_loop?: Json | null
          priority?: string | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          drills?: Json | null
          id?: string
          is_global?: boolean | null
          name?: string
          ooda_loop?: Json | null
          priority?: string | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_gaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clone_template_to_day: {
        Args: { p_date: string; p_user_id: string }
        Returns: string
      }
      create_default_template: { Args: { p_user_id: string }; Returns: string }
    }
    Enums: {
      block_type: "F" | "P" | "K" | "A" | "C" | "L" | "M"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// ============================================
// CUSTOM APPLICATION TYPES
// ============================================

export type BlockType = Database['public']['Enums']['block_type'];
export type BlockOutcome = 'success' | 'partial' | 'failed' | 'skipped';

// Base table types
export interface Profile extends Tables<'profiles'> {}
export interface PerfectDayTemplate extends Tables<'perfect_day_templates'> {}
export interface PerfectDayBlock extends Tables<'perfect_day_blocks'> {}
export interface DayPlan extends Tables<'day_plans'> {}
export interface ContentLibraryDoc extends Tables<'content_library'> {}
export interface Attachment extends Tables<'day_block_attachments'> {}

// Enhanced Task type with tags, assignment, and OODA fields
export interface Task {
  id: string;
  text: string;
  done: boolean;
  tags?: string[];
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  estimatedMinutes?: number;
  // Rich task fields for Morning OODA
  company?: string;
  project?: string;
  category?: string;
  outcome_description?: string;
  deadline?: string; // ISO date string
  preferred_block_type?: BlockType;
  linked_key_outcome?: string;
}

// Key Outcome type for daily "wins"
export interface KeyOutcome {
  id: string;
  text: string;
  achieved?: boolean;
}

// Enhanced Metrics type
export interface Metrics {
  [key: string]: number | string;
  protein?: number;
  focus_score?: number;
  rating?: number;
  outcome?: BlockOutcome;
  outcome_notes?: string;
}

// Enhanced DayBlock with typed tasks and metrics
export interface DayBlock extends Omit<Tables<'day_blocks'>, 'tasks' | 'metrics'> {
  tasks: Task[];
  metrics: Metrics;
}

// Skill Gap types
export interface OODALoop {
  observe: string;
  orient: string;
  decide: string;
  act: string;
  frequency: 'daily' | 'weekly' | 'per offer' | 'per project' | 'per trigger';
}

export interface Drill {
  name: string;
  description: string;
}

export interface SkillGap extends Omit<Tables<'skill_gaps'>, 'ooda_loop' | 'drills'> {
  ooda_loop: OODALoop;
  drills: Drill[];
}

// Block type metadata
export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  color: string;
  description: string;
}

export const BLOCK_TYPES: Record<BlockType, BlockTypeInfo> = {
  F: {
    type: 'F',
    label: 'Focus',
    color: '#D61F26',
    description: 'Deep work and focused building',
  },
  P: {
    type: 'P',
    label: 'Physical',
    color: '#5BC0EB',
    description: 'Exercise, nutrition, and health',
  },
  K: {
    type: 'K',
    label: 'Kids',
    color: '#CBA135',
    description: 'Family time and parenting',
  },
  A: {
    type: 'A',
    label: 'Admin',
    color: '#9CA3AF',
    description: 'Administrative tasks and planning',
  },
  C: {
    type: 'C',
    label: 'Comms',
    color: '#14B8A6',
    description: 'Communications and meetings',
  },
  L: {
    type: 'L',
    label: 'Learning',
    color: '#5BC0EB',
    description: 'Reading, courses, and skill development',
  },
  M: {
    type: 'M',
    label: 'Margin',
    color: '#D1D5DB',
    description: 'Rest, breaks, and transitions',
  },
};

// Map block types to skill gap categories
export const BLOCK_TYPE_TO_SKILL_CATEGORY: Record<BlockType, string> = {
  F: 'focus',
  P: 'emotional', // Physical helps with emotional regulation
  K: 'emotional', // Family time helps with emotional state
  A: 'financial', // Admin includes financial management
  C: 'sales', // Communications includes sales touches
  L: 'feedback', // Learning includes market feedback
  M: 'shipping', // Margin helps prevent overbuilding
};

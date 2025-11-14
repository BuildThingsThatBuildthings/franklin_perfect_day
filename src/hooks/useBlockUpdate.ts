import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { DayBlock, Task, Metrics, BlockOutcome } from '../types/database';

interface BlockUpdateFunctions {
  updateBlock: (blockId: string, updates: Partial<DayBlock>) => Promise<void>;
  updateTasks: (blockId: string, tasks: Task[]) => Promise<void>;
  toggleTask: (blockId: string, taskId: string, currentTasks: Task[]) => Promise<void>;
  addTask: (blockId: string, task: Omit<Task, 'id'>, currentTasks: Task[]) => Promise<void>;
  deleteTask: (blockId: string, taskId: string, currentTasks: Task[]) => Promise<void>;
  updateMetrics: (blockId: string, metrics: Metrics) => Promise<void>;
  rateBlock: (blockId: string, rating: number, outcome: BlockOutcome, notes?: string) => Promise<void>;
  updating: boolean;
  error: string | null;
}

export function useBlockUpdate(onSuccess?: () => void): BlockUpdateFunctions {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBlock = async (blockId: string, updates: Partial<DayBlock>) => {
    setUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('day_blocks')
        .update(updates)
        .eq('id', blockId);

      if (updateError) {
        throw updateError;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update block';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const updateTasks = async (blockId: string, tasks: Task[]) => {
    await updateBlock(blockId, { tasks: tasks as any });
  };

  const toggleTask = async (blockId: string, taskId: string, currentTasks: Task[]) => {
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    await updateTasks(blockId, updatedTasks);
  };

  const addTask = async (blockId: string, task: Omit<Task, 'id'>, currentTasks: Task[]) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
    };
    await updateTasks(blockId, [...currentTasks, newTask]);
  };

  const deleteTask = async (blockId: string, taskId: string, currentTasks: Task[]) => {
    const updatedTasks = currentTasks.filter((task) => task.id !== taskId);
    await updateTasks(blockId, updatedTasks);
  };

  const updateMetrics = async (blockId: string, metrics: Metrics) => {
    await updateBlock(blockId, { metrics: metrics as any });
  };

  const rateBlock = async (
    blockId: string,
    rating: number,
    outcome: BlockOutcome,
    notes?: string
  ) => {
    await updateBlock(blockId, {
      block_rating: rating,
      block_outcome: outcome,
      outcome_notes: notes,
    });
  };

  return {
    updateBlock,
    updateTasks,
    toggleTask,
    addTask,
    deleteTask,
    updateMetrics,
    rateBlock,
    updating,
    error,
  };
}

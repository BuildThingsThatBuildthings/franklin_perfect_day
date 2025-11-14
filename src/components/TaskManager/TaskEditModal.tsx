import { useState, useEffect } from 'react';
import { Task, BlockType } from '../../types/database';

interface TaskEditModalProps {
  task?: Task; // If provided, we're editing; otherwise creating new
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  onCancel: () => void;
}

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: 'F', label: 'Focus' },
  { value: 'P', label: 'Physical' },
  { value: 'K', label: 'Kids' },
  { value: 'A', label: 'Admin' },
  { value: 'C', label: 'Comms' },
  { value: 'L', label: 'Learning' },
  { value: 'M', label: 'Margin' },
];

const CATEGORIES = [
  'Marketing',
  'Product',
  'Operations',
  'Sales',
  'Fundraising',
  'Engineering',
  'Design',
  'Customer Success',
  'Finance',
  'HR',
  'Other',
];

const PRIORITIES: { value: 'low' | 'medium' | 'high'; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
];

export function TaskEditModal({ task, onSave, onCancel }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    text: task?.text || '',
    company: task?.company || '',
    project: task?.project || '',
    category: task?.category || '',
    outcome_description: task?.outcome_description || '',
    deadline: task?.deadline || '',
    priority: task?.priority || 'medium',
    estimatedMinutes: task?.estimatedMinutes || 0,
    preferred_block_type: task?.preferred_block_type || ('F' as BlockType),
    assignedTo: task?.assignedTo || '',
    linked_key_outcome: task?.linked_key_outcome || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...(task ? { id: task.id, done: task.done } : { done: false }),
      text: formData.text.trim(),
      company: formData.company.trim() || undefined,
      project: formData.project.trim() || undefined,
      category: formData.category || undefined,
      outcome_description: formData.outcome_description.trim() || undefined,
      deadline: formData.deadline || undefined,
      priority: formData.priority as 'low' | 'medium' | 'high',
      estimatedMinutes: formData.estimatedMinutes || undefined,
      preferred_block_type: formData.preferred_block_type as BlockType,
      assignedTo: formData.assignedTo.trim() || undefined,
      linked_key_outcome: formData.linked_key_outcome.trim() || undefined,
    };

    onSave(taskData as Task);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-ink transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="e.g., Finish CLAS Therapy investor deck"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
              required
              autoFocus
            />
          </div>

          {/* Company & Project Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., CLAS Therapy"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Project</label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="e.g., Investor Deck"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Description */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Outcome Description
            </label>
            <textarea
              value={formData.outcome_description}
              onChange={(e) =>
                setFormData({ ...formData, outcome_description: e.target.value })
              }
              placeholder="Done when: send-ready investor deck PDF for Karen by 2pm"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Deadline & Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedMinutes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })
                }
                placeholder="e.g., 60"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
                min="0"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Priority</label>
            <div className="flex gap-3">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.priority === p.value
                      ? 'border-bt3Red bg-red-50 text-bt3Red'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Block Type */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Preferred Block Type
            </label>
            <select
              value={formData.preferred_block_type}
              onChange={(e) =>
                setFormData({ ...formData, preferred_block_type: e.target.value as BlockType })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
            >
              {BLOCK_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  [{bt.value}] {bt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Assigned To</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="e.g., Ryan, or leave blank for yourself"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.text.trim()}
              className="flex-1 px-4 py-2 bg-bt3Red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Task } from '../../types/database';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function TaskCard({ task, onToggle, onEdit, onDelete, disabled = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Check if deadline is approaching or overdue
  const getDeadlineStatus = () => {
    if (!task.deadline) return null;

    const deadline = new Date(task.deadline);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      return { text: 'Overdue', color: 'text-red-600 bg-red-50' };
    } else if (hoursUntilDeadline < 2) {
      return { text: 'Due soon', color: 'text-orange-600 bg-orange-50' };
    } else if (hoursUntilDeadline < 24) {
      return { text: 'Due today', color: 'text-yellow-600 bg-yellow-50' };
    }
    return null;
  };

  const deadlineStatus = getDeadlineStatus();

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <li className="group">
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0"
          disabled={disabled}
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              task.done
                ? 'bg-bt3Red border-bt3Red'
                : 'border-gray-300 hover:border-bt3Red'
            }`}
          >
            {task.done && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Main task text */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm ${
                task.done ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {task.text}
            </span>

            {/* Priority badge */}
            {task.priority && task.priority !== 'medium' && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority}
              </span>
            )}

            {/* Deadline warning */}
            {deadlineStatus && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${deadlineStatus.color}`}
              >
                {deadlineStatus.text}
              </span>
            )}
          </div>

          {/* Metadata badges row */}
          {(task.company || task.project || task.category || task.estimatedMinutes) && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {task.company && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                  {task.company}
                </span>
              )}
              {task.project && (
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                  {task.project}
                </span>
              )}
              {task.category && (
                <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                  {task.category}
                </span>
              )}
              {task.estimatedMinutes && task.estimatedMinutes > 0 && (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                  ~{task.estimatedMinutes}m
                </span>
              )}
              {task.assignedTo && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                  @{task.assignedTo}
                </span>
              )}
            </div>
          )}

          {/* Outcome description (collapsible) */}
          {task.outcome_description && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-gray-500 hover:text-ink transition-colors flex items-center gap-1"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="font-medium">Done when:</span>
                {!expanded && (
                  <span className="truncate max-w-xs">
                    {task.outcome_description}
                  </span>
                )}
              </button>
              {expanded && (
                <p className="text-xs text-gray-600 mt-1 pl-4 italic">
                  {task.outcome_description}
                </p>
              )}
            </div>
          )}

          {/* Deadline display (if not soon/overdue) */}
          {task.deadline && !deadlineStatus && (
            <div className="mt-1 text-xs text-gray-500">
              Due: {new Date(task.deadline).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Action buttons (visible on hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-ink transition-colors"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

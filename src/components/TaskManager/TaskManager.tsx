import { useState } from 'react';
import { Task } from '../../types/database';
import { TaskCard } from './TaskCard';
import { TaskEditModal } from './TaskEditModal';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface TaskManagerProps {
  blockId: string;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  updating?: boolean;
}

export function TaskManager({ blockId, tasks, onUpdateTasks, updating = false }: TaskManagerProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleToggleTask = (taskId: string) => {
    onUpdateTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSaveTask = (taskData: Task | Omit<Task, 'id'>) => {
    if ('id' in taskData) {
      // Editing existing task
      onUpdateTasks(
        tasks.map((task) =>
          task.id === taskData.id ? taskData : task
        )
      );
    } else {
      // Adding new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
      };
      onUpdateTasks([...tasks, newTask]);
    }

    setEditingTask(null);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setIsAddingNew(false);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Task List */}
        <Droppable droppableId={blockId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[50px] ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
              }`}
            >
              {tasks.length > 0 ? (
                <ul className="space-y-3">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          <TaskCard
                            task={task}
                            onToggle={() => handleToggleTask(task.id)}
                            onEdit={() => setEditingTask(task)}
                            onDelete={() => handleDeleteTask(task.id)}
                            disabled={updating}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic py-4">No tasks yet - drag tasks here or add new ones</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Task Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsAddingNew(true)}
            disabled={updating}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-bt3Red hover:text-bt3Red transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Task
          </button>
        </div>

        {/* Task Stats */}
        {tasks.length > 0 && (
          <div className="pt-2 text-xs text-gray-500">
            {tasks.filter((t) => t.done).length} of {tasks.length} completed
          </div>
        )}
      </div>

      {/* Task Edit/Add Modal */}
      {(editingTask || isAddingNew) && (
        <TaskEditModal
          task={editingTask || undefined}
          onSave={handleSaveTask}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
}

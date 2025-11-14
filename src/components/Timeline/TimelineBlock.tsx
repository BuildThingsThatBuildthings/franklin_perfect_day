import { useState } from 'react';
import { DayBlock, BLOCK_TYPE_TO_SKILL_CATEGORY, Task } from '../../types/database';
import { formatTimeRange } from '../../utils/timeFormat';
import { getBlockTypeInfo } from '../../utils/blockStyles';
import { useBlockUpdate } from '../../hooks/useBlockUpdate';
import { useSkillGaps } from '../../hooks/useSkillGaps';
import { TaskManager } from '../TaskManager/TaskManager';
import { BlockRating } from '../BlockRating/BlockRating';
import { Droppable } from '@hello-pangea/dnd';

interface TimelineBlockProps {
  block: DayBlock;
  userId?: string;
  onUpdate?: () => void;
}

type TabType = 'tasks' | 'training' | 'notes' | 'outcome' | 'attachments';

export function TimelineBlock({ block, userId, onUpdate }: TimelineBlockProps) {
  const typeInfo = getBlockTypeInfo(block.block_type);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [localNotes, setLocalNotes] = useState(block.notes || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(block.title);

  const { updateTasks, updateBlock, rateBlock, updating } = useBlockUpdate(onUpdate);
  const { skillGaps } = useSkillGaps(userId);

  // Find relevant skill gap for this block type
  const skillCategory = BLOCK_TYPE_TO_SKILL_CATEGORY[block.block_type];
  const relevantSkillGap = skillGaps.find(
    (gap) => gap.category === skillCategory && gap.is_global
  );

  const handleUpdateTasks = async (tasks: Task[]) => {
    await updateTasks(block.id, tasks);
  };

  const handleUpdateNotes = async () => {
    if (localNotes !== (block.notes || '')) {
      await updateBlock(block.id, { notes: localNotes });
    }
  };

  const handleUpdateTitle = async () => {
    if (localTitle !== block.title && localTitle.trim()) {
      await updateBlock(block.id, { title: localTitle.trim() });
      setIsEditingTitle(false);
    } else {
      setLocalTitle(block.title); // Reset if unchanged or empty
      setIsEditingTitle(false);
    }
  };

  const handleRateBlock = async (rating: number, outcome: string, notes?: string) => {
    await rateBlock(block.id, rating, outcome as any, notes);
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'tasks', label: 'Tasks', count: block.tasks?.length || 0 },
    { id: 'training', label: 'Training' },
    { id: 'notes', label: 'Notes' },
    { id: 'outcome', label: 'Outcome' },
    { id: 'attachments', label: 'Attachments' },
  ];

  return (
    <div className="flex gap-4 mb-3">
      {/* Time label */}
      <div className="text-sm text-gray-500 w-28 text-right pt-2 flex-shrink-0">
        {formatTimeRange(block.start_time, block.end_time)}
      </div>

      {/* Timeline line and dot */}
      <div className="relative flex flex-col items-center flex-shrink-0">
        <div
          className="w-3 h-3 rounded-full mt-2.5 z-10"
          style={{ backgroundColor: typeInfo.color }}
        />
        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-300" />
      </div>

      {/* Block card */}
      <div
        className={`bg-white rounded-2xl flex-1 shadow-sm hover:shadow-md transition-all border-2 ${
          isExpanded ? 'p-0' : 'p-6'
        }`}
        style={{ borderColor: typeInfo.color }}
      >
        {/* Collapsed Header (always visible) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full text-left ${isExpanded ? 'p-4 border-b border-gray-200' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Block type text - no background pill */}
              <div
                className="text-2xl font-bold"
                style={{
                  color: typeInfo.color,
                }}
              >
                [{block.block_type}] {typeInfo.label}
              </div>

              {/* Title - only show when expanded */}
              {isExpanded && (
                <div className="mt-2 flex items-center gap-2">
                  {isEditingTitle ? (
                    <>
                      <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateTitle();
                          if (e.key === 'Escape') {
                            setLocalTitle(block.title);
                            setIsEditingTitle(false);
                          }
                        }}
                        onBlur={handleUpdateTitle}
                        className="flex-1 px-2 py-1 text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:border-bt3Red"
                        autoFocus
                        disabled={updating}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-ink font-semibold text-lg flex-1">{block.title}</h3>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="text-gray-400 hover:text-ink transition-colors"
                        title="Edit block title"
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
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Expand/Collapse Icon */}
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Expanded Content with Tabs */}
        {isExpanded && (
          <div className="border-t border-gray-100">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-bt3Red text-bt3Red'
                      : 'border-transparent text-gray-500 hover:text-ink hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <TaskManager
                  blockId={block.id}
                  tasks={block.tasks || []}
                  onUpdateTasks={handleUpdateTasks}
                  updating={updating}
                />
              )}

              {/* Training Tab */}
              {activeTab === 'training' && (
                <div>
                  {relevantSkillGap ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-ink mb-2">{relevantSkillGap.name}</h4>
                        <p className="text-gray-700 text-sm">{relevantSkillGap.description}</p>
                      </div>

                      {/* OODA Loop */}
                      {relevantSkillGap.ooda_loop && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            OODA Loop ({relevantSkillGap.ooda_loop.frequency})
                          </p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong className="text-bt3Red">Observe:</strong>{' '}
                              <span className="text-gray-700">
                                {relevantSkillGap.ooda_loop.observe}
                              </span>
                            </div>
                            <div>
                              <strong className="text-bt3Red">Orient:</strong>{' '}
                              <span className="text-gray-700">
                                {relevantSkillGap.ooda_loop.orient}
                              </span>
                            </div>
                            <div>
                              <strong className="text-bt3Red">Decide:</strong>{' '}
                              <span className="text-gray-700">
                                {relevantSkillGap.ooda_loop.decide}
                              </span>
                            </div>
                            <div>
                              <strong className="text-bt3Red">Act:</strong>{' '}
                              <span className="text-gray-700">
                                {relevantSkillGap.ooda_loop.act}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Drills */}
                      {relevantSkillGap.drills && relevantSkillGap.drills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Drills
                          </p>
                          <div className="space-y-2">
                            {relevantSkillGap.drills.map((drill, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <h5 className="font-semibold text-ink text-sm mb-1">
                                  {drill.name}
                                </h5>
                                <p className="text-gray-700 text-xs">{drill.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No training content available for this block type.
                    </p>
                  )}
                </div>
              )}

              {/* Notes & Metrics Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Notes</label>
                    <textarea
                      value={localNotes}
                      onChange={(e) => setLocalNotes(e.target.value)}
                      onBlur={handleUpdateNotes}
                      placeholder="Add notes about this block..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm resize-none"
                      rows={6}
                      disabled={updating}
                    />
                  </div>

                  {/* Metrics display (if any) */}
                  {block.metrics && Object.keys(block.metrics).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Metrics</label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {Object.entries(block.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="text-ink font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Outcome Tab */}
              {activeTab === 'outcome' && (
                <BlockRating
                  rating={block.block_rating}
                  outcome={block.block_outcome}
                  outcomeNotes={block.outcome_notes}
                  onUpdate={handleRateBlock}
                  updating={updating}
                />
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">Attachments coming soon</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

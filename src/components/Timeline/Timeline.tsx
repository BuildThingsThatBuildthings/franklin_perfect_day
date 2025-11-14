import { DayBlock, Task } from '../../types/database';
import { TimelineBlock } from './TimelineBlock';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useBlockUpdate } from '../../hooks/useBlockUpdate';

interface TimelineProps {
  blocks: DayBlock[];
  userId?: string;
  onUpdate?: () => void;
}

export function Timeline({ blocks, userId, onUpdate }: TimelineProps) {
  const { updateBlock } = useBlockUpdate(onUpdate);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside any droppable area
    if (!destination) return;

    // Dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceBlockId = source.droppableId;
    const destBlockId = destination.droppableId;

    const sourceBlock = blocks.find((b) => b.id === sourceBlockId);
    const destBlock = blocks.find((b) => b.id === destBlockId);

    if (!sourceBlock || !destBlock) return;

    const sourceTasks = Array.from(sourceBlock.tasks || []);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceBlockId === destBlockId) {
      // Reordering within same block
      sourceTasks.splice(destination.index, 0, movedTask);
      await updateBlock(sourceBlockId, { tasks: sourceTasks as any });
    } else {
      // Moving between blocks
      const destTasks = Array.from(destBlock.tasks || []);
      destTasks.splice(destination.index, 0, movedTask);

      // Update both blocks
      await updateBlock(sourceBlockId, { tasks: sourceTasks as any });
      await updateBlock(destBlockId, { tasks: destTasks as any });
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">
          No blocks for today. Create a Perfect Day template to get started.
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {blocks.map((block) => (
          <TimelineBlock key={block.id} block={block} userId={userId} onUpdate={onUpdate} />
        ))}
      </div>
    </DragDropContext>
  );
}

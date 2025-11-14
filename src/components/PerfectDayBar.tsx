import { useState } from 'react';
import { PerfectDayBlock } from '../types/database';
import { formatTimeRange } from '../utils/timeFormat';
import { getBlockTypeInfo } from '../utils/blockStyles';

interface PerfectDayBarProps {
  blocks: PerfectDayBlock[];
}

export function PerfectDayBar({ blocks }: PerfectDayBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (blocks.length === 0) {
    return null;
  }

  // Calculate summary
  const startTime = blocks[0]?.start_time || '04:00';
  const endTime = blocks[blocks.length - 1]?.end_time || '19:30';
  const focusBlocks = blocks.filter((b) => b.block_type === 'F').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-gold rounded-2xl p-4 hover:shadow-md transition-shadow text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">Perfect Day</span>
            <span className="text-gray-500">·</span>
            <span className="text-sm text-gray-600">
              {formatTimeRange(startTime, endTime)}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-sm text-gray-600">
              {focusBlocks}×F
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-sm text-gray-600">200g protein</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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

      {isOpen && (
        <div className="mt-2 bg-parchment rounded-xl p-4 space-y-2">
          {blocks.map((block) => {
            const typeInfo = getBlockTypeInfo(block.block_type);
            return (
              <div
                key={block.id}
                className="flex items-center gap-3 text-sm"
              >
                <span className="text-gray-500 w-24">
                  {formatTimeRange(block.start_time, block.end_time)}
                </span>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    color: typeInfo.color,
                    backgroundColor: `${typeInfo.color}20`,
                  }}
                >
                  [{block.block_type}]
                </span>
                <span className="text-ink">{block.title}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

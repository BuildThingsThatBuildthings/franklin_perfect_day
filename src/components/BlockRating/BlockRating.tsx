import { useState } from 'react';
import { BlockOutcome } from '../../types/database';

interface BlockRatingProps {
  rating: number | null;
  outcome: string | null;
  outcomeNotes: string | null;
  onUpdate: (rating: number, outcome: BlockOutcome, notes?: string) => void;
  updating?: boolean;
}

const OUTCOME_OPTIONS: { value: BlockOutcome; label: string; color: string }[] = [
  { value: 'success', label: '✓ Success', color: 'text-green-600' },
  { value: 'partial', label: '~ Partial', color: 'text-yellow-600' },
  { value: 'failed', label: '✗ Failed', color: 'text-red-600' },
  { value: 'skipped', label: '⊘ Skipped', color: 'text-gray-500' },
];

export function BlockRating({
  rating,
  outcome,
  outcomeNotes,
  onUpdate,
  updating = false,
}: BlockRatingProps) {
  const [selectedRating, setSelectedRating] = useState(rating || 0);
  const [selectedOutcome, setSelectedOutcome] = useState<BlockOutcome | null>(
    (outcome as BlockOutcome) || null
  );
  const [notes, setNotes] = useState(outcomeNotes || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSave = () => {
    if (selectedRating > 0 && selectedOutcome) {
      onUpdate(selectedRating, selectedOutcome, notes || undefined);
    }
  };

  const hasChanges =
    selectedRating !== (rating || 0) ||
    selectedOutcome !== outcome ||
    notes !== (outcomeNotes || '');

  return (
    <div className="space-y-4">
      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Rate this block (0-5)
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-all"
              disabled={updating}
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoverRating || selectedRating)
                    ? 'text-gold fill-current'
                    : 'text-gray-300'
                }`}
                fill={star <= (hoverRating || selectedRating) ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>
        {selectedRating > 0 && (
          <p className="text-xs text-gray-500 mt-1">{selectedRating} / 5 stars</p>
        )}
      </div>

      {/* Outcome Selector */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          How did it go?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedOutcome(option.value)}
              disabled={updating}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedOutcome === option.value
                  ? 'border-current bg-opacity-10'
                  : 'border-gray-200 hover:border-gray-300'
              } ${option.color}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Notes */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you learn? What would you change?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm resize-none"
          rows={3}
          disabled={updating}
        />
      </div>

      {/* Save Button */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={!selectedRating || !selectedOutcome || updating}
          className="w-full px-4 py-2 bg-bt3Red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {updating ? 'Saving...' : 'Save Rating'}
        </button>
      )}

      {/* Current State Display (if already rated) */}
      {!hasChanges && rating && outcome && (
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <p className="text-gray-600">
            <strong>Rated:</strong> {rating}/5 stars,{' '}
            {OUTCOME_OPTIONS.find((o) => o.value === outcome)?.label}
          </p>
          {outcomeNotes && (
            <p className="text-gray-500 mt-1 italic">{outcomeNotes}</p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { DayPlan, DayBlock } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface DailyScorecardProps {
  dayPlan: DayPlan;
  dayBlocks: DayBlock[];
  onUpdate?: () => void;
}

export function DailyScorecard({ dayPlan, dayBlocks, onUpdate }: DailyScorecardProps) {
  const [updating, setUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-calculate metrics from blocks
  const calculateMetrics = () => {
    const totalBlocks = dayBlocks.length;
    const ratedBlocks = dayBlocks.filter((b) => b.block_outcome);
    const successfulBlocks = dayBlocks.filter((b) => b.block_outcome === 'success').length;

    const focusBlocks = dayBlocks.filter((b) => b.block_type === 'F');
    const focusCompleted = focusBlocks.filter((b) => b.block_outcome === 'success').length;

    const learningBlocks = dayBlocks.filter((b) => b.block_type === 'L');
    const learningCompleted = learningBlocks.some((b) => b.block_outcome === 'success');

    const adherenceScore =
      ratedBlocks.length > 0 ? Math.round((successfulBlocks / ratedBlocks.length) * 100) : 0;

    // Sum protein from block metrics
    let totalProtein = dayPlan.protein_actual || 0;
    dayBlocks.forEach((block) => {
      if (block.metrics && typeof block.metrics === 'object' && 'protein' in block.metrics) {
        totalProtein += Number(block.metrics.protein) || 0;
      }
    });

    return {
      focusCompleted,
      learningCompleted,
      adherenceScore,
      totalProtein,
      ratedBlocks: ratedBlocks.length,
      totalBlocks,
    };
  };

  const metrics = calculateMetrics();

  // Auto-update day plan when metrics change
  useEffect(() => {
    const autoUpdate = async () => {
      if (!dayPlan.id) return;

      const updates = {
        focus_blocks_completed: metrics.focusCompleted,
        learning_completed: metrics.learningCompleted,
        adherence_score: metrics.adherenceScore,
        protein_actual: metrics.totalProtein,
      };

      // Only update if values have changed
      const hasChanges =
        dayPlan.focus_blocks_completed !== updates.focus_blocks_completed ||
        dayPlan.learning_completed !== updates.learning_completed ||
        dayPlan.adherence_score !== updates.adherence_score ||
        dayPlan.protein_actual !== updates.protein_actual;

      if (hasChanges) {
        setUpdating(true);
        try {
          const { error } = await supabase
            .from('day_plans')
            .update(updates)
            .eq('id', dayPlan.id);

          if (error) throw error;
          if (onUpdate) onUpdate();
        } catch (err) {
          console.error('Failed to update scorecard:', err);
        } finally {
          setUpdating(false);
        }
      }
    };

    // Debounce auto-update
    const timer = setTimeout(autoUpdate, 1000);
    return () => clearTimeout(timer);
  }, [metrics.focusCompleted, metrics.learningCompleted, metrics.adherenceScore, metrics.totalProtein]);

  const proteinTarget = dayPlan.protein_target || 200;
  const proteinProgress = Math.min((metrics.totalProtein / proteinTarget) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-bt3Red overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-bt3Red to-red-600 text-white"
        >
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div className="text-left">
              <h2 className="text-lg font-bold">Daily Scorecard</h2>
              <p className="text-xs text-red-100">
                {metrics.ratedBlocks} of {metrics.totalBlocks} blocks rated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="text-right">
              <p className="text-2xl font-bold">{metrics.adherenceScore}%</p>
              <p className="text-xs text-red-100">Adherence</p>
            </div>

            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-6 space-y-6">
            {/* Protein Tracking */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-sm font-semibold text-ink">Protein Intake</label>
                <span className="text-lg font-bold text-ink">
                  {metrics.totalProtein}g / {proteinTarget}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bt3Red to-red-500 transition-all duration-500"
                  style={{ width: `${proteinProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(proteinProgress)}% of target</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Focus Blocks */}
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-bt3Red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Focus Blocks
                  </span>
                </div>
                <p className="text-2xl font-bold text-bt3Red">{metrics.focusCompleted}</p>
                <p className="text-xs text-gray-500 mt-1">Completed successfully</p>
              </div>

              {/* Learning */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Learning</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.learningCompleted ? '✓' : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.learningCompleted ? 'Completed' : 'Not started'}
                </p>
              </div>

              {/* Wake Time */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Wake Time</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {dayPlan.wakeup_hit ? '✓' : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dayPlan.wakeup_hit ? 'On time' : 'Not tracked'}
                </p>
              </div>

              {/* Bedtime */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Bedtime</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {dayPlan.bedtime_hit ? '✓' : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dayPlan.bedtime_hit ? 'On time' : 'Not tracked'}
                </p>
              </div>
            </div>

            {/* Automation Wins */}
            {dayPlan.automation_wins && dayPlan.automation_wins.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-700">Automation Wins</span>
                </div>
                <ul className="space-y-1">
                  {dayPlan.automation_wins.map((win, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Score */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Overall Day Score</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on block completion and adherence
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-bt3Red">{dayPlan.score_small || 0}/3</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dayPlan.score_small === 3
                      ? 'Perfect Day!'
                      : dayPlan.score_small === 2
                      ? 'Great Day'
                      : dayPlan.score_small === 1
                      ? 'Good Day'
                      : 'Rate your day'}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-save indicator */}
            {updating && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Saving...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

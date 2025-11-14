import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePerfectDayTemplate } from '../hooks/usePerfectDayTemplate';
import { useDayPlan } from '../hooks/useDayPlan';
import { getTodayDate } from '../utils/timeFormat';
import { Header } from '../components/Header';
import { PerfectDayBar } from '../components/PerfectDayBar';
import { Timeline } from '../components/Timeline/Timeline';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { DailyScorecard } from '../components/DailyScorecard/DailyScorecard';
import { MorningPlanner } from '../components/MorningPlanner/MorningPlanner';

export function TimelinePage() {
  const { user } = useAuth();
  const today = getTodayDate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMorningPlanner, setShowMorningPlanner] = useState(false);

  const {
    template,
    blocks: templateBlocks,
    loading: templateLoading,
    error: templateError,
  } = usePerfectDayTemplate(user?.id);

  const {
    dayPlan,
    dayBlocks,
    loading: dayLoading,
    error: dayError,
    refetch: refetchDayPlan,
  } = useDayPlan(user?.id, today);

  // Combined loading state
  const loading = templateLoading || dayLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment">
        <Header date={today} />
        <div className="flex items-center justify-center py-12">
          <div className="text-ink text-lg">Loading your Perfect Day...</div>
        </div>
      </div>
    );
  }

  if (templateError || dayError) {
    return (
      <div className="min-h-screen bg-parchment">
        <Header date={today} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm mt-1">{templateError || dayError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-parchment">
        <Header date={today} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-ink mb-4">
              Welcome to <span className="text-bt3Red">Franklin</span>: Perfect Day
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have a Perfect Day template yet. To get started, you'll need to create
              one in your Supabase database.
            </p>
            <div className="bg-parchment rounded-lg p-4 text-left text-sm">
              <p className="font-semibold text-ink mb-2">Quick Setup:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Open your Supabase SQL Editor</li>
                <li>Run the seed data section from supabase-schema.sql</li>
                <li>Replace 'YOUR_USER_ID_HERE' with your user ID: <code className="bg-white px-2 py-1 rounded">{user?.id}</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={today} onPlanDay={() => setShowMorningPlanner(true)} />
      <Sidebar
        userId={user?.id}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-80' : 'ml-12'
        }`}
      >
        <PerfectDayBar blocks={templateBlocks} />
        <Timeline blocks={dayBlocks} userId={user?.id} onUpdate={refetchDayPlan} />
        {dayPlan && <DailyScorecard dayPlan={dayPlan} dayBlocks={dayBlocks} onUpdate={refetchDayPlan} />}
      </div>

      {/* Morning Planner Modal */}
      {showMorningPlanner && user?.id && (
        <MorningPlanner
          userId={user.id}
          date={today}
          dayBlocks={dayBlocks}
          onComplete={() => {
            setShowMorningPlanner(false);
            refetchDayPlan();
          }}
          onCancel={() => setShowMorningPlanner(false)}
        />
      )}
    </div>
  );
}

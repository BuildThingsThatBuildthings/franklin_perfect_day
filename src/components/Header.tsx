import { formatDisplayDate } from '../utils/timeFormat';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  date: string;
  onPlanDay?: () => void;
}

export function Header({ date, onPlanDay }: HeaderProps) {
  const { signOut } = useAuth();
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          <span className="text-bt3Red">FRANKLIN</span>
          <span className="text-ink">: PERFECT DAY</span>
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-sm text-ink font-medium">
            {formatDisplayDate(date)}
          </div>
          {onPlanDay && (
            <button
              onClick={onPlanDay}
              className="px-4 py-2 bg-bt3Red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Plan Day
            </button>
          )}
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-bt3Red transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState, useRef, useEffect } from 'react';
import { sendOODAMessage, OODAConversationState, autoAssignTasksToBlocks } from '../../lib/openai';
import { DayBlock, KeyOutcome } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface MorningPlannerProps {
  userId: string;
  date: string;
  dayBlocks: DayBlock[];
  onComplete: () => void;
  onCancel: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STAGE_QUESTIONS = {
  observe: "What's on your plate today? Any fixed appointments or deadlines?",
  orient: "What 1-3 outcomes would make today a win?",
  decide:
    "Now list your tasks. For each, you can include:\n• Company/project\n• Category (Marketing, Product, Ops, etc.)\n• Estimated time\n• Deadline\n• Priority\n\nJust brain-dump in plain language!",
  act: "I've extracted your tasks. Let me assign them to your blocks...",
};

export function MorningPlanner({ userId, date, dayBlocks, onComplete, onCancel }: MorningPlannerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Good morning! Let's plan your Perfect Day using the OODA loop. ${STAGE_QUESTIONS.observe}`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<OODAConversationState>({
    stage: 'observe',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Send to OpenAI
      const { response, newState } = await sendOODAMessage(userMessage, conversationState, messages);

      // Add assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      // Update conversation state
      setConversationState(newState);

      // If we're in the ACT stage and have extracted tasks, auto-assign them
      if (newState.stage === 'act' && newState.extractedTasks) {
        await assignTasksToBlocks(newState.extractedTasks, newState.keyOutcomes || []);
      }

      // Move to next question if not complete
      if (newState.stage !== 'complete' && newState.stage !== 'act') {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: STAGE_QUESTIONS[newState.stage] },
          ]);
        }, 500);
      }
    } catch (error) {
      console.error('Error in morning planner:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I encountered an error. Please check your OpenAI API key in .env.local and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const assignTasksToBlocks = async (tasks: any[], keyOutcomes: KeyOutcome[]) => {
    try {
      // Auto-assign tasks to blocks based on type and availability
      const assignment = autoAssignTasksToBlocks(tasks, dayBlocks);

      // Update each block with assigned tasks
      for (const [blockId, blockTasks] of assignment.entries()) {
        if (blockTasks.length > 0) {
          await supabase
            .from('day_blocks')
            .update({ tasks: blockTasks as any })
            .eq('id', blockId);
        }
      }

      // Store key outcomes in day_plans
      if (keyOutcomes.length > 0) {
        const { data: dayPlan } = await supabase
          .from('day_plans')
          .select('id')
          .eq('user_id', userId)
          .eq('date', date)
          .single();

        if (dayPlan) {
          await supabase
            .from('day_plans')
            .update({ key_outcomes: keyOutcomes as any })
            .eq('id', dayPlan.id);
        }
      }

      // Show completion message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ Done! I've assigned ${tasks.length} tasks across your ${assignment.size} blocks. Your day is planned!`,
        },
      ]);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error assigning tasks:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble saving your tasks. Please try again.',
        },
      ]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">Morning OODA Planner</h2>
            <p className="text-sm text-gray-500 mt-1">
              Stage: {conversationState.stage.toUpperCase()}
            </p>
          </div>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-bt3Red text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {conversationState.stage !== 'complete' && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  conversationState.stage === 'decide'
                    ? 'List your tasks here... (Shift+Enter for new line)'
                    : 'Type your response...'
                }
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bt3Red text-sm resize-none"
                rows={conversationState.stage === 'decide' ? 4 : 2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-2 bg-bt3Red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium self-end"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

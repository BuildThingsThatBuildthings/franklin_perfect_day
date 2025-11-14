import OpenAI from 'openai';
import { Task, BlockType, KeyOutcome } from '../types/database';

// Initialize OpenAI client only if API key is present
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }
} catch (error) {
  console.warn('OpenAI initialization skipped - API key not configured');
}

export interface OODAConversationState {
  stage: 'observe' | 'orient' | 'decide' | 'act' | 'complete';
  appointments?: string;
  keyOutcomes?: KeyOutcome[];
  rawTaskInput?: string;
  extractedTasks?: Task[];
  assignedTasks?: Map<string, Task[]>; // blockId -> tasks
}

const SYSTEM_PROMPT = `You are a productivity assistant helping users plan their day using the OODA loop framework.

Your role is to guide them through:
1. **Observe**: Understand their schedule and constraints
2. **Orient**: Identify 1-3 key outcomes that would make today a win
3. **Decide**: Extract detailed tasks from their brain dump
4. **Act**: Auto-assign tasks to time blocks

When extracting tasks, look for:
- **Task title**: The main action
- **Company**: Which business/project (e.g., "CLAS Therapy", "My Startup")
- **Project**: Specific initiative (e.g., "Investor Deck", "Marketing Campaign")
- **Category**: Type of work (Marketing, Product, Operations, Sales, Fundraising, etc.)
- **Outcome description**: "Done when..." completion criteria
- **Duration estimate**: How long in minutes
- **Deadline**: When it must be done
- **Priority**: high, medium, or low
- **Preferred block type**: F (Focus), A (Admin), C (Comms), P (Physical), L (Learning), K (Kids), M (Margin)

Block types guide:
- **F (Focus)**: Deep work, coding, writing, strategic thinking
- **A (Admin)**: Invoices, emails, scheduling, paperwork
- **C (Comms)**: Calls, meetings, Slack/messages
- **P (Physical)**: Exercise, health, physical tasks
- **L (Learning)**: Reading, courses, skill development
- **K (Kids)**: Family time, kid activities
- **M (Margin)**: Buffer, flex time, unexpected tasks

Return tasks as structured JSON.`;

export async function sendOODAMessage(
  userMessage: string,
  state: OODAConversationState,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ response: string; newState: OODAConversationState }> {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please add VITE_OPENAI_API_KEY to your .env.local file.');
  }

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const assistantResponse = completion.choices[0]?.message?.content || 'Sorry, I encountered an error.';

    // Update state based on current stage
    const newState = { ...state };

    switch (state.stage) {
      case 'observe':
        newState.appointments = userMessage;
        newState.stage = 'orient';
        break;

      case 'orient':
        // Extract key outcomes from user's response
        newState.keyOutcomes = extractKeyOutcomes(userMessage);
        newState.stage = 'decide';
        break;

      case 'decide':
        // Store raw task input
        newState.rawTaskInput = userMessage;
        // Extract tasks from user's brain dump
        newState.extractedTasks = await extractTasksFromText(userMessage, newState.keyOutcomes || []);
        newState.stage = 'act';
        break;

      case 'act':
        // This stage is handled in the component after assignment
        newState.stage = 'complete';
        break;
    }

    return {
      response: assistantResponse,
      newState,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to communicate with AI. Please check your API key and try again.');
  }
}

function extractKeyOutcomes(text: string): KeyOutcome[] {
  // Simple extraction - look for numbered items or sentences
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const outcomes: KeyOutcome[] = [];

  for (const line of lines.slice(0, 3)) {
    // Max 3 outcomes
    const cleaned = line.replace(/^[\d\.\-\*]+\s*/, ''); // Remove numbers/bullets
    if (cleaned.length > 5) {
      outcomes.push({
        id: crypto.randomUUID(),
        text: cleaned,
        achieved: false,
      });
    }
  }

  return outcomes;
}

async function extractTasksFromText(text: string, keyOutcomes: KeyOutcome[]): Promise<Task[]> {
  if (!openai) {
    // Fallback: simple line-by-line parsing if OpenAI not configured
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => ({
        id: crypto.randomUUID(),
        text: line.replace(/^[\d\.\-\*]+\s*/, ''),
        done: false,
        priority: 'medium' as const,
        preferred_block_type: 'F' as BlockType,
      }));
  }

  // Use OpenAI to structure the brain dump into tasks
  try {
    const extractionPrompt = `Extract structured tasks from this brain dump. Return ONLY a JSON array of tasks with this exact format:

[
  {
    "text": "Task title",
    "company": "Company name or null",
    "project": "Project name or null",
    "category": "Category or null",
    "outcome_description": "Done when... or null",
    "estimatedMinutes": 60 or null,
    "deadline": "ISO date string or null",
    "priority": "high", "medium", or "low",
    "preferred_block_type": "F", "A", "C", "P", "L", "K", or "M",
    "linked_key_outcome": "Which key outcome ID this supports or null"
  }
]

Key outcomes for reference:
${keyOutcomes.map((o, i) => `${i + 1}. ${o.text} (ID: ${o.id})`).join('\n')}

Brain dump:
${text}

Return ONLY the JSON array, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a task extraction assistant. Return only valid JSON.' },
        { role: 'user', content: extractionPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{"tasks": []}';

    // Parse JSON response
    const parsed = JSON.parse(responseText);
    const tasksArray = parsed.tasks || parsed || [];

    // Convert to Task objects with IDs
    return tasksArray.map((task: any) => ({
      id: crypto.randomUUID(),
      text: task.text || 'Untitled task',
      done: false,
      company: task.company || undefined,
      project: task.project || undefined,
      category: task.category || undefined,
      outcome_description: task.outcome_description || undefined,
      estimatedMinutes: task.estimatedMinutes || undefined,
      deadline: task.deadline || undefined,
      priority: task.priority || 'medium',
      preferred_block_type: (task.preferred_block_type as BlockType) || 'F',
      linked_key_outcome: task.linked_key_outcome || undefined,
    }));
  } catch (error) {
    console.error('Task extraction error:', error);
    // Fallback: simple line-by-line parsing
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => ({
        id: crypto.randomUUID(),
        text: line.replace(/^[\d\.\-\*]+\s*/, ''),
        done: false,
        priority: 'medium' as const,
        preferred_block_type: 'F' as BlockType,
      }));
  }
}

export function autoAssignTasksToBlocks(
  tasks: Task[],
  blocks: Array<{ id: string; block_type: BlockType; start_time: string; end_time: string }>
): Map<string, Task[]> {
  const assignment = new Map<string, Task[]>();

  // Initialize empty arrays for each block
  blocks.forEach((block) => assignment.set(block.id, []));

  // Sort tasks by priority and deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    // High priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by deadline (earliest first)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    return 0;
  });

  // Assign tasks to matching block types
  for (const task of sortedTasks) {
    const preferredBlockType = task.preferred_block_type || 'F';

    // Find blocks matching the preferred type
    const matchingBlocks = blocks.filter((b) => b.block_type === preferredBlockType);

    if (matchingBlocks.length > 0) {
      // Assign to first matching block (could be smarter about time estimation)
      const targetBlock = matchingBlocks[0];
      assignment.get(targetBlock.id)?.push(task);
    } else {
      // Fallback: assign to first Focus block or first block
      const fallbackBlock = blocks.find((b) => b.block_type === 'F') || blocks[0];
      assignment.get(fallbackBlock.id)?.push(task);
    }
  }

  return assignment;
}

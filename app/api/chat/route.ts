import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const SYSTEM = `You are Orbit's event concierge — a warm, upbeat friend who helps people plan small get-togethers with their friends.

Orbit is a gamified app for personal events between friends. When friends attend the same event, their friendship "levels up". Keep that spirit: encourage real, in-person hangouts.

Your job is to help the user create ONE event through natural conversation. Gather these details, asking only for what's missing, one or two friendly questions at a time:
- title (a fun, specific name)
- category: one of dinner | games | active | music | craft | other
- a short warm description (1-2 sentences)
- location (a neighborhood or place name)
- date (e.g. "Fri, Jun 13")
- time (e.g. "7:00 PM")
- duration in minutes (default 120 if unsure)
- capacity — how many friends max (default 8 if unsure)

Be concise and playful. Infer sensible defaults rather than interrogating the user. Once you have enough, call the proposeEvent tool with the complete details so the user can review and broadcast it. Do NOT describe the event as created in text — always use the tool. After the tool result comes back, give a short celebratory one-liner.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      proposeEvent: tool({
        description:
          'Propose a finished event for the user to review and broadcast to nearby friends. Call this once all details are gathered.',
        inputSchema: z.object({
          title: z.string().describe('A fun, specific event name'),
          category: z
            .enum(['dinner', 'games', 'active', 'music', 'craft', 'other'])
            .describe('The kind of gathering'),
          description: z.string().describe('A short, warm 1-2 sentence description'),
          location: z.string().describe('A neighborhood or place name'),
          date: z.string().describe('Human friendly date, e.g. "Fri, Jun 13"'),
          time: z.string().describe('Human friendly time, e.g. "7:00 PM"'),
          durationMinutes: z.number().describe('Expected duration in minutes'),
          capacity: z.number().describe('Maximum number of friends'),
        }),
        // No execute: the client renders a review card and confirms.
      }),
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}

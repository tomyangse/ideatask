import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// npm install zod needed
const StructuredIdeaSchema = z.object({
  title: z.string().describe('A concise, clear title for the idea (max 60 chars)'),
  summary: z.string().nullable().describe('A one-sentence summary of the core concept'),
  tags: z.array(z.string()).describe('3-5 relevant keywords/tags'),
  category: z.enum([
    'technology', 'business', 'creative', 'personal', 'research', 'other'
  ]).describe('Primary category'),
  priority: z.number().min(1).max(5).describe('Priority level: 1=low, 5=urgent'),
  suggested_deadline: z.string().nullable().describe('ISO date string if time-sensitive, null otherwise'),
  color: z.string().describe('A hex color that matches the idea mood/category. Use vivid cosmic colors.'),
});

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google('gemini-3-flash-preview'),
      schema: StructuredIdeaSchema,
      prompt: `You are an AI assistant for a cosmic idea management app called Exobrain.
The user just captured a raw thought. Your job is to structure it.

Rules:
- Extract a concise, meaningful title (not just echoing the input)
- Generate 3-5 relevant tags for semantic grouping
- Classify into the most fitting category
- Assess priority (1=low/someday, 3=normal, 5=urgent/time-critical)
- Only set a deadline if the input clearly implies time pressure
- Choose a vivid hex color that evokes the idea's mood:
  - Tech/coding → blues (#3B82F6, #6366F1)
  - Business/money → ambers (#F59E0B, #EAB308)
  - Creative/art → pinks (#EC4899, #F43F5E)
  - Personal/life → greens (#10B981, #22C55E)
  - Research/learning → purples (#8B5CF6, #7C3AED)

User's raw input:
"${input}"`,
    });

    return NextResponse.json({
      id: crypto.randomUUID(),
      ...object,
    });
  } catch (error) {
    console.error('AI structuring error:', error);

    // Fallback: basic extraction without AI
    const { input } = await request.json().catch(() => ({ input: '' }));
    return NextResponse.json({
      id: crypto.randomUUID(),
      title: (input || 'Untitled').slice(0, 60),
      summary: null,
      tags: [],
      category: 'other',
      priority: 3,
      suggested_deadline: null,
      color: '#7C3AED',
    });
  }
}

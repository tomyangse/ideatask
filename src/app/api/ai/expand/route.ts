import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const MultiIdeaSchema = z.object({
  ideas: z.array(z.object({
    title: z.string().describe('Keep the original text as-is for the title. Do NOT rephrase or shorten it. Just clean up formatting.'),
    tags: z.array(z.string()).max(3).describe('1-3 keyword tags'),
    category: z.enum(['technology', 'business', 'creative', 'personal', 'research', 'other']),
    priority: z.number().min(1).max(5),
    color: z.string().describe('Vivid hex color matching the mood'),
  })).describe('Array of separate ideas extracted from the input. If the input contains one idea, return an array with one item. If multiple ideas/points, split into separate items.'),
});

export async function POST(request: Request) {
  // Parse body once, save for fallback
  let input = '';
  let parentTitle = '';
  try {
    const body = await request.json();
    input = body.input || '';
    parentTitle = body.parentTitle || '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!input || typeof input !== 'string') {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: google('gemini-3-flash-preview'),
      schema: MultiIdeaSchema,
      prompt: `You are Exobrain, an AI idea structuring assistant.

The user is brainstorming sub-ideas for: "${parentTitle || 'a new concept'}"

They typed the following input. Analyze it:
- If it contains ONE idea, return an array with 1 item
- If it contains MULTIPLE ideas (separated by commas, newlines, numbers, or logical breaks), split into separate items
- IMPORTANT: Keep each idea's title as close to the user's original wording as possible. Do NOT rephrase.

Color guide:
- Tech → blues (#3B82F6, #6366F1)
- Business → ambers (#F59E0B, #EAB308)  
- Creative → pinks (#EC4899, #F43F5E)
- Personal → greens (#10B981, #22C55E)
- Research → purples (#8B5CF6, #7C3AED)

User input:
"${input}"`,
    });

    const ideas = object.ideas.map(idea => ({
      id: crypto.randomUUID(),
      ...idea,
    }));

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('AI expand error:', error);

    // Fallback: split by common delimiters, use raw text as title
    const lines = input.split(/[,\n，、;；]/).map(l => l.trim()).filter(Boolean);
    const ideas = (lines.length > 0 ? lines : [input]).map(line => ({
      id: crypto.randomUUID(),
      title: line.slice(0, 80),
      tags: [],
      category: 'other' as const,
      priority: 3,
      color: '#7C3AED',
    }));

    return NextResponse.json({ ideas });
  }
}

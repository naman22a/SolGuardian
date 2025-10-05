import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import crypto from 'crypto';

const schema = z.object({
    name: z.string(),
    pragma: z.string(),
    categories: z.array(
        z.object({
            type: z.string(),
            lines: z.array(z.number()),
            confidence: z.number().min(0).max(1),
            explanation: z.string(),
        }),
    ),
});

export type SchemaType = z.infer<typeof schema>;

const parser = new JsonOutputParser<SchemaType>();

const promptText = `
You are a Solidity analyzer.
Extract metadata in JSON format ONLY.

IMPORTANT:
- Return ONLY valid JSON.
- Do NOT include explanations, code fences, or extra text.
- Start with {{ and end with }}.
- The "lines" field in categories MUST be an array of numbers (even if empty).
- The "confidence" field MUST be a number between 0 and 1 (0 = low confidence, 1 = high confidence).
- The "explanation" field MUST be a short description of why this issue is a problem.
- Analyze the code for security vulnerabilities, access control issues, etc.

Required JSON structure:
{{
  "name": "string (contract name)",
  "pragma": "string (solidity version)",
  "categories": [
    {{
      "type": "string (vulnerability type like 'access_control', 'reentrancy', 'arithmetic', 'bad_randomness', 'denial_of_service', 'front_running', 'short_addresses', 'time_manipulation', 'unchecked_low_level_calls')",
      "lines": [1, 2, 3], (array of line numbers where issues are found)
      "confidence": 0.85, (number between 0-1 indicating confidence in this finding)
      "explanation": "short human-readable reason why this is an issue"
    }}
  ]
}}

{format_instructions}

File path: {path}
File name: {name}

Content with line numbers:
{content}

Return JSON:`;

const prompt = new PromptTemplate({
    template: promptText,
    inputVariables: ['path', 'name', 'content'],
    partialVariables: { format_instructions: parser.getFormatInstructions() },
});

const model = new Ollama({
    model: 'codellama',
    temperature: 0.1,
});

function safeParseJson(raw: string | object): any {
    let text: string;

    if (typeof raw === 'object') {
        if (raw && typeof raw === 'object' && 'text' in raw) {
            text = (raw as any).text;
        } else {
            text = JSON.stringify(raw);
        }
    } else {
        text = raw;
    }

    text = text.trim();
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    let jsonStart = text.indexOf('{');
    if (jsonStart === -1) {
        throw new Error('No JSON object found in model output');
    }

    let braceCount = 0;
    let jsonEnd = -1;

    for (let i = jsonStart; i < text.length; i++) {
        if (text[i] === '{') {
            braceCount++;
        } else if (text[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                jsonEnd = i;
                break;
            }
        }
    }

    if (jsonEnd === -1) {
        throw new Error('Incomplete JSON object found');
    }

    const jsonStr = text.substring(jsonStart, jsonEnd + 1);

    try {
        const parsed = JSON.parse(jsonStr);

        if (parsed.categories && Array.isArray(parsed.categories)) {
            parsed.categories = parsed.categories.map((cat: any) => ({
                type: cat.type || 'unknown',
                lines: Array.isArray(cat.lines) ? cat.lines : [],
                confidence:
                    typeof cat.confidence === 'number'
                        ? Math.max(0, Math.min(1, cat.confidence))
                        : 0.5,
                explanation: cat.explanation || 'No explanation provided',
            }));
        } else {
            parsed.categories = [];
        }

        return parsed;
    } catch (e) {
        console.error('Failed to parse JSON:', jsonStr);
        throw new Error(
            `JSON parse error: ${
                e instanceof Error ? e.message : 'Unknown error'
            }`,
        );
    }
}

export async function analyzeFile(
    path: string,
    name: string,
    content: string,
): Promise<SchemaType> {
    try {
        const formattedPrompt = await prompt.format({
            path,
            name,
            content: content
                .split('\n')
                .map((line, i) => `${i + 1}: ${line}`)
                .join('\n'),
        });

        console.log('Sending prompt to model...');
        const rawOutput = await model.invoke(formattedPrompt);
        console.log('Raw output received:', typeof rawOutput);

        const jsonData = safeParseJson(rawOutput);

        const validatedData = schema.parse(jsonData);

        return validatedData;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error:', (error as any).errors);
            const fallbackData = {
                name: name.replace('.sol', ''),
                pragma: 'unknown',
                categories: [],
            };
            return schema.parse(fallbackData);
        }
        console.error('Error in analyzeFile:', error);
        throw error;
    }
}

export function getCodeHash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

'use server';

/**
 * @fileOverview Generates a visual flowchart explaining a user's rights and options based on their legal scenario.
 *
 * - generateLegalFlowchart - A function that generates the legal flowchart.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { GenerateLegalFlowchartInput, GenerateLegalFlowchartOutput } from '@/ai/schemas/legal-issue-types';
import { GenerateLegalFlowchartInputSchema, GenerateLegalFlowchartOutputSchema } from '@/ai/schemas/legal-issue-types';

export async function generateLegalFlowchart(input: GenerateLegalFlowchartInput): Promise<GenerateLegalFlowchartOutput> {
  return generateLegalFlowchartFlow(input);
}

const generateLegalFlowchartPrompt = ai.definePrompt({
  name: 'generateLegalFlowchartPrompt',
  input: {
    schema: GenerateLegalFlowchartInputSchema, // Use imported schema
  },
  output: {
    schema: GenerateLegalFlowchartOutputSchema, // Use imported schema
  },
  prompt: `You are an AI legal assistant that specializes in creating flowcharts to explain user rights and options.

  Based on the user's description of their legal issue and relevant law, construct a flowchart that visualizes the legal process and steps they can take.

  Legal Issue Description: {{{legalIssueDescription}}}
  Relevant Law (if available): {{{relevantLaw}}}

  The flowchart should be easy to understand and provide clear guidance to the user.

  Output the flowchart in a textual format. Here's an example:

  Start --> [Action 1] --> Condition? --> Yes: [Option A] --> End
                                  No: [Option B] --> End`,
});

const generateLegalFlowchartFlow = ai.defineFlow<
  typeof GenerateLegalFlowchartInputSchema,
  typeof GenerateLegalFlowchartOutputSchema
>(
  {
    name: 'generateLegalFlowchartFlow',
    inputSchema: GenerateLegalFlowchartInputSchema,
    outputSchema: GenerateLegalFlowchartOutputSchema,
  },
  async input => {
    const {output} = await generateLegalFlowchartPrompt(input);
    return output!;
  }
);

// src/app/types.ts
import { z } from "zod";
// Import the shared MCQ schema and output types
import type { UnderstandLegalIssueOutput, GenerateLegalFlowchartOutput, MCQ } from "@/ai/schemas/legal-issue-types";
import { MCQSchema } from "@/ai/schemas/legal-issue-types"; // Import MCQSchema

// --- Form Input ---

// Schema for the initial form input
export const legalIssueSchema = z.object({
  scenario: z.string().min(10, "Please provide a more detailed description of the scenario."),
  // keywords removed
});

// Type derived from the form schema
export type LegalIssueFormInput = z.infer<typeof legalIssueSchema>;

// --- Refinement Input ---

// Schema for the input needed to refine the analysis
export const RefineInputSchema = z.object({
  originalScenario: z.string().describe("The original scenario provided by the user."),
  // originalKeywords removed
  questionsAndAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).describe("The clarifying questions and the user's selected answers."),
});
export type RefineInput = z.infer<typeof RefineInputSchema>;


// --- Server Action Response ---

// Type for the response from server actions (can return initial analysis, flowchart, or refined analysis)
export type ActionResponse = {
  success: boolean;
  message?: string;
  // Data can be initial analysis, flowchart result, or refined analysis (which has the same structure as initial)
  data?: UnderstandLegalIssueOutput | GenerateLegalFlowchartOutput | null;
  error?: unknown; // Consider more specific error typing if needed (e.g., ZodError details)
};

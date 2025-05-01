// src/app/types.ts
import { z } from "zod";
import type { UnderstandLegalIssueOutput, GenerateLegalFlowchartOutput } from "@/ai/schemas/legal-issue-types";

// Schema for the form input - updated to use 'scenario'
export const legalIssueSchema = z.object({
  scenario: z.string().min(10, "Please provide a more detailed description of the scenario."),
  keywords: z.string().min(3, "Please provide at least one keyword."),
});

// Type derived from the form schema - updated to use 'scenario'
export type LegalIssueFormInput = z.infer<typeof legalIssueSchema>;

// Type for the response from server actions
export type ActionResponse = {
  success: boolean;
  message?: string;
  // Use a union type for data if the action can return different result types
  data?: UnderstandLegalIssueOutput | GenerateLegalFlowchartOutput | null;
  error?: unknown; // Consider more specific error typing if needed (e.g., ZodError details)
};

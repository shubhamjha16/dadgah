// src/app/actions.ts
"use server";

import { z } from "zod";
import { understandLegalIssue } from "@/ai/flows/understand-legal-issue";
import { generateLegalFlowchart } from "@/ai/flows/generate-legal-flowchart";
// Import types and schemas from the new central location
import type {
  UnderstandLegalIssueInput,
  UnderstandLegalIssueOutput,
  GenerateLegalFlowchartInput,
  GenerateLegalFlowchartOutput
} from "@/ai/schemas/legal-issue-types";
// Import form/action related types and schemas from the new types file
import type { LegalIssueFormInput, ActionResponse } from "@/app/types";
import { legalIssueSchema } from "@/app/types";


/**
 * Server action to call the understandLegalIssue GenAI flow.
 */
export async function handleUnderstandLegalIssue(data: LegalIssueFormInput): Promise<ActionResponse> {
  try {
    // Validate form input against the schema
    const validatedData = legalIssueSchema.parse(data);
    // Prepare input for the AI flow (assuming it matches the form schema for now)
    const input: UnderstandLegalIssueInput = {
      description: validatedData.description,
      keywords: validatedData.keywords,
    };
    console.log("Calling understandLegalIssue with input:", input);
    const result = await understandLegalIssue(input);
    console.log("Received result from understandLegalIssue:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in handleUnderstandLegalIssue:", error);
     // Handle Zod validation errors specifically if desired
     if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid input data.", error: error.flatten() };
     }
    return { success: false, message: "Failed to understand legal issue.", error };
  }
}

/**
 * Server action to call the generateLegalFlowchart GenAI flow.
 * This requires input matching GenerateLegalFlowchartInput.
 */
export async function handleGenerateFlowchart(data: GenerateLegalFlowchartInput): Promise<ActionResponse> {
  try {
    // Optional: Add validation if needed, e.g., using GenerateLegalFlowchartInputSchema.parse(data)
    console.log("Calling generateLegalFlowchart with input:", data);
    const result = await generateLegalFlowchart(data);
    console.log("Received result from generateLegalFlowchart:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in handleGenerateFlowchart:", error);
     if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid input data for flowchart.", error: error.flatten() };
     }
    return { success: false, message: "Failed to generate flowchart.", error };
  }
}

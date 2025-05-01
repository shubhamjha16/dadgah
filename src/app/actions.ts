// src/app/actions.ts
"use server";

import { z } from "zod";
import { understandLegalIssue } from "@/ai/flows/understand-legal-issue";
import { generateLegalFlowchart } from "@/ai/flows/generate-legal-flowchart";
// Import types and schemas from the new central location
import type {
  UnderstandLegalIssueInput,
  // UnderstandLegalIssueOutput, // No longer needed directly here if ActionResponse uses it
  GenerateLegalFlowchartInput,
  // GenerateLegalFlowchartOutput // No longer needed directly here if ActionResponse uses it
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
    // Prepare input for the AI flow - updated to use 'scenario'
    const input: UnderstandLegalIssueInput = {
      scenario: validatedData.scenario, // Use scenario field
      keywords: validatedData.keywords,
    };
    console.log("Calling understandLegalIssue with input:", input);
    const result = await understandLegalIssue(input);
    console.log("Received result from understandLegalIssue:", result);
    // Check if the result looks like UnderstandLegalIssueOutput
    if (result && 'legalAnalysis' in result && 'safetyIndicator' in result) {
       return { success: true, data: result };
    } else {
        // Handle cases where the output might be missing expected fields
        console.error("Received unexpected data format from understandLegalIssue:", result);
        return { success: false, message: "Received unexpected data format from analysis.", data: null };
    }
  } catch (error) {
    console.error("Error in handleUnderstandLegalIssue:", error);
     // Handle Zod validation errors specifically if desired
     if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid input data.", error: error.flatten() };
     }
    // Ensure a generic error message for other errors
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to understand legal issue: ${message}`, error };
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
     // Check if the result looks like GenerateLegalFlowchartOutput
     if (result && 'flowchart' in result) {
        return { success: true, data: result };
     } else {
         console.error("Received unexpected data format from generateLegalFlowchart:", result);
         return { success: false, message: "Received unexpected data format from flowchart generation.", data: null };
     }
  } catch (error) {
    console.error("Error in handleGenerateFlowchart:", error);
     if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid input data for flowchart.", error: error.flatten() };
     }
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to generate flowchart: ${message}`, error };
  }
}

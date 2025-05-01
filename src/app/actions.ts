// src/app/actions.ts
"use server";

import { z } from "zod";
import { understandLegalIssue } from "@/ai/flows/understand-legal-issue";
import { generateLegalFlowchart } from "@/ai/flows/generate-legal-flowchart";
import { refineLegalIssue } from "@/ai/flows/refine-legal-issue"; // Import the new refinement flow
// Import types and schemas from the new central location
import type {
  UnderstandLegalIssueInput,
  GenerateLegalFlowchartInput,
  RefineLegalIssueInput, // Import the input type for refinement
} from "@/ai/schemas/legal-issue-types";
// Import form/action related types and schemas from the new types file
import type { LegalIssueFormInput, ActionResponse, RefineInput } from "@/app/types"; // Import RefineInput
import { legalIssueSchema, RefineInputSchema } from "@/app/types"; // Import RefineInputSchema

/**
 * Server action to call the understandLegalIssue GenAI flow.
 */
export async function handleUnderstandLegalIssue(data: LegalIssueFormInput): Promise<ActionResponse> {
  try {
    // Validate form input against the schema
    const validatedData = legalIssueSchema.parse(data);
    // Prepare input for the AI flow
    const input: UnderstandLegalIssueInput = {
      scenario: validatedData.scenario,
      // keywords removed
    };
    console.log("Calling understandLegalIssue with input:", input);
    const result = await understandLegalIssue(input);
    console.log("Received result from understandLegalIssue:", result);
    // Check if the result looks like UnderstandLegalIssueOutput
    if (result && 'legalAnalysis' in result && 'safetyIndicator' in result) {
       return { success: true, data: result };
    } else {
        console.error("Received unexpected data format from understandLegalIssue:", result);
        return { success: false, message: "Received unexpected data format from analysis.", data: null };
    }
  } catch (error) {
    console.error("Error in handleUnderstandLegalIssue:", error);
     if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid input data.", error: error.flatten() };
     }
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to understand legal issue: ${message}`, error };
  }
}

/**
 * Server action to call the refineLegalIssue GenAI flow.
 */
export async function handleRefineLegalIssue(data: RefineInput): Promise<ActionResponse> {
  try {
    // Validate the refinement input against its schema
    const validatedData = RefineInputSchema.parse(data);

    // Prepare input for the AI refinement flow
    const input: RefineLegalIssueInput = {
      originalScenario: validatedData.originalScenario,
      // originalKeywords removed
      questionsAndAnswers: validatedData.questionsAndAnswers,
    };

    console.log("Calling refineLegalIssue with input:", input);
    const result = await refineLegalIssue(input); // Call the refinement flow
    console.log("Received result from refineLegalIssue:", result);

    // The output structure is the same as UnderstandLegalIssueOutput
    if (result && 'legalAnalysis' in result && 'safetyIndicator' in result) {
       return { success: true, data: result }; // Return the refined data
    } else {
        console.error("Received unexpected data format from refineLegalIssue:", result);
        return { success: false, message: "Received unexpected data format from refinement.", data: null };
    }
  } catch (error) {
    console.error("Error in handleRefineLegalIssue:", error);
     if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid input data for refinement.", error: error.flatten() };
     }
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to refine legal issue: ${message}`, error };
  }
}


/**
 * Server action to call the generateLegalFlowchart GenAI flow.
 * This requires input matching GenerateLegalFlowchartInput.
 * Note: This flow is likely redundant now as flowchart generation is part of understand/refine flows.
 * Consider removing if not used independently.
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

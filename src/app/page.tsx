// src/app/page.tsx
"use client";

import React, { useState, startTransition } from 'react';
import { LegalIssueForm } from "@/components/legal-issue-form";
import { LegalAnalysisDisplay } from "@/components/legal-analysis-display";
import { handleUnderstandLegalIssue } from "@/app/actions";
import type { LegalIssueFormInput, ActionResponse } from "@/app/actions";
import type { UnderstandLegalIssueOutput } from "@/ai/schemas/legal-issue-types"; // Updated import path
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from 'lucide-react'; // Icon for Ius

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<UnderstandLegalIssueOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: LegalIssueFormInput): Promise<ActionResponse> => {
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous results

    let response: ActionResponse = { success: false, message: 'An unexpected error occurred.' };

    try {
      // Use startTransition for non-urgent updates triggered by server actions
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          response = await handleUnderstandLegalIssue(data);
          if (response.success && response.data) {
            // Ensure the data matches the expected type before setting state
             if ('legalAnalysis' in response.data && 'flowchart' in response.data && 'safetyIndicator' in response.data) {
               setAnalysisResult(response.data as UnderstandLegalIssueOutput);
                toast({
                  title: "Analysis Complete",
                  description: "Your legal issue has been analyzed.",
                  variant: "default",
                });
            } else {
                 // Handle case where data might be from a different flow (e.g., flowchart only)
                 console.error("Received unexpected data format:", response.data);
                 toast({
                   title: "Analysis Error",
                   description: "Received unexpected data format from the server.",
                   variant: "destructive",
                 });
                 setAnalysisResult(null);
            }
          } else {
            console.error("Analysis failed:", response.message, response.error);
            toast({
              title: "Analysis Failed",
              description: response.message || "Could not process your request. Please try again.",
              variant: "destructive",
            });
             setAnalysisResult(null); // Ensure no stale data is shown on error
          }
          resolve(); // Resolve the promise after the transition completes
        });
      });
    } catch (error) {
        console.error("Caught error during submit transition:", error);
        toast({
            title: "Submission Error",
            description: "An error occurred while submitting your request.",
            variant: "destructive",
        });
         setAnalysisResult(null);
         // Ensure response reflects the error caught outside the transition
         response = { success: false, message: "Submission failed.", error };
    } finally {
      setIsLoading(false);
    }
     return response;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-gradient-to-br from-background to-accent/50">
      <div className="w-full max-w-3xl">
        <header className="mb-10 text-center">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 rounded-full mb-4">
             <Scale className="h-10 w-10 text-primary" />
           </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Ius</h1>
          <p className="text-lg text-muted-foreground">Understand Your Rights, Instantly.</p>
        </header>

        <Card className="shadow-lg border border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Describe Your Situation</CardTitle>
            <CardDescription>
              Enter details about your legal encounter below. We'll provide an initial analysis based on common legal principles.
              <br/>
              <strong className="text-destructive">Disclaimer:</strong> This tool provides informational analysis only and is not a substitute for professional legal advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LegalIssueForm onSubmit={handleFormSubmit} isSubmitting={isLoading} />
          </CardContent>
        </Card>

        {/* Display analysis results */}
        {/* Conditional rendering based on loading state can be added here if needed */}
         {isLoading && (
             <div className="mt-8 text-center text-muted-foreground">Analyzing...</div>
         )}
        <LegalAnalysisDisplay analysis={analysisResult} />

      </div>
        <footer className="mt-16 text-center text-xs text-muted-foreground">
            Powered by AI | Not Legal Advice
        </footer>
    </main>
  );
}
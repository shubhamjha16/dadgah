// src/app/page.tsx
"use client";

import React, { useState, startTransition, useRef } from 'react';
import { LegalIssueForm } from "@/components/legal-issue-form";
import { LegalAnalysisDisplay } from "@/components/legal-analysis-display";
import { handleUnderstandLegalIssue, handleRefineLegalIssue } from "@/app/actions"; // Import refinement action
// Update imports for types previously in actions.ts
import type { LegalIssueFormInput, ActionResponse, RefineInput } from "@/app/types";
import type { UnderstandLegalIssueOutput, MCQ } from "@/ai/schemas/legal-issue-types"; // Import MCQ type
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from 'lucide-react'; // Icon for Dadgah (using Scale for now)
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export default function Home() {
  const [originalInput, setOriginalInput] = useState<LegalIssueFormInput | null>(null); // Store original form data (without keywords)
  const [analysisResult, setAnalysisResult] = useState<UnderstandLegalIssueOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false); // State for refinement loading
  const { toast } = useToast();
  const analysisDisplayRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // Scroll to the analysis section
  const scrollToAnalysis = () => {
      analysisDisplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormSubmit = async (data: LegalIssueFormInput): Promise<ActionResponse> => {
    setIsLoading(true);
    setOriginalInput(data); // Store the submitted data (scenario only)
    setAnalysisResult(null); // Clear previous results

    let response: ActionResponse = { success: false, message: 'An unexpected error occurred.' };

    try {
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          response = await handleUnderstandLegalIssue(data);
          if (response.success && response.data) {
             if ('legalAnalysis' in response.data && 'flowchart' in response.data && 'safetyIndicator' in response.data) {
               setAnalysisResult(response.data as UnderstandLegalIssueOutput);
                toast({
                  title: "Analysis Complete",
                  description: "Initial legal analysis generated.",
                  variant: "default",
                });
                 // Scroll down after analysis is set
                 requestAnimationFrame(scrollToAnalysis);
            } else {
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
             setAnalysisResult(null);
          }
          resolve();
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
         response = { success: false, message: "Submission failed.", error };
    } finally {
      setIsLoading(false);
    }
     return response;
  };

  // Function to handle the submission of MCQ answers for refinement
  const handleRefineSubmit = async (answers: Record<number, string>) => {
    if (!originalInput?.scenario || !analysisResult?.clarifyingQuestions) {
      toast({ title: "Error", description: "Missing original scenario or questions for refinement.", variant: "destructive" });
      return;
    }

    setIsRefining(true); // Set refining loading state

    const questionsAndAnswers = analysisResult.clarifyingQuestions.map((mcq, index) => ({
        question: mcq.question,
        answer: answers[index] || "Not answered", // Get the selected answer
    }));


    const refineData: RefineInput = {
      originalScenario: originalInput.scenario,
      // originalKeywords removed
      questionsAndAnswers: questionsAndAnswers,
    };

    let response: ActionResponse = { success: false, message: 'An unexpected error occurred during refinement.' };

     try {
       await new Promise<void>((resolve) => {
         startTransition(async () => {
           response = await handleRefineLegalIssue(refineData); // Call the refinement action
           if (response.success && response.data) {
             if ('legalAnalysis' in response.data && 'safetyIndicator' in response.data) {
               setAnalysisResult(response.data as UnderstandLegalIssueOutput); // Update state with refined analysis
               toast({
                 title: "Analysis Refined",
                 description: "Legal analysis updated based on your answers.",
                 variant: "default",
               });
                 // Scroll down after refinement
                 requestAnimationFrame(scrollToAnalysis);
             } else {
               console.error("Received unexpected data format during refinement:", response.data);
               toast({
                 title: "Refinement Error",
                 description: "Received unexpected data format from the server during refinement.",
                 variant: "destructive",
               });
               // Optionally keep the old analysis or clear it
               // setAnalysisResult(null);
             }
           } else {
             console.error("Refinement failed:", response.message, response.error);
             toast({
               title: "Refinement Failed",
               description: response.message || "Could not refine the analysis. Please try again.",
               variant: "destructive",
             });
              // Optionally keep the old analysis
              // setAnalysisResult(null);
           }
           resolve();
         });
       });
     } catch (error) {
       console.error("Caught error during refine transition:", error);
       toast({
         title: "Refinement Error",
         description: "An error occurred while refining the analysis.",
         variant: "destructive",
       });
       // Optionally keep the old analysis
       // setAnalysisResult(null);
       response = { success: false, message: "Refinement failed.", error };
     } finally {
       setIsRefining(false); // Clear refining loading state
     }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-gradient-to-br from-background to-accent/50">
      <div className="w-full max-w-3xl">
        <header className="mb-10 text-center">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 rounded-full mb-4">
             <Scale className="h-10 w-10 text-primary" />
           </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Dadgah</h1> {/* Updated Name */}
          <p className="text-lg text-muted-foreground">Understand Your Rights in India, Instantly.</p> {/* Updated tagline */}
        </header>

        {/* Step 1: Input Form */}
        <Card className="shadow-lg border border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Step 1: Describe Your Situation</CardTitle>
            <CardDescription>
              Enter details about your legal encounter below. We'll provide an initial analysis based on common principles of Indian law.
              <br/>
              <strong className="text-destructive">Disclaimer:</strong> This tool provides informational analysis only and is not a substitute for professional legal advice from a qualified Indian lawyer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LegalIssueForm onSubmit={handleFormSubmit} isSubmitting={isLoading || isRefining} /> {/* Disable form while loading/refining */}
          </CardContent>
        </Card>

         {/* Step 2: Initial Analysis Display (with loading state) */}
         <div ref={analysisDisplayRef} className="mt-8 w-full"> {/* Added ref for scrolling */}
             {isLoading && (
                 <Card className="shadow-md border border-border/50">
                    <CardHeader><CardTitle>Analyzing...</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                 </Card>
             )}
             {/* Step 3: Refinement/Final Analysis Display */}
             {analysisResult && !isLoading && (
                 <LegalAnalysisDisplay
                     analysis={analysisResult}
                     onRefineSubmit={handleRefineSubmit} // Pass the refine handler
                     isRefining={isRefining} // Pass refining state
                 />
             )}
         </div>

      </div>
        <footer className="mt-16 text-center text-xs text-muted-foreground">
            Powered by AI | Focus on Indian Law | Not Legal Advice
        </footer>
    </main>
  );
}

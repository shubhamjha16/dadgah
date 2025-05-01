// src/components/legal-analysis-display.tsx
import type { UnderstandLegalIssueOutput, MCQ } from "@/ai/schemas/legal-issue-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, Gavel, HelpCircle, MessageSquareQuote, ListChecks, RefreshCw, Loader2, ChevronRight } from "lucide-react"; // Added ChevronRight
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LegalAnalysisDisplayProps {
  analysis: UnderstandLegalIssueOutput | null;
  onRefineSubmit: (answers: Record<number, string>) => Promise<void>;
  isRefining: boolean;
}

const SafetyIndicatorBadge: React.FC<{ indicator: UnderstandLegalIssueOutput['safetyIndicator'] }> = ({ indicator }) => {
  let variant: "default" | "destructive" | "secondary" = "secondary";
  let IconComponent = AlertCircle;
  let text = indicator;

  switch (indicator) {
    case 'Safe':
      variant = "default";
      IconComponent = CheckCircle;
      text = "Safe Situation";
      break;
    case 'Caution':
      variant = "secondary";
      IconComponent = AlertTriangle;
      text = "Use Caution";
      break;
    case 'Illegal Detainment Possible':
      variant = "destructive";
      IconComponent = AlertCircle;
      text = "Risk of Illegal Detainment";
      break;
  }

  return (
    <Badge variant={variant} className="text-sm font-medium ml-auto shrink-0">
      <IconComponent className="mr-1 h-4 w-4" />
      {text}
    </Badge>
  );
};

export function LegalAnalysisDisplay({ analysis, onRefineSubmit, isRefining }: LegalAnalysisDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null); // Use null to indicate questions not started or finished

  // Reset answers and index when analysis changes
  useEffect(() => {
    setSelectedAnswers({});
    // Start questions only if there are questions in the new analysis
    if (analysis?.clarifyingQuestions && analysis.clarifyingQuestions.length > 0) {
      setCurrentQuestionIndex(0); // Start at the first question
    } else {
      setCurrentQuestionIndex(null); // No questions or finished
    }
  }, [analysis]);

  const handleAnswerChange = (questionIndex: number, optionValue: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionValue,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex !== null) {
       const nextIndex = currentQuestionIndex + 1;
       const totalQuestions = analysis?.clarifyingQuestions?.length ?? 0;
       if (nextIndex < totalQuestions) {
           setCurrentQuestionIndex(nextIndex);
       } else {
           setCurrentQuestionIndex(null); // Indicate questions are finished
       }
    }
  };

  const handleRefineClick = () => {
    // Ensure all questions are answered before submitting
    const numQuestions = analysis?.clarifyingQuestions?.length ?? 0;
    if (numQuestions > 0 && Object.keys(selectedAnswers).length === numQuestions) {
      onRefineSubmit(selectedAnswers);
       setCurrentQuestionIndex(null); // Indicate questions finished after submitting for refinement
    } else {
        console.error("Attempted to refine without all answers selected.");
        // Optionally show a toast message here
    }
  };

  if (!analysis && !isRefining) {
    return null;
  }

  const renderList = (items: string[] | undefined, defaultMessage: string) => {
    if (items && items.length > 0) {
      return (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      );
    }
    return <p className="text-sm text-muted-foreground">{defaultMessage}</p>;
  };

  const clarifyingQuestions = analysis?.clarifyingQuestions;
  const totalQuestions = clarifyingQuestions?.length ?? 0;
  const hasQuestions = totalQuestions > 0;
  // Check if questions are currently being asked
  const askingQuestions = currentQuestionIndex !== null;

  const currentQuestion: MCQ | undefined = askingQuestions ? clarifyingQuestions?.[currentQuestionIndex!] : undefined;
  const isLastQuestion = askingQuestions && currentQuestionIndex === totalQuestions - 1;
  const currentAnswer = askingQuestions ? selectedAnswers[currentQuestionIndex!] : undefined;

  // Determine which step number corresponds to which section
  let analysisStep = 2;
  let refineStep = hasQuestions ? 3 : -1; // Only relevant if there are questions
  let interpretationStep = hasQuestions ? 4 : 3;

  // Determine if the final sections should be displayed (either no questions, or questions finished, and not refining)
  const showFinalSections = !isRefining && (!hasQuestions || !askingQuestions);


  return (
    <Card className={`mt-8 shadow-md border border-border/50 transition-opacity duration-300 ${isRefining ? 'opacity-70' : 'opacity-100'}`}>
      <CardHeader className="flex flex-row items-start space-x-4 space-y-0 pb-2">
        <div className="flex-grow">
          <CardTitle className="text-xl font-bold">
            {isRefining ? "Refining Analysis..." : `Step ${analysisStep}: Legal Analysis (Indian Context)`}
          </CardTitle>
          {analysis?.relevantLaw && !isRefining && (
            <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
              <Gavel className="mr-1 h-3 w-3" /> Relevant Indian Law: {analysis.relevantLaw}
            </CardDescription>
          )}
          {isRefining && <Skeleton className="h-4 w-1/2 mt-1" />}
        </div>
        {analysis?.safetyIndicator && !isRefining && <SafetyIndicatorBadge indicator={analysis.safetyIndicator} />}
        {isRefining && <Skeleton className="h-6 w-24 ml-auto shrink-0 rounded-full" />}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">

        {/* Analysis Summary */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Summary</h3>
          {isRefining ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <CardDescription className="whitespace-pre-wrap">{analysis?.legalAnalysis || "No analysis summary provided."}</CardDescription>
          )}
        </div>

        <Separator />

        {/* Flowchart Section */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Potential Steps Flowchart</h3>
          {isRefining ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <Card className="bg-accent/50 p-4 rounded-md shadow-inner border border-border/30">
              <p className="text-accent-foreground font-mono text-sm whitespace-pre-wrap">
                {analysis?.flowchart || "No flowchart generated."}
              </p>
            </Card>
          )}
          {!isRefining && (
            <CardDescription className="mt-2 text-xs">
              This flowchart visualizes potential steps based on Indian law. It is not exhaustive legal advice.
            </CardDescription>
          )}
        </div>

        {/* Separator shown if there are questions OR if currently refining */}
        {(hasQuestions || isRefining) && <Separator />}

        {/* Clarifying Questions Section (Step-by-step) */}
        {hasQuestions && askingQuestions && currentQuestion && !isRefining && (
          <div>
             <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                <HelpCircle className="mr-2 h-5 w-5"/>Step {refineStep}: Clarifying Question ({currentQuestionIndex! + 1} of {totalQuestions})
            </h3>
             <CardDescription className="mb-4 text-sm">
                Answering these questions helps refine the analysis. Select the best option below.
             </CardDescription>

             {/* Card for the current question */}
             <Card key={currentQuestionIndex} className="p-4 border border-border/40 bg-background/50">
                 <Label className="font-semibold text-sm mb-3 block">{currentQuestion.question}</Label>
                 <RadioGroup
                     value={currentAnswer}
                     onValueChange={(value) => handleAnswerChange(currentQuestionIndex!, value)}
                     className="space-y-2"
                     disabled={isRefining}
                 >
                    {currentQuestion.options.map((option, optIndex) => (
                       <div key={optIndex} className="flex items-center space-x-2">
                         <RadioGroupItem value={option} id={`q${currentQuestionIndex}-opt${optIndex}`} disabled={isRefining} />
                         <Label htmlFor={`q${currentQuestionIndex}-opt${optIndex}`} className={`text-sm font-normal text-muted-foreground ${isRefining ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                           {option}
                         </Label>
                       </div>
                     ))}
                 </RadioGroup>
             </Card>

             {/* Navigation/Submission Button */}
             <div className="mt-6 flex justify-end">
                 {!isLastQuestion ? (
                     <Button
                         size="sm"
                         onClick={handleNextQuestion}
                         disabled={!currentAnswer || isRefining}
                     >
                         Next Question <ChevronRight className="ml-2 h-4 w-4"/>
                     </Button>
                 ) : (
                     <Button
                        size="sm"
                        onClick={handleRefineClick}
                        disabled={!currentAnswer || isRefining} // Disable if current answer not selected or refining
                      >
                        {isRefining ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Refining...
                            </>
                        ) : (
                             <>
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                 Refine Analysis with Answers
                             </>
                         )}
                     </Button>
                 )}
             </div>
             {!currentAnswer && <p className="text-xs text-muted-foreground mt-2 text-right">Please select an answer to continue.</p>}
          </div>
        )}
         {/* Show Skeleton while refining questions phase */}
         {isRefining && hasQuestions && (
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                   <HelpCircle className="mr-2 h-5 w-5"/>Refining Analysis...
               </h3>
                <CardDescription className="mb-4 text-sm">
                   Processing your answers...
                </CardDescription>
                <Card className="p-4 border border-border/40 bg-background/50">
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </Card>
                 <div className="mt-6 flex justify-end">
                     <Skeleton className="h-9 w-32" />
                </div>
            </div>
         )}

        {/* Conditionally render separator if questions were finished OR if we are showing final sections and there were questions */}
        {showFinalSections && hasQuestions && <Separator />}


        {/* --- FINAL SECTIONS START --- */}
        {/* These sections only show when !isRefining AND (!hasQuestions OR !askingQuestions) */}

         {/* Final Interpretation */}
         {showFinalSections && (
             <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Step {interpretationStep}: Final Interpretation
                </h3>
                <CardDescription className="whitespace-pre-wrap">{analysis?.finalInterpretation || "Final interpretation will appear here after analysis."}</CardDescription>
             </div>
         )}
         {/* Skeleton for interpretation *during* refinement */}
         {isRefining && (
             <div>
               <h3 className="text-lg font-semibold text-foreground mb-2">Final Interpretation</h3>
                <Skeleton className="h-4 w-full mt-2"/>
                <Skeleton className="h-4 w-5/6 mt-2"/>
            </div>
         )}


        {/* Suggested Phrases */}
        {showFinalSections && analysis?.suggestedPhrases && analysis.suggestedPhrases.length > 0 && (
            <>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5"/>Suggested Phrases</h3>
                    {renderList(analysis.suggestedPhrases, "No specific phrases suggested.")}
                </div>
            </>
        )}
        {/* Skeleton for phrases *during* refinement */}
        {isRefining && (
            <div>
                <Separator />
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5"/>Suggested Phrases</h3>
                <Skeleton className="h-4 w-1/2 mt-2"/>
                <Skeleton className="h-4 w-3/4 mt-2"/>
            </div>
        )}


        {/* Suggested Actions */}
        {showFinalSections && analysis?.suggestedActions && analysis.suggestedActions.length > 0 && (
            <>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Suggested Actions</h3>
                    {renderList(analysis.suggestedActions, "No specific actions suggested.")}
                </div>
            </>
        )}
        {/* Skeleton for actions *during* refinement */}
        {isRefining && (
            <div>
                <Separator />
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Suggested Actions</h3>
                <Skeleton className="h-4 w-1/2 mt-2"/>
                <Skeleton className="h-4 w-2/3 mt-2"/>
            </div>
        )}


        {/* Disclaimer */}
        {showFinalSections && (
            <>
                <Separator />
                <div>
                    <p className="text-xs text-destructive font-medium text-center mt-4">
                        <strong>Disclaimer:</strong> This is an AI-generated analysis based on general interpretations of Indian law for informational purposes only. It does not constitute legal advice. Laws can be complex and vary based on specific facts and jurisdiction. Consult with a qualified legal professional in India for advice specific to your situation.
                    </p>
                </div>
            </>
        )}
        {/* Skeleton for disclaimer *during* refinement */}
        {isRefining && (
             <div>
                <Separator />
                <Skeleton className="h-10 w-full mt-4"/>
             </div>
        )}
        {/* --- FINAL SECTIONS END --- */}

      </CardContent>
    </Card>
  );
}

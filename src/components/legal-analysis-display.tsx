// src/components/legal-analysis-display.tsx
import type { UnderstandLegalIssueOutput, MCQ } from "@/ai/schemas/legal-issue-types"; // Updated import path, added MCQ
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, Gavel, HelpCircle, MessageSquareQuote, ListChecks, RefreshCw, Loader2 } from "lucide-react"; // Added RefreshCw, Loader2
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface LegalAnalysisDisplayProps {
  analysis: UnderstandLegalIssueOutput | null;
  onRefineSubmit: (answers: Record<number, string>) => Promise<void>; // Callback to trigger refinement
  isRefining: boolean; // Loading state for refinement
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
  // State to hold selected MCQ answers (key: question index, value: selected option value)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Reset answers when analysis changes (e.g., new initial analysis or refinement result)
   useEffect(() => {
     setSelectedAnswers({});
     setAllQuestionsAnswered(false); // Also reset button state
   }, [analysis]); // Dependency on the analysis object itself

  // Update answer state and check if all questions are answered
  const handleAnswerChange = (questionIndex: number, optionValue: string) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionIndex]: optionValue,
    };
    setSelectedAnswers(newAnswers);

    // Check if all clarifying questions (if any) have an answer in the new state
    const numQuestions = analysis?.clarifyingQuestions?.length ?? 0;
    setAllQuestionsAnswered(numQuestions > 0 && Object.keys(newAnswers).length === numQuestions);
  };

  // Handle the "Refine Analysis" button click
  const handleRefineClick = () => {
    if (allQuestionsAnswered) {
      onRefineSubmit(selectedAnswers);
    }
  };

  if (!analysis && !isRefining) { // Don't show if no analysis and not currently refining
    return null;
  }

  // Helper to render lists or default message
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

  // Determine if there are questions to display
  const hasQuestions = analysis?.clarifyingQuestions && analysis.clarifyingQuestions.length > 0;

  return (
    <Card className={`mt-8 shadow-md border border-border/50 transition-opacity duration-300 ${isRefining ? 'opacity-70' : 'opacity-100'}`}>
      <CardHeader className="flex flex-row items-start space-x-4 space-y-0 pb-2">
         <div className="flex-grow">
           <CardTitle className="text-xl font-bold">
                {isRefining ? "Refining Analysis..." : "Step 2: Legal Analysis (Indian Context)"}
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

         <Separator />

        {/* Clarifying Questions (MCQs) - Step 3 if present */}
        {hasQuestions && !isRefining && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><HelpCircle className="mr-2 h-5 w-5"/>Step 3: Clarifying Questions</h3>
             <CardDescription className="mb-4 text-sm">
                Answering these questions helps refine the analysis. Select the best option for each question below.
             </CardDescription>
            <div className="space-y-4">
              {analysis?.clarifyingQuestions?.map((mcq, index) => (
                <Card key={index} className="p-4 border border-border/40 bg-background/50">
                   <Label className="font-semibold text-sm mb-3 block">{index + 1}. {mcq.question}</Label>
                   <RadioGroup
                     // Use index as part of the value to ensure uniqueness if questions are similar
                     value={selectedAnswers[index]}
                     onValueChange={(value) => handleAnswerChange(index, value)}
                     className="space-y-2"
                     disabled={isRefining} // Disable while refining
                   >
                     {mcq.options.map((option, optIndex) => (
                       <div key={optIndex} className="flex items-center space-x-2">
                         <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} disabled={isRefining} />
                         <Label htmlFor={`q${index}-opt${optIndex}`} className={`text-sm font-normal text-muted-foreground ${isRefining ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                           {option}
                         </Label>
                       </div>
                     ))}
                   </RadioGroup>
                </Card>
              ))}
            </div>
             <Button
                className="mt-6 w-full sm:w-auto"
                size="sm"
                onClick={handleRefineClick}
                disabled={!allQuestionsAnswered || isRefining} // Disable if not all answered or currently refining
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
             {!allQuestionsAnswered && <p className="text-xs text-muted-foreground mt-2">Please answer all questions to enable refinement.</p>}
          </div>
        )}

        {/* Conditionally render separator if questions were shown */}
        {hasQuestions && !isRefining && <Separator />}


        {/* Final Interpretation - Step 4 (or Step 3 if no questions) */}
        {(analysis?.finalInterpretation && !isRefining) && (
           <>
             <div>
               <h3 className="text-lg font-semibold text-foreground mb-2">
                   {hasQuestions ? "Step 4: Final Interpretation" : "Step 3: Final Interpretation"}
                </h3>
               <CardDescription className="whitespace-pre-wrap">{analysis.finalInterpretation}</CardDescription>
             </div>
           </>
        )}
         {isRefining && ( // Skeleton for interpretation while refining
             <div>
               <h3 className="text-lg font-semibold text-foreground mb-2">Final Interpretation</h3>
                <Skeleton className="h-4 w-full mt-2"/>
                <Skeleton className="h-4 w-5/6 mt-2"/>
            </div>
         )}


         {/* Suggested Phrases */}
         {(analysis?.suggestedPhrases && analysis.suggestedPhrases.length > 0 && !isRefining) && (
              <>
                <Separator />
                 <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5"/>Suggested Phrases</h3>
                    {renderList(analysis.suggestedPhrases, "No specific phrases suggested.")}
                 </div>
              </>
         )}
         {isRefining && ( // Skeleton for phrases
             <div>
               <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5"/>Suggested Phrases</h3>
               <Skeleton className="h-4 w-1/2 mt-2"/>
                <Skeleton className="h-4 w-3/4 mt-2"/>
             </div>
         )}


         {/* Suggested Actions */}
          {(analysis?.suggestedActions && analysis.suggestedActions.length > 0 && !isRefining) && (
               <>
                 <Separator />
                  <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Suggested Actions</h3>
                      {renderList(analysis.suggestedActions, "No specific actions suggested.")}
                  </div>
               </>
           )}
            {isRefining && ( // Skeleton for actions
                <div>
                   <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Suggested Actions</h3>
                    <Skeleton className="h-4 w-1/2 mt-2"/>
                    <Skeleton className="h-4 w-2/3 mt-2"/>
                </div>
            )}


          <Separator />

          {/* Disclaimer */}
           {!isRefining && (
             <div>
                <p className="text-xs text-destructive font-medium text-center mt-4">
                    <strong>Disclaimer:</strong> This is an AI-generated analysis based on general interpretations of Indian law for informational purposes only. It does not constitute legal advice. Laws can be complex and vary based on specific facts and jurisdiction. Consult with a qualified legal professional in India for advice specific to your situation.
                </p>
             </div>
            )}
            {isRefining && <Skeleton className="h-10 w-full mt-4"/>}

      </CardContent>
    </Card>
  );
}

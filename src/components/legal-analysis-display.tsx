// src/components/legal-analysis-display.tsx
import type { UnderstandLegalIssueOutput } from "@/ai/schemas/legal-issue-types"; // Updated import path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, Gavel, HelpCircle, MessageSquareQuote, ListChecks, Vote } from "lucide-react"; // Added Vote icon
import React, { useState } from 'react'; // Added useState
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup imports
import { Label } from "@/components/ui/label"; // Added Label import
import { Button } from "@/components/ui/button"; // Added Button import

interface LegalAnalysisDisplayProps {
  analysis: UnderstandLegalIssueOutput | null;
}

const SafetyIndicatorBadge: React.FC<{ indicator: UnderstandLegalIssueOutput['safetyIndicator'] }> = ({ indicator }) => {
  let variant: "default" | "destructive" | "secondary" = "secondary";
  let IconComponent = AlertCircle;
  let text = indicator;

  switch (indicator) {
    case 'Safe':
      variant = "default"; // Using default (primary/teal) for positive indication
      IconComponent = CheckCircle;
      text = "Safe Situation";
      break;
    case 'Caution':
      variant = "secondary"; // Using secondary (grayish) for caution
      IconComponent = AlertTriangle;
      text = "Use Caution";
      break;
    case 'Illegal Detainment Possible':
      variant = "destructive"; // Using destructive (red) for high risk
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


export function LegalAnalysisDisplay({ analysis }: LegalAnalysisDisplayProps) {
  // State to hold selected MCQ answers (key: question index, value: selected option index)
  // Not fully implemented for feedback loop yet.
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleAnswerChange = (questionIndex: number, optionValue: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionValue,
    }));
    // TODO: Implement logic to potentially re-trigger analysis with answers
    console.log(`Selected answer for question ${questionIndex}: ${optionValue}`);
  };

  if (!analysis) {
    return null; // Don't render anything if there's no analysis yet
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

  return (
    <Card className="mt-8 shadow-md border border-border/50">
      <CardHeader className="flex flex-row items-start space-x-4 space-y-0 pb-2">
         {/* Flex container for Title and Badge */}
         <div className="flex-grow">
           <CardTitle className="text-xl font-bold">Legal Analysis (Indian Context)</CardTitle>
           {analysis.relevantLaw && (
             <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
                <Gavel className="mr-1 h-3 w-3" /> Relevant Indian Law: {analysis.relevantLaw}
             </CardDescription>
           )}
         </div>
         {/* Safety Indicator pushes to the right */}
         {analysis.safetyIndicator && <SafetyIndicatorBadge indicator={analysis.safetyIndicator} />}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Legal Analysis Summary */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Summary</h3>
          <CardDescription className="whitespace-pre-wrap">{analysis.legalAnalysis || "No analysis summary provided."}</CardDescription>
        </div>

        <Separator />

        {/* Flowchart Section */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Potential Steps Flowchart</h3>
          <Card className="bg-accent/50 p-4 rounded-md shadow-inner border border-border/30">
             <p className="text-accent-foreground font-mono text-sm whitespace-pre-wrap">
               {analysis.flowchart || "No flowchart generated."}
             </p>
          </Card>
          <CardDescription className="mt-2 text-xs">
            This flowchart visualizes potential steps based on Indian law. It is not exhaustive legal advice.
          </CardDescription>
        </div>

         <Separator />

        {/* Clarifying Questions (MCQs) */}
        {analysis.clarifyingQuestions && analysis.clarifyingQuestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><HelpCircle className="mr-2 h-5 w-5"/>Clarifying Questions</h3>
             <CardDescription className="mb-4 text-sm">
               Answering these questions could help refine the analysis (Refinement feature not yet active). Select the best option for each question.
             </CardDescription>
            <div className="space-y-4">
              {analysis.clarifyingQuestions.map((mcq, index) => (
                <Card key={index} className="p-4 border border-border/40 bg-background/50">
                   <Label className="font-semibold text-sm mb-3 block">{index + 1}. {mcq.question}</Label>
                   <RadioGroup
                     value={selectedAnswers[index]}
                     onValueChange={(value) => handleAnswerChange(index, value)}
                     className="space-y-2"
                   >
                     {mcq.options.map((option, optIndex) => (
                       <div key={optIndex} className="flex items-center space-x-2">
                         <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                         <Label htmlFor={`q${index}-opt${optIndex}`} className="text-sm font-normal text-muted-foreground cursor-pointer">
                           {option}
                         </Label>
                       </div>
                     ))}
                   </RadioGroup>
                </Card>
              ))}
            </div>
             {/* Optional: Add button to submit answers later */}
             {/* <Button className="mt-4" size="sm" disabled>Refine Analysis with Answers</Button> */}
          </div>
        )}


        {/* Final Interpretation */}
        {analysis.finalInterpretation && (
           <>
            <Separator />
             <div>
               <h3 className="text-lg font-semibold text-foreground mb-2">Interpretation</h3>
               <CardDescription className="whitespace-pre-wrap">{analysis.finalInterpretation}</CardDescription>
             </div>
           </>
        )}


         {/* Suggested Phrases */}
         {analysis.suggestedPhrases && analysis.suggestedPhrases.length > 0 && (
              <>
                <Separator />
                 <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5"/>Suggested Phrases</h3>
                    {renderList(analysis.suggestedPhrases, "No specific phrases suggested.")}
                 </div>
              </>
         )}


         {/* Suggested Actions */}
          {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
               <>
                 <Separator />
                  <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Suggested Actions</h3>
                      {renderList(analysis.suggestedActions, "No specific actions suggested.")}
                  </div>
               </>
           )}


          <Separator />

          {/* Disclaimer */}
           <div>
              <p className="text-xs text-destructive font-medium text-center mt-4">
                  <strong>Disclaimer:</strong> This is an AI-generated analysis based on general interpretations of Indian law for informational purposes only. It does not constitute legal advice. Laws can be complex and vary based on specific facts and jurisdiction. Consult with a qualified legal professional in India for advice specific to your situation.
              </p>
           </div>

      </CardContent>
    </Card>
  );
}

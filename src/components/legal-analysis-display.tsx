// src/components/legal-analysis-display.tsx
import type { UnderstandLegalIssueOutput } from "@/ai/schemas/legal-issue-types"; // Updated import path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, Gavel, HelpCircle, MessageSquareQuote, ListChecks } from "lucide-react";
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

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
           <CardTitle className="text-xl font-bold">Legal Analysis</CardTitle>
           {analysis.relevantLaw && (
             <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
                <Gavel className="mr-1 h-3 w-3" /> Relevant Law: {analysis.relevantLaw}
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
            This flowchart visualizes potential steps. It is not exhaustive legal advice.
          </CardDescription>
        </div>

         <Separator />

        {/* Clarifying Questions (MCQs) */}
        {analysis.clarifyingQuestions && analysis.clarifyingQuestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><HelpCircle className="mr-2 h-5 w-5"/>Clarifying Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {analysis.clarifyingQuestions.map((mcq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-sm text-left">{mcq.question}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-none pl-4 space-y-1 text-sm text-muted-foreground">
                       {mcq.options.map((option, optIndex) => <li key={optIndex}>- {option}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
             <CardDescription className="mt-2 text-xs">
               Answering these questions could refine the analysis (feature not yet implemented).
             </CardDescription>
          </div>
        )}

        {/* Final Interpretation */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Interpretation</h3>
          <CardDescription className="whitespace-pre-wrap">{analysis.finalInterpretation || "No final interpretation provided."}</CardDescription>
        </div>

         <Separator />

         {/* Suggested Phrases */}
         <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5"/>Suggested Phrases</h3>
            {renderList(analysis.suggestedPhrases, "No specific phrases suggested.")}
         </div>

         {/* Suggested Actions */}
          <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Suggested Actions</h3>
              {renderList(analysis.suggestedActions, "No specific actions suggested.")}
          </div>

          <Separator />

          {/* Disclaimer */}
           <div>
              <p className="text-xs text-destructive font-medium text-center mt-4">
                  <strong>Disclaimer:</strong> This is an AI-generated analysis for informational purposes only and does not constitute legal advice. Consult with a qualified legal professional for advice specific to your situation.
              </p>
           </div>

      </CardContent>
    </Card>
  );
}

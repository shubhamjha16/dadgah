// src/components/legal-analysis-display.tsx
import type { UnderstandLegalIssueOutput } from "@/ai/schemas/legal-issue-types"; // Updated import path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import React from 'react';

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

  // Let the variant handle the colors based on globals.css theme
  // Remove direct color classes unless absolutely necessary for override
  // const colorClasses = {
  //   Safe: 'bg-green-100 text-green-800 border-green-300',
  //   Caution: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  //   'Illegal Detainment Possible': 'bg-red-100 text-red-800 border-red-300',
  // }[indicator] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    // Rely on the variant prop and theme for styling
    <Badge variant={variant} className="text-sm font-medium">
      <IconComponent className="mr-1 h-4 w-4" />
      {text}
    </Badge>
  );
};


export function LegalAnalysisDisplay({ analysis }: LegalAnalysisDisplayProps) {
  if (!analysis) {
    return null; // Don't render anything if there's no analysis yet
  }

  return (
    <Card className="mt-8 shadow-md border border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Legal Analysis</CardTitle>
         {analysis.safetyIndicator && <SafetyIndicatorBadge indicator={analysis.safetyIndicator} />}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Legal Analysis Section */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Summary</h3>
          {/* Use CardDescription for consistent styling of descriptive text */}
          <CardDescription className="whitespace-pre-wrap">{analysis.legalAnalysis || "No analysis provided."}</CardDescription>
        </div>

        {/* Flowchart Section */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Rights & Options Flowchart</h3>
           {/* Basic text display for now. Could be enhanced with a flowchart library later. */}
          <Card className="bg-accent/50 p-4 rounded-md shadow-inner border border-border/30">
             {/* Ensure flowchart text uses appropriate foreground color */}
             <p className="text-accent-foreground font-mono text-sm whitespace-pre-wrap">
               {analysis.flowchart || "No flowchart generated."}
             </p>
          </Card>
          <CardDescription className="mt-2 text-xs">
            This flowchart visualizes potential steps based on the provided information. It is not exhaustive legal advice.
          </CardDescription>
        </div>

         {/* Suggested Actions/Phrases (Placeholder) */}
         {/*
         <div>
           <h3 className="text-lg font-semibold text-foreground mb-2">Suggested Actions/Phrases</h3>
           <CardDescription>
             <ul className="list-disc pl-5 space-y-1">
               <li>Example: "Say: Am I being detained or am I free to go?"</li>
               {/* Add more suggestions based on analysis output */}
             {/*</ul>
           </CardDescription>
         </div>
         */}
      </CardContent>
    </Card>
  );
}
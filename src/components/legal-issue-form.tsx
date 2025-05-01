// src/components/legal-issue-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Update imports for types/schema previously in actions.ts
import type { LegalIssueFormInput, ActionResponse } from "@/app/types";
import { legalIssueSchema } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";


interface LegalIssueFormProps {
  onSubmit: (data: LegalIssueFormInput) => Promise<ActionResponse>;
  isSubmitting: boolean;
}

export function LegalIssueForm({ onSubmit, isSubmitting }: LegalIssueFormProps) {
  const form = useForm<LegalIssueFormInput>({
    resolver: zodResolver(legalIssueSchema),
    defaultValues: {
      scenario: "", // Updated default value name
      keywords: "",
    },
  });

  async function processSubmit(data: LegalIssueFormInput) {
    await onSubmit(data);
    // Optionally reset form after successful submission
    // form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="scenario" // Updated field name
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe the scenario</FormLabel> {/* Updated label */}
              <FormControl>
                <Textarea
                  placeholder="Example: The police stopped me and asked to see my phone..."
                  className="min-h-[100px] resize-y"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide as much detail as possible about what happened.
              </FormDescription> {/* Updated description */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input
                  placeholder="Example: phone, search, warrant, traffic stop"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List comma-separated keywords relevant to the scenario.
              </FormDescription> {/* Updated description */}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze My Situation" // Updated button text
          )}
        </Button>
      </form>
    </Form>
  );
}

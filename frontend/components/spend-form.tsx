"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/frontend/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export const toolSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  tier: z.string().min(1, "Tier is required"),
  users: z.number().min(1, "Must have at least 1 user"),
  monthlySpend: z.number().min(0, "Spend cannot be negative")
});

export const formSchema = z.object({
  teamSize: z.number().min(1, "Team size must be at least 1"),
  tools: z.array(toolSchema)
});

export type FormValues = z.infer<typeof formSchema>;

const PREDEFINED_TOOLS = [
  "Cursor", "Copilot", "Claude", "ChatGPT", "APIs", "Gemini", "Windsurf/v0", "Other"
];

export function SpendForm() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamSize: 1,
      tools: [{ name: "Cursor", tier: "Pro", users: 1, monthlySpend: 20 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tools"
  });

  const onSubmit = (data: FormValues) => {
    console.log("Audit Results payload:", data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>AI Spend Audit Form</CardTitle>
        <CardDescription>Enter your team size and current AI tools to discover savings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" id="spend-form">
          {/* Team Size */}
          <div className="space-y-2">
            <label htmlFor="teamSize" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Total Team Size
            </label>
            <Input 
              id="teamSize"
              type="number" 
              {...register("teamSize", { valueAsNumber: true })} 
              aria-invalid={!!errors.teamSize}
            />
            {errors.teamSize && <p className="text-sm text-red-500" role="alert">{errors.teamSize.message}</p>}
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your AI Stack</h3>
            <div className="grid grid-cols-1 gap-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="space-y-2">
                      <label htmlFor={`tools.${index}.name`} className="text-sm font-medium">Tool Name</label>
                      <select
                        id={`tools.${index}.name`}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register(`tools.${index}.name` as const)}
                      >
                        {PREDEFINED_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.tools?.[index]?.name && <p className="text-sm text-red-500" role="alert">{errors.tools[index]?.name?.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`tools.${index}.tier`} className="text-sm font-medium">Plan Tier</label>
                      <Input 
                        id={`tools.${index}.tier`}
                        placeholder="e.g. Pro, Business"
                        {...register(`tools.${index}.tier` as const)}
                      />
                      {errors.tools?.[index]?.tier && <p className="text-sm text-red-500" role="alert">{errors.tools[index]?.tier?.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`tools.${index}.users`} className="text-sm font-medium">Seats / Users</label>
                      <Input 
                        id={`tools.${index}.users`}
                        type="number"
                        {...register(`tools.${index}.users` as const, { valueAsNumber: true })}
                      />
                      {errors.tools?.[index]?.users && <p className="text-sm text-red-500" role="alert">{errors.tools[index]?.users?.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`tools.${index}.monthlySpend`} className="text-sm font-medium">Monthly Spend ($)</label>
                      <div className="flex gap-2 items-start">
                        <Input 
                          id={`tools.${index}.monthlySpend`}
                          type="number"
                          {...register(`tools.${index}.monthlySpend` as const, { valueAsNumber: true })}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 mt-0 flex-shrink-0 hover:text-red-700 hover:bg-red-50"
                          onClick={() => remove(index)}
                          aria-label={`Remove tool ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.tools?.[index]?.monthlySpend && <p className="text-sm text-red-500" role="alert">{errors.tools[index]?.monthlySpend?.message}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => append({ name: "ChatGPT", tier: "Plus", users: 1, monthlySpend: 20 })}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Tool
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-6">
        <Button type="submit" form="spend-form" size="lg" className="w-full md:w-auto">
          Calculate Potential Savings
        </Button>
      </CardFooter>
    </Card>
  );
}

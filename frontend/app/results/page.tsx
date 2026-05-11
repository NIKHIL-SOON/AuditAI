"use client";

import React, { useEffect, useState } from "react";
import { useLocalStorage } from "@/frontend/hooks/use-local-storage";
import { evaluateSpend, AuditResult } from "@/backend/api/audit-engine";
import { getAiSummaryAction, captureLeadAction } from "@/frontend/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { ArrowLeft, TrendingDown, Check, Copy } from "lucide-react";
import Link from "next/link";
import { FormValues } from "@/frontend/components/spend-form";

export default function ResultsPage() {
  const [savedData] = useLocalStorage<FormValues | null>("audit-form-state", null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string>("Analyzing your AI stack...");

  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const handleCaptureLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setIsSubmitting(true);
    
    try {
      const res = await captureLeadAction(email, honeypot, result);
      if (res.success) {
        setSuccessId(res.id!);
        console.log("Lead saved successfully:", res.id);
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (savedData) {
      const res = evaluateSpend({
        useCase: savedData.useCase,
        teamSize: savedData.teamSize,
        tools: savedData.tools
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(res);

      // Fetch AI summary
      getAiSummaryAction(res)
        .then(text => setSummary(text))
        .catch(() => setSummary("Failed to generate summary."));
    }
  }, [savedData]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <p className="text-xl text-gray-500 animate-pulse" role="status">Loading your audit results...</p>
      </div>
    );
  }

  const isOptimal = result.recommendations.length === 0;
  const isLean = result.monthlySavings < 100;

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header / Back Link */}
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit Form
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {isLean ? "Your stack is looking lean! 🚀" : "Your Audit Results"}
          </h1>
          {isOptimal ? (
            <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200 inline-block">
              <h2 className="text-3xl font-bold text-green-700">Already Optimal ✨</h2>
              <p className="text-green-600 mt-2">You are not wasting any money on redundant tools.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
              <Card className="bg-white border-2 border-indigo-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingDown className="w-24 h-24 text-indigo-500" />
                </div>
                <CardHeader>
                  <CardDescription className="text-lg font-medium text-gray-500">Total Monthly Savings</CardDescription>
                  <CardTitle className="text-6xl font-black text-indigo-600">${result.monthlySavings}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl relative overflow-hidden">
                <CardHeader>
                  <CardDescription className="text-lg font-medium text-indigo-100">Annual Projection</CardDescription>
                  <CardTitle className="text-6xl font-black">${result.annualSavings}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>

        {/* AI Summary Section */}
        <Card className="shadow-md border-t-4 border-t-indigo-500 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-gray-700">{summary}</p>
          </CardContent>
        </Card>

        {/* Action Breakdown */}
        <div className="space-y-6 pt-6">
          <h3 className="text-2xl font-bold text-gray-900">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.recommendations.map((rec, idx) => {
              const isSavings = rec.savings > 0;
              return (
                <Card key={idx} className={`shadow-sm border-l-4 ${isSavings ? 'border-l-green-500 bg-white' : 'border-l-gray-300 bg-gray-50'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-gray-900">{rec.toolName}</CardTitle>
                      {isSavings ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                          Saves ${rec.savings}/mo
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800">
                          Optimal
                        </span>
                      )}
                    </div>
                    <CardDescription className="font-semibold text-gray-800 text-base">{rec.action}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{rec.rationale}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Credex CTA */}
        {result.monthlySavings > 500 && (
          <div className="mt-12 bg-indigo-900 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-extrabold text-white">Unlock Enterprise Savings</h2>
              <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                You&apos;re losing over $500/mo to inefficient tool sprawl. Book a free consultation with a Credex expert to restructure your enterprise stack.
              </p>
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-gray-100 text-lg px-8 py-6 font-bold rounded-xl shadow-lg">
                Book Credex Consultation
              </Button>
            </div>
          </div>
        )}

        {/* Lead Capture Form */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
          {successId ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Share your Audit</h3>
              <p className="text-gray-600 mb-6">Your results have been saved securely. Share this public link with your team:</p>
              <div className="flex items-center gap-2 max-w-md mx-auto">
                <Input 
                  readOnly 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${successId}`} 
                  className="w-full text-base bg-gray-50 text-gray-700"
                />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/${successId}`);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {isLean ? "Notify me of new optimizations" : "Email me these results"}
              </h3>
              <form onSubmit={handleCaptureLead} className="max-w-md mx-auto space-y-4">
                <input 
                  type="text" 
                  name="honeypot" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  className="hidden" 
                  tabIndex={-1} 
                  autoComplete="off" 
                />
                <Input 
                  type="email" 
                  required 
                  placeholder="you@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full text-lg p-6"
                />
                <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
                  {isSubmitting ? "Sending..." : (isLean ? "Notify Me" : "Send My Audit Report")}
                </Button>
              </form>
            </>
          )}
        </div>

      </div>
    </main>
  );
}

import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Recommendation } from '@/backend/api/audit-engine';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from('audit_leads')
    .select('monthly_savings')
    .eq('id', id)
    .single();

  const savings = data?.monthly_savings || 0;

  return {
    title: `I saved $${savings}/mo on AI tools!`,
    description: `Check out my AI Spend Audit results.`,
    openGraph: {
      title: `I saved $${savings}/mo on AI tools!`,
      description: `Check out my AI Spend Audit results and see how you can save too.`,
    }
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  
  const { data, error } = await supabase
    .from('audit_leads')
    .select('audit_data, monthly_savings')
    .eq('id', id)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <p className="text-xl text-gray-500">Audit not found or link is invalid.</p>
      </div>
    );
  }

  const auditData = data.audit_data;
  const isOptimal = auditData.monthlySavings === 0;

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            AI Spend Audit Results
          </h1>
          {isOptimal ? (
            <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200 inline-block">
              <h2 className="text-3xl font-bold text-green-700">Fully Optimized ✨</h2>
              <p className="text-green-600 mt-2">This team is running a highly efficient AI tool stack.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mt-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-xl">
                <p className="text-lg font-medium text-gray-500 mb-2">Total Monthly Savings</p>
                <p className="text-5xl font-black text-indigo-600">${auditData.monthlySavings}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-lg font-medium text-indigo-100 mb-2">Annual Projection</p>
                <p className="text-5xl font-black">${auditData.annualSavings}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Breakdown */}
        <div className="space-y-6 pt-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auditData.recommendations.map((rec: Recommendation, idx: number) => {
              const isSavings = rec.savings > 0;
              return (
                <div key={idx} className={`rounded-xl p-6 shadow-sm border-l-4 ${isSavings ? 'border-l-green-500 bg-white' : 'border-l-gray-300 bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-gray-900">{rec.toolName}</h4>
                    {isSavings ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        Saves ${rec.savings}/mo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-800">
                        Optimal
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mb-3 uppercase tracking-wide">{rec.action}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{rec.rationale}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action for Visitors */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to check your own AI spend?</h3>
          <p className="text-gray-600 mb-6">See if your team is wasting money on redundant or unused AI subscriptions.</p>
          <Link href="/" className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
            Run a Free Audit
          </Link>
        </div>

      </div>
    </main>
  );
}

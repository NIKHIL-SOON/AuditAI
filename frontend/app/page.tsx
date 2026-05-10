import { SpendForm } from "@/frontend/components/spend-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Audit Your AI Tool Spend
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Find overlapping tools, unused seats, and tier optimization opportunities in seconds.
        </p>
      </div>
      <SpendForm />
    </main>
  );
}

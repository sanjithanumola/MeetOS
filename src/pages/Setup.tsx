import React from 'react';
import { Database, Key, CheckCircle2, ExternalLink, RefreshCcw, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export default function Setup() {
  const steps = [
    {
      title: "Create a Supabase Project",
      description: "Go to supabase.com and create a free project. It takes less than a minute.",
      link: "https://supabase.com/dashboard",
      icon: Database
    },
    {
      title: "Get your API Keys",
      description: "Navigate to Project Settings > API and copy your Project URL and 'anon' public key.",
      icon: Key
    },
    {
      title: "Configure AI Studio Settings",
      description: "Click the gear icon in the bottom-left sidebar of AI Studio and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      icon: CheckCircle2
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] border border-neutral-200 p-12 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <Brain className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">Finalize Your Setup</h1>
          <p className="text-neutral-500 text-lg max-w-md font-medium">
            To start using Meet Os, you need to connect your Supabase database. Follow these simple steps:
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 p-6 bg-neutral-50 rounded-3xl border border-neutral-100 group hover:border-black/10 transition-all">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-neutral-200 shadow-sm shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                <step.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">{step.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-medium">{step.description}</p>
                {step.link && (
                  <a 
                    href={step.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-3 hover:underline"
                  >
                    Open Supabase Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mb-12">
          <h4 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-widest">Required Environment Variables:</h4>
          <div className="space-y-2">
            <code className="block text-xs font-mono text-blue-700 bg-white/50 p-2 rounded-lg">VITE_SUPABASE_URL</code>
            <code className="block text-xs font-mono text-blue-700 bg-white/50 p-2 rounded-lg">VITE_SUPABASE_ANON_KEY</code>
            <code className="block text-xs font-mono text-blue-700 bg-white/50 p-2 rounded-lg">GEMINI_API_KEY</code>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-black text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
        >
          <RefreshCcw className="w-5 h-5" />
          I've added the keys, reload app
        </button>
      </div>
    </div>
  );
}

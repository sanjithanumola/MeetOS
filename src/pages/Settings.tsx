import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Shield, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function Settings() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      if (window.aistudio) {
        const result = await window.aistudio.hasSelectedApiKey();
        setHasKey(result);
      }
    } catch (err) {
      console.error('Error checking API key:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success and update state
        setHasKey(true);
      }
    } catch (err) {
      console.error('Error opening key selector:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">System Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your API integrations and platform configuration.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Gemini API Section */}
        <section className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                <Cpu className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Gemini AI Engine</h2>
                <p className="text-sm text-neutral-500 font-medium">Primary engine for meeting analysis and chat.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex items-start gap-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="mt-1">
                {hasKey ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-neutral-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 mb-1">Custom API Key</h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                  By default, the platform uses a shared environment key. You can provide your own API key to increase rate limits and access premium features.
                </p>
                <button
                  onClick={handleSelectKey}
                  className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all shadow-md shadow-black/5"
                >
                  <Key className="w-4 h-4" />
                  {hasKey ? 'Change API Key' : 'Select API Key'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <Shield className="w-4 h-4" />
                <span>Keys are stored securely in your browser session.</span>
              </div>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-black font-bold flex items-center gap-1 hover:underline"
              >
                Billing Docs
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* OpenAI Section */}
        <section className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <Music className="text-neutral-400 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">OpenAI Whisper</h2>
                <p className="text-sm text-neutral-500 font-medium">High-fidelity audio transcription engine.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-500 rounded-full text-xs font-bold uppercase tracking-wider">
              Optional
            </div>
          </div>
          
          <div className="p-8">
            <div className="p-6 border border-neutral-100 rounded-2xl space-y-4">
              <h3 className="font-bold text-neutral-900">Integration Status</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                To enable OpenAI Whisper for superior audio-to-text conversion, you must add your API key to the platform environment variables.
              </p>
              
              <div className="bg-neutral-900 text-neutral-400 p-4 rounded-xl font-mono text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span>Variable Name:</span>
                  <span className="text-white">OPENAI_API_KEY</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Location:</span>
                  <span className="text-white">Settings &gt; Environment Variables</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-neutral-400 italic">
                  * If no OpenAI key is found, the system will automatically fallback to Gemini's transcription engine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Database Section */}
        <section className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <Database className="text-neutral-400 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Supabase Infrastructure</h2>
                <p className="text-sm text-neutral-500 font-medium">Cloud database and authentication provider.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
              Connected
            </div>
          </div>
          
          <div className="p-8">
            <p className="text-sm text-neutral-500 leading-relaxed">
              The application is currently connected to your Supabase project. All meeting data, transcripts, and analysis are stored securely in your private database.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Music({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

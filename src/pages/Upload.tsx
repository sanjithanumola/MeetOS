import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload as UploadIcon, 
  FileText, 
  Music, 
  Video, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { transcribeAudio, analyzeTranscript } from '../lib/gemini';
import axios from 'axios';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select, 2: Details, 3: Processing
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep(2);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov'],
    },
    multiple: false
  } as any);

  const handleProcess = async () => {
    setUploading(true);
    setStep(3);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let finalTranscript = transcript;
      if (file) {
        finalTranscript = await transcribeAudio(file);
      }

      if (!finalTranscript) {
        throw new Error('Could not generate transcript');
      }

      const analysis = await analyzeTranscript(finalTranscript);

      const response = await axios.post('/api/meetings/save', {
        userId: user.id,
        title: title || (file ? file.name : 'Pasted Transcript'),
        transcript: finalTranscript,
        analysis
      });

      navigate(`/meetings/${response.data.id}`);
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'An unexpected error occurred during processing');
      setStep(2);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">Process New Meeting</h1>
        <p className="text-neutral-500 text-lg">Upload audio, video, or paste a transcript to generate intelligence.</p>
      </div>

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute -top-6 left-0 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* File Upload */}
              <div 
                {...getRootProps()} 
                className={`group relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDragActive ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadIcon className="text-neutral-400 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Upload Media</h3>
                <p className="text-neutral-500 text-center text-sm">
                  Drag & drop audio or video files here<br />
                  <span className="text-xs font-medium text-neutral-400 mt-2 block">MP3, WAV, MP4, MOV (Max 25MB)</span>
                </p>
              </div>

              {/* Text Paste */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-8 flex flex-col shadow-sm">
                <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="text-neutral-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Paste Transcript</h3>
                <p className="text-neutral-500 text-sm mb-6">Already have the text? Paste it directly for instant analysis.</p>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here..."
                  className="flex-1 w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black/5 min-h-[200px] resize-none"
                />
                <button
                  disabled={!transcript.trim()}
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200 rounded-3xl p-10 shadow-xl max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  {file ? <Music className="text-white w-6 h-6" /> : <FileText className="text-white w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Meeting Details</h3>
                  <p className="text-neutral-500 text-sm">{file ? file.name : 'Transcript Ready'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Meeting Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Sync - Product Team"
                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="py-4 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcess}
                    className="bg-black text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-black/10"
                  >
                    Start Analysis
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-black/5 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-2xl">
                  <Brain className="text-white w-12 h-12 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">Analyzing Meeting Intelligence</h2>
              <p className="text-neutral-500 text-lg max-w-md mx-auto mb-12">
                Our AI is currently transcribing, summarizing, and extracting action items. This usually takes 30-60 seconds.
              </p>

              <div className="max-w-sm mx-auto space-y-4">
                {[
                  'Transcribing audio to text...',
                  'Identifying key discussion points...',
                  'Extracting action items and owners...',
                  'Performing sentiment analysis...'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold text-neutral-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

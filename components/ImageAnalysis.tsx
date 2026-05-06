import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Tag,
  FileText,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Target,
  DollarSign,
  Maximize2,
} from 'lucide-react';
import { analyzeProductImage } from '../services/llmService';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  description: string;
  condition: string;
  keywords: string[];
  suggestedTitle: string;
  suggestedPrice: string;
  category: string;
  raw: string;
}

const ImageAnalysis: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rawMode, setRawMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const base64 = preview.split(',')[1];
      const rawResult = await analyzeProductImage(base64);
      const parsed = parseAnalysisResult(rawResult);
      setResult(parsed);
    } catch (_err) {
      setResult({
        description: 'Analysis failed. Please try again.',
        condition: 'Unknown',
        keywords: [],
        suggestedTitle: '',
        suggestedPrice: '',
        category: '',
        raw: 'Error analyzing image.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const parseAnalysisResult = (raw: string): AnalysisResult => {
    const conditionMatch = raw.match(/condition[:\s]*([^\n.]+)/i);
    const keywordMatch = raw.match(/keyword[s]?[:\s]*([^\n]+)/i);
    const titleMatch = raw.match(/(?:suggested?\s*)?title[:\s]*([^\n]+)/i);
    const priceMatch = raw.match(/(?:suggested?\s*)?price[:\s]*([^\n]+)/i);
    const categoryMatch = raw.match(/categor[y]?[:\s]*([^\n]+)/i);

    const keywords = keywordMatch
      ? keywordMatch[1]
          .split(/[,;]/)
          .map((k) => k.trim())
          .filter(Boolean)
          .slice(0, 6)
      : [];

    return {
      description: raw.split('\n').filter((l) => l.trim().length > 20)[0] || raw.slice(0, 200),
      condition: conditionMatch?.[1]?.trim() || 'Good',
      keywords,
      suggestedTitle: titleMatch?.[1]?.trim() || '',
      suggestedPrice: priceMatch?.[1]?.trim() || '',
      category: categoryMatch?.[1]?.trim() || '',
      raw,
    };
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setRawMode(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vision Intelligence</h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">Extracting listing DNA from product imagery.</p>
        </div>
        <div className="ios-glass px-5 py-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5 shadow-sm">
          <Target className="w-5 h-5 text-ios-blue" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Precision Analysis Engine</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-6">
          <motion.div
            layout
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`ios-card !p-0 relative min-h-[450px] flex flex-col items-center justify-center cursor-pointer transition-all border-none overflow-hidden ${
              preview ? 'ring-4 ring-ios-blue/10' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {preview ? (
              <div className="absolute inset-0 group">
                <img
                  src={preview}
                  alt="Product preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="ios-glass p-4 rounded-full text-white shadow-2xl">
                    <Maximize2 className="w-8 h-8" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 ios-glass px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest border-white/20">
                  Tap to replace
                </div>
              </div>
            ) : (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-ios-blue/10 rounded-[2.5rem] flex items-center justify-center mb-8 animate-pulse">
                  <Upload className="w-10 h-10 text-ios-blue" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Drop Listing Media</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-xs mb-8">
                  Upload a clear product image to initialize the autonomous synthesis engine.
                </p>
                <div className="flex gap-2">
                  {['JPG', 'PNG', 'HEIC'].map(fmt => (
                    <span key={fmt} className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-black/5 dark:border-white/5">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {preview && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1 ios-btn-primary py-4 shadow-xl shadow-ios-blue/20"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-3" /> Processing DNA...
                    </>
                  ) : (
                    <>
                      Synthesize Listing <Sparkles className="w-5 h-5 ml-3" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="p-4 bg-slate-100 dark:bg-zinc-800 text-slate-400 rounded-[1.5rem] hover:text-ios-red transition-all"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Panel */}
        <div className="ios-card !p-0 overflow-hidden flex flex-col h-full border-none">
          <div className="ios-glass p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between z-10 relative">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Synthesis Report</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setRawMode(!rawMode)}
                className={`p-2 rounded-xl transition-all ${rawMode ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20' : 'bg-black/5 text-slate-400 hover:text-slate-600'}`}
                title="View Raw Analysis"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 bg-black/5 text-slate-400 hover:text-ios-blue rounded-xl transition-all"
                title="Copy Report"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
            {!result && !analyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400 opacity-50">
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="font-bold uppercase text-[10px] tracking-widest">Awaiting Media Payload</p>
              </div>
            ) : analyzing ? (
              <div className="h-full flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-24 h-24 bg-ios-blue/10 rounded-full flex items-center justify-center animate-pulse">
                    <Zap className="w-10 h-10 text-ios-blue" />
                  </div>
                  <div className="absolute inset-0 border-4 border-ios-blue border-t-transparent rounded-full animate-spin" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-8 tracking-tight">Extracting Features</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-2">Running convolutional neural network audit...</p>
              </div>
            ) : result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {rawMode ? (
                  <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-6 text-sm text-slate-700 dark:text-zinc-300 font-mono whitespace-pre-wrap border border-black/5 dark:border-white/5 shadow-inner leading-relaxed">
                    {result.raw}
                  </div>
                ) : (
                  <>
                    <div className="ios-glass p-6 rounded-[2rem] border border-ios-blue/20 bg-ios-blue/5">
                      <h4 className="text-[10px] font-black text-ios-blue uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Synthesis Overview
                      </h4>
                      <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 leading-relaxed italic">&quot;{result.description}&quot;</p>
                    </div>

                    <div className="grid gap-4">
                      {result.suggestedTitle && (
                        <div className="bg-slate-50 dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Optimized Product Title</label>
                          <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{result.suggestedTitle}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Condition Audit</label>
                          <p className="text-sm font-black text-ios-green uppercase tracking-widest">{result.condition}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Taxonomy Hub</label>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{result.category}</p>
                        </div>
                      </div>

                      {result.suggestedPrice && (
                        <div className="bg-ios-green/5 p-5 rounded-[1.5rem] border border-ios-green/20">
                          <label className="text-[9px] font-black text-ios-green uppercase tracking-widest block mb-1">Valuation Anchor</label>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-ios-green" />
                            <p className="text-2xl font-black text-ios-green tracking-tighter">{result.suggestedPrice}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {result.keywords.length > 0 && (
                      <div className="pt-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Tag className="w-4 h-4" /> SEO DNA Clusters
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-[11px] font-bold border border-black/5 dark:border-white/5 shadow-sm"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;

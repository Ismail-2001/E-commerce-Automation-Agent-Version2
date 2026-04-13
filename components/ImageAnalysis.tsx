import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Loader2, Image, Tag, Search, FileText, RotateCcw, Copy, Check } from 'lucide-react';
import { analyzeProductImage } from '../services/geminiService';

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
      // Extract base64 data (remove data:image/xxx;base64, prefix)
      const base64 = preview.split(',')[1];
      const rawResult = await analyzeProductImage(base64);

      // Parse AI response into structured data
      const parsed = parseAnalysisResult(rawResult);
      setResult(parsed);
    } catch (err) {
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
    // Try to extract structured info from the AI response
    const lines = raw.toLowerCase();

    const conditionMatch = raw.match(/condition[:\s]*([^\n.]+)/i);
    const keywordMatch = raw.match(/keyword[s]?[:\s]*([^\n]+)/i);
    const titleMatch = raw.match(/(?:suggested?\s*)?title[:\s]*([^\n]+)/i);
    const priceMatch = raw.match(/(?:suggested?\s*)?price[:\s]*([^\n]+)/i);
    const categoryMatch = raw.match(/categor[y]?[:\s]*([^\n]+)/i);

    const keywords = keywordMatch
      ? keywordMatch[1].split(/[,;]/).map(k => k.trim()).filter(Boolean).slice(0, 6)
      : [];

    return {
      description: raw.split('\n').filter(l => l.trim().length > 20)[0] || raw.slice(0, 200),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Image Analysis</h1>
        <p className="text-gray-500">Upload a product photo to get AI-powered listing suggestions, SEO keywords, and pricing hints.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all min-h-[400px] flex flex-col items-center justify-center ${
              preview
                ? 'border-indigo-200 bg-indigo-50/30'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/20 bg-gray-50'
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
              <div className="space-y-4 w-full">
                <img
                  src={preview}
                  alt="Product preview"
                  className="max-h-72 mx-auto rounded-xl shadow-lg object-contain"
                />
                <p className="text-sm text-gray-500">Click to replace image</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Drop your product photo here</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Upload a clear product image (JPG, PNG, WebP) and let AI generate listing details
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500">JPG</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500">PNG</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500">WebP</span>
                </div>
              </>
            )}
          </div>

          {preview && (
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
              >
                {analyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Analyze with AI</>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {!result && !analyzing ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <Image className="w-16 h-16 mb-4 text-indigo-100" />
              <p className="font-medium">Upload and analyze a product image<br />to see AI-generated listing details</p>
            </div>
          ) : analyzing ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing product image...</p>
              <p className="text-gray-400 text-sm mt-1">Extracting features, condition, and SEO keywords</p>
            </div>
          ) : result ? (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">AI Analysis Results</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRawMode(!rawMode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${rawMode ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Raw
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 inline mr-1" /> : <Copy className="w-3.5 h-3.5 inline mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {rawMode ? (
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-[400px] overflow-y-auto border border-slate-200">
                  {result.raw}
                </div>
              ) : (
                <>
                  {/* Description */}
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Description
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed">{result.description}</p>
                  </div>

                  {/* Structured Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    {result.suggestedTitle && (
                      <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                        <span className="text-xs font-bold text-gray-400 uppercase">Suggested Title</span>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{result.suggestedTitle}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">Condition</span>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{result.condition}</p>
                    </div>
                    {result.category && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-xs font-bold text-gray-400 uppercase">Category</span>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{result.category}</p>
                      </div>
                    )}
                    {result.suggestedPrice && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <span className="text-xs font-bold text-green-600 uppercase">Suggested Price</span>
                        <p className="text-sm font-bold text-green-800 mt-0.5">{result.suggestedPrice}</p>
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  {result.keywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> SEO Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;

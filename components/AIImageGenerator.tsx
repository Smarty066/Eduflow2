'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Sparkles, Loader2, Download, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { generateStudyImage } from '@/lib/gemini';

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const url = await generateStudyImage(prompt, size);
      setImageUrl(url);
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 rounded-[2.5rem] border-slate-100 shadow-xl shadow-indigo-50/50">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-50 p-2.5 rounded-2xl">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">AI Study Visualizer</h3>
          <p className="text-sm text-slate-500">Generate high-quality diagrams and illustrations for your handouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Prompt</label>
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A detailed diagram of a plant cell with labels"
              className="rounded-2xl h-14 border-slate-200 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resolution</label>
            <div className="flex gap-2">
              {(['1K', '2K', '4K'] as const).map((s) => (
                <Button
                  key={s}
                  variant={size === s ? 'default' : 'outline'}
                  onClick={() => setSize(s)}
                  className={`flex-1 rounded-xl h-12 font-bold ${size === s ? 'bg-indigo-600' : 'text-slate-600'}`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 mr-2" />
                Generate Visual
              </>
            )}
          </Button>
        </div>

        <div className="relative aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Generated Visual" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                <Button variant="secondary" className="rounded-xl font-bold" onClick={() => window.open(imageUrl)}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="secondary" className="rounded-xl font-bold" onClick={handleGenerate}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-medium">Your generated visual will appear here.</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-indigo-600 font-bold animate-pulse">Gemini is painting...</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { analyzeImage } from '@/lib/gemini';

interface UploadHandoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  adminId: string;
}

export default function UploadHandoutModal({ isOpen, onClose, classroomId, adminId }: UploadHandoutModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Success

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStep(2);

    try {
      // 1. Convert file to base64 for Gemini
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      // 2. Analyze Image with Gemini (OCR)
      const extractedText = await analyzeImage(base64);

      // 3. Save Handout to Firestore
      const handoutId = Math.random().toString(36).substring(2, 15);
      const handoutRef = doc(db, 'classrooms', classroomId, 'handouts', handoutId);
      
      await setDoc(handoutRef, {
        id: handoutId,
        classroomId,
        title,
        category,
        description: '',
        fileUrl: 'https://picsum.photos/seed/handout/800/1200', // Placeholder for actual storage
        coverUrl: 'https://picsum.photos/seed/cover/400/600',
        status: 'published',
        uploadedBy: adminId,
        createdAt: serverTimestamp(),
        totalPages: 1,
      });

      // 4. Save Page 1
      await setDoc(doc(db, 'classrooms', classroomId, 'handouts', handoutId, 'pages', '1'), {
        handoutId,
        pageNumber: 1,
        imageUrl: 'https://picsum.photos/seed/page1/800/1200',
        text: extractedText,
      });

      setStep(3);
      setTimeout(() => {
        onClose();
        setStep(1);
        setFile(null);
        setTitle('');
        setCategory('');
      }, 2000);
    } catch (error) {
      console.error("Error uploading handout:", error);
      alert("Failed to process handout. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-900">Upload Handout</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {step === 1 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div 
                    className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                      file ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="handout-file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="handout-file" className="cursor-pointer flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                        file ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-slate-900">
                        {file ? file.name : 'Click to upload handout image'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Handout Title</label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Introduction to Algorithms"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <input 
                        type="text" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Process Handout
                  </button>
                </form>
              )}

              {step === 2 && (
                <div className="py-12 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">AI is Processing...</h3>
                  <p className="text-slate-500">Extracting text and generating preview. This may take a few seconds.</p>
                </div>
              )}

              {step === 3 && (
                <div className="py-12 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Handout Published!</h3>
                  <p className="text-slate-500">Your handout is now available to all students.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

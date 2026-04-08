'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/FirebaseProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Mic, 
  Image as ImageIcon, 
  FileText,
  Play,
  Pause,
  Maximize2,
  Bookmark,
  Share2,
  Settings,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateSummary } from '@/lib/gemini';

export default function HandoutReader() {
  const { id } = useParams();
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [handout, setHandout] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('preview'); // preview, read, scan, audio, summary
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Reset zoom when page changes
    setZoomLevel(1);
  }, [currentPage]);

  useEffect(() => {
    if (id && userData?.classroomId) {
      const fetchHandout = async () => {
        const hDoc = await getDoc(doc(db, 'classrooms', userData.classroomId, 'handouts', id as string));
        if (hDoc.exists()) {
          setHandout({ id: hDoc.id, ...hDoc.data() });
          
          const qPages = query(
            collection(db, 'classrooms', userData.classroomId, 'handouts', id as string, 'pages'),
            orderBy('pageNumber', 'asc')
          );
          
          const unsubPages = onSnapshot(qPages, (snapshot) => {
            setPages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
          });

          return () => unsubPages();
        } else {
          router.push('/student');
        }
      };
      fetchHandout();
    }
  }, [id, userData, router]);

  useEffect(() => {
    if (id && user?.uid && !isProgressLoaded) {
      const fetchProgress = async () => {
        const pDoc = await getDoc(doc(db, 'users', user.uid, 'progress', id as string));
        if (pDoc.exists()) {
          setCurrentPage(pDoc.data().lastPage || 0);
        }
        setIsProgressLoaded(true);
      };
      fetchProgress();
    }
  }, [id, user, isProgressLoaded]);

  useEffect(() => {
    if (id && user?.uid && isProgressLoaded && pages.length > 0) {
      const saveProgress = async () => {
        await setDoc(doc(db, 'users', user.uid, 'progress', id as string), {
          lastPage: currentPage,
          totalWeight: pages.length,
          progressPercentage: Math.round(((currentPage + 1) / pages.length) * 100),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      };
      saveProgress();
    }
  }, [currentPage, id, user, isProgressLoaded, pages.length]);

  const handleSummarize = async () => {
    if (!pages[currentPage]?.text) return;
    setIsSummarizing(true);
    try {
      const result = await generateSummary(pages[currentPage].text);
      setSummary(result);
    } catch (error) {
      console.error("Error summarizing:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.5, prev + delta), 3));
  };

  if (loading || authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-500 font-medium">Opening your handout...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Reader Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="hidden md:block">
            <h1 className="font-bold text-slate-900 line-clamp-1">{handout?.title}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Page {currentPage + 1} of {pages.length || 1}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-600"><Bookmark className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-600"><Share2 className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-600"><Settings className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Progress Bar */}
      <div 
        className="h-1.5 bg-slate-100 w-full overflow-hidden cursor-pointer hover:h-2 transition-all group relative"
        onClick={(e) => {
          if (pages.length === 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          const targetPage = Math.floor(percentage * pages.length);
          setCurrentPage(Math.min(pages.length - 1, Math.max(0, targetPage)));
        }}
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
          className="h-full bg-indigo-600"
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        {/* Navigation Tabs (Mobile Bottom, Desktop Left) */}
        <div className="md:w-20 bg-white border-r border-slate-200 flex md:flex-col items-center justify-around md:justify-center gap-4 p-4 order-last md:order-first z-10">
          {[
            { id: 'preview', icon: ImageIcon, label: 'Cover' },
            { id: 'read', icon: FileText, label: 'Read' },
            { id: 'scan', icon: Maximize2, label: 'Scan' },
            { id: 'audio', icon: Mic, label: 'Audio' },
            { id: 'summary', icon: Sparkles, label: 'AI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === tab.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Floating Pagination Controls */}
        {activeTab !== 'preview' && (
          <>
            <button 
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className="absolute left-24 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-indigo-600 disabled:opacity-0 transition-all hidden md:flex"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              disabled={currentPage === pages.length - 1}
              onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-indigo-600 disabled:opacity-0 transition-all hidden md:flex"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Content Viewport */}
        <div className="flex-grow relative overflow-y-auto p-4 md:p-12 flex justify-center">
          {/* Page Indicator Overlay */}
          {activeTab !== 'preview' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Page {currentPage + 1} / {pages.length}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-2xl w-full"
              >
                <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-100 aspect-[3/4] flex flex-col">
                  <div className="flex-grow bg-slate-100 relative">
                    {handout?.coverUrl && <img src={handout.coverUrl} className="w-full h-full object-cover" alt="Cover" />}
                    <div className="absolute top-8 left-8">
                      <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest">
                        {handout?.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className="p-10 md:p-16 text-center">
                    <p className="text-indigo-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">Handout Index #001</p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">{handout?.title}</h2>
                    <p className="text-slate-500 text-lg mb-10 leading-relaxed">{handout?.description}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button onClick={() => setActiveTab('read')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        Start Reading
                      </button>
                      <button onClick={() => setActiveTab('audio')} className="bg-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                        Listen Audio
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'read' && (
              <motion.div
                key="read"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full bg-white p-8 md:p-16 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 min-h-full"
              >
                <div className="prose prose-slate max-w-none">
                  <h2 className="text-3xl font-display font-bold text-slate-900 mb-8">Page {currentPage + 1}</h2>
                  <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {pages[currentPage]?.text || "No text extracted for this page yet."}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl w-full flex flex-col items-center gap-6"
              >
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-30">
                  <button 
                    onClick={() => handleZoom(-0.2)} 
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-slate-600 px-2 min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    onClick={() => handleZoom(0.2)} 
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button 
                    onClick={() => setZoomLevel(1)} 
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full flex justify-center">
                  <motion.img 
                    src={pages[currentPage]?.imageUrl} 
                    animate={{ scale: zoomLevel }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full h-auto rounded-2xl origin-top" 
                    alt={`Page ${currentPage + 1}`} 
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
              >
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 text-center">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Mic className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Audio Reading</h3>
                  <p className="text-slate-500 mb-8">Listening to Page {currentPage + 1}</p>
                  
                  <div className="flex items-center justify-center gap-6 mb-10">
                    <button className="p-4 text-slate-400 hover:text-indigo-600 transition-all"><ChevronLeft className="w-8 h-8" /></button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                    </button>
                    <button className="p-4 text-slate-400 hover:text-indigo-600 transition-all"><ChevronRight className="w-8 h-8" /></button>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-full" 
                      animate={{ width: isPlaying ? '100%' : '30%' }}
                      transition={{ duration: 30, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl w-full"
              >
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-indigo-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2.5 rounded-2xl">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">AI Summary</h3>
                    </div>
                    {!summary && !isSummarizing && (
                      <button 
                        onClick={handleSummarize}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all"
                      >
                        Generate
                      </button>
                    )}
                  </div>

                  {isSummarizing ? (
                    <div className="py-20 text-center">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">AI is analyzing your handout...</p>
                    </div>
                  ) : summary ? (
                    <div className="prose prose-indigo max-w-none">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium px-8">Get a concise summary, key points, and exam focus areas instantly.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reader Footer (Navigation) */}
      <footer className="bg-white border-t border-slate-200 h-20 flex items-center justify-between px-4 md:px-12">
        <button 
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          className="flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-6 h-6" /> <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex-grow max-w-md mx-8">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300" 
              style={{ width: `${((currentPage + 1) / (pages.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        <button 
          disabled={currentPage === pages.length - 1}
          onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
          className="flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 disabled:opacity-30 transition-all"
        >
          <span className="hidden sm:inline">Next</span> <ChevronRight className="w-6 h-6" />
        </button>
      </footer>
    </div>
  );
}

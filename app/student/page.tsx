'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users,
  Video, 
  Settings, 
  LogOut, 
  Search,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [classroom, setClassroom] = useState<any>(null);
  const [handouts, setHandouts] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'student')) {
      if (userData?.role === 'admin') router.push('/admin');
      else if (userData?.role === 'rep') router.push('/rep');
      else if (!user) router.push('/login');
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (userData?.classroomId) {
      const unsubClass = onSnapshot(doc(db, 'classrooms', userData.classroomId), (doc) => {
        setClassroom(doc.data());
      });

      const qHandouts = query(collection(db, 'classrooms', userData.classroomId, 'handouts'));
      const unsubHandouts = onSnapshot(qHandouts, (snapshot) => {
        setHandouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      const qLive = query(collection(db, 'classrooms', userData.classroomId, 'live_classes'));
      const unsubLive = onSnapshot(qLive, (snapshot) => {
        setLiveClasses(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubClass();
        unsubHandouts();
        unsubLive();
      };
    }
  }, [userData]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const filteredHandouts = handouts.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">EduFlow</span>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'handouts', icon: FileText, label: 'Handouts' },
            { id: 'live', icon: Video, label: 'Live Classes' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'profile', icon: Users, label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              {activeTab === 'overview' ? `Welcome, ${userData?.fullName.split(' ')[0]}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-slate-500 text-sm">{classroom?.name} • {classroom?.schoolName}</p>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Handouts Grid */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Latest Handouts</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{handouts.length} Total</span>
                  </div>

                  {handouts.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
                      <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No handouts available yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {handouts.slice(0, 4).map((handout) => (
                        <motion.div
                          key={handout.id}
                          whileHover={{ y: -5 }}
                          className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                        >
                          <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                            {handout.coverUrl ? (
                              <img src={handout.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={handout.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-12 h-12 text-slate-200" />
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-indigo-600 uppercase">
                                {handout.category || 'General'}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{handout.title}</h4>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(handout.createdAt?.toDate()).toLocaleDateString()}</span>
                              <span>{handout.totalPages || 0} Pages</span>
                            </div>
                            <Link 
                              href={`/reader/${handout.id}`}
                              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                              Read Now <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Live Classes & AI Tools */}
              <div className="space-y-8">
                {/* Live Classes */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-600" /> Live Classes
                  </h3>
                  
                  {liveClasses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm font-medium">No live classes scheduled.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {liveClasses.map((session) => (
                        <div key={session.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-1">{session.title}</h4>
                          <p className="text-xs text-slate-500 mb-4">{new Date(session.startTime?.toDate()).toLocaleString()}</p>
                          <a 
                            href={session.meetingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                          >
                            Join Session <Play className="w-3 h-3 fill-current" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Quick Tools */}
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                  <Sparkles className="w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-2">AI Learning Tools</h3>
                  <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                    Use Gemini to summarize handouts, generate revision notes, and explain complex topics.
                  </p>
                  <button className="w-full bg-white/20 backdrop-blur-md text-white py-3 rounded-2xl font-bold hover:bg-white/30 transition-all border border-white/30">
                    Explore AI Tools
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'handouts' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search handouts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHandouts.map((handout) => (
                <div key={handout.id} className="group relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {handout.coverUrl ? (
                      <img src={handout.coverUrl} alt={handout.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-indigo-600 uppercase">
                        {handout.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{handout.title}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{handout.description || 'No description provided.'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{handout.totalPages || 0} Pages</span>
                      <Link href={`/reader/${handout.id}`} className="text-indigo-600 font-bold text-sm hover:underline">Read Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Upcoming Live Classes</h2>
            
            {liveClasses.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <Video className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No live classes scheduled.</p>
                <p className="text-slate-400 text-xs mt-1">Check back later for upcoming sessions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveClasses.map((session) => (
                  <div key={session.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{session.title}</h4>
                    <p className="text-sm text-slate-500 mb-6">{new Date(session.startTime?.toDate()).toLocaleString()}</p>
                    <a 
                      href={session.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      Join Session <Play className="w-4 h-4 fill-current" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-indigo-600">{userData?.fullName.charAt(0)}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{userData?.fullName}</h2>
                <p className="text-slate-500">{userData?.email}</p>
                <span className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {userData?.role}
                </span>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Classroom</label>
                  <p className="font-bold text-slate-900">{classroom?.name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">School</label>
                  <p className="font-bold text-slate-900">{classroom?.schoolName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Member Since</label>
                  <p className="font-bold text-slate-900">{new Date(userData?.createdAt?.toDate()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

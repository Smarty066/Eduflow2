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
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function RepDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [classroom, setClassroom] = useState<any>(null);
  const [handouts, setHandouts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'rep')) {
      if (userData?.role === 'admin') router.push('/admin');
      else if (userData?.role === 'student') router.push('/student');
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

      const qMembers = query(collection(db, 'users'), where('classroomId', '==', userData.classroomId));
      const unsubMembers = onSnapshot(qMembers, (snapshot) => {
        setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubClass();
        unsubHandouts();
        unsubMembers();
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
            { id: 'students', icon: Users, label: 'Students' },
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

        {userData?.status === 'pending' && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-4">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Account Pending Approval</h3>
              <p className="text-amber-700 text-sm">Your Class Representative access is currently being reviewed by the Admin. Some features may be restricted.</p>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Students', value: members.filter(m => m.role === 'student').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Handouts', value: handouts.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Class Status', value: classroom?.status || 'Active', icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bg} p-2.5 rounded-2xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-3xl font-display font-bold text-slate-900 mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Recent Handouts */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Handouts</h2>
                <button 
                  onClick={() => setActiveTab('handouts')}
                  className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  View all <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              {handouts.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No handouts available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {handouts.slice(0, 5).map((handout) => (
                    <div key={handout.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-2.5 rounded-xl group-hover:bg-white transition-all">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{handout.title}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(handout.createdAt?.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          handout.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {handout.status}
                        </span>
                        <Link href={`/reader/${handout.id}`} className="text-indigo-600 font-bold text-sm hover:underline">View</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

        {activeTab === 'students' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Classroom Students</h2>
            <div className="space-y-4">
              {members.filter(m => m.role === 'student').map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{member.fullName}</h4>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Upcoming Live Classes</h2>
            
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <Video className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No live classes scheduled.</p>
              <p className="text-slate-400 text-xs mt-1">Check back later for upcoming sessions.</p>
            </div>
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

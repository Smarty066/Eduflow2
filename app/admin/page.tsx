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
  Plus, 
  Copy, 
  Check, 
  MoreVertical,
  Search,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDocs, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import UploadHandoutModal from '@/components/UploadHandoutModal';

export default function AdminDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [classroom, setClassroom] = useState<any>(null);
  const [handouts, setHandouts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [allClassrooms, setAllClassrooms] = useState<any[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isDeveloper = user?.email?.toLowerCase() === 'faruqabiola629@gmail.com';

  useEffect(() => {
    if (!loading && (!user || (userData?.role !== 'admin' && !isDeveloper))) {
      router.push('/login');
    }
  }, [user, userData, loading, router, isDeveloper]);

  useEffect(() => {
    if (isDeveloper && activeTab === 'developer') {
      const unsubAllClassrooms = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
        setAllClassrooms(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      const qPending = query(collection(db, 'users'), where('role', '==', 'admin'), where('status', '==', 'pending'));
      const unsubPending = onSnapshot(qPending, (snapshot) => {
        setPendingAdmins(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubAllClassrooms();
        unsubPending();
      };
    }
  }, [isDeveloper, activeTab]);

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

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleApproveAdmin = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active'
      });
    } catch (error) {
      console.error("Error approving admin:", error);
      alert("Failed to approve admin. Check console for details.");
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (userData?.status === 'pending' && !isDeveloper) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Approval Pending</h2>
          <p className="text-slate-600 mb-8">
            Your administrator account is currently pending approval. Please wait for the developer to grant you access.
          </p>
          <button 
            onClick={() => signOut(auth)}
            className="text-indigo-600 font-bold hover:underline"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

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
            { id: 'students', icon: Users, label: 'Students & Reps' },
            { id: 'live', icon: Video, label: 'Live Classes' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'profile', icon: Users, label: 'Profile' },
            ...(isDeveloper ? [{ id: 'developer', icon: ShieldCheck, label: 'Developer' }] : []),
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
              {activeTab === 'overview' ? `Welcome, ${userData?.fullName}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-slate-500 text-sm">{classroom?.name} • {classroom?.schoolName}</p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Handout
          </button>
        </header>

        <UploadHandoutModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          classroomId={userData?.classroomId}
          adminId={user?.uid}
        />

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Students', value: members.filter(m => m.role === 'student').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Handouts', value: handouts.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Class Reps', value: members.filter(m => m.role === 'rep').length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bg} p-2.5 rounded-2xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-3xl font-display font-bold text-slate-900 mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Invite Links */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Classroom Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Student Invite Link</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                    <input 
                      readOnly 
                      value={`${window.location.origin}/join/student/${classroom?.studentInviteToken}`} 
                      className="flex-grow bg-transparent text-sm px-2 outline-none text-slate-600"
                    />
                    <button 
                      onClick={() => handleCopy(`${window.location.origin}/join/student/${classroom?.studentInviteToken}`, 'student')}
                      className="p-2 hover:bg-white rounded-xl transition-all text-indigo-600"
                    >
                      {copied === 'student' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Class Rep Invite Link</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                    <input 
                      readOnly 
                      value={`${window.location.origin}/join/rep/${classroom?.repInviteToken}`} 
                      className="flex-grow bg-transparent text-sm px-2 outline-none text-slate-600"
                    />
                    <button 
                      onClick={() => handleCopy(`${window.location.origin}/join/rep/${classroom?.repInviteToken}`, 'rep')}
                      className="p-2 hover:bg-white rounded-xl transition-all text-indigo-600"
                    >
                      {copied === 'rep' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Handouts */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Handouts</h2>
                <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  View all <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              {handouts.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No handouts uploaded yet.</p>
                  <button className="mt-4 text-indigo-600 font-bold hover:underline">Upload your first handout</button>
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
                        <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
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
                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                 />
               </div>
             </div>
             {/* Handout grid would go here */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {handouts.map((handout) => (
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
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Classroom Members</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{members.length} Total</span>
              </div>
            </div>

            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${member.role === 'admin' ? 'bg-indigo-50' : member.role === 'rep' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                      <Users className={`w-5 h-5 ${member.role === 'admin' ? 'text-indigo-600' : member.role === 'rep' ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{member.fullName} {member.uid === user?.uid && '(You)'}</h4>
                      <p className="text-xs text-slate-500">{member.email} • <span className="uppercase font-bold text-[10px] tracking-tighter">{member.role}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {member.status}
                    </span>
                    {member.role === 'rep' && member.status === 'pending' && (
                      <button 
                        onClick={async () => {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          await updateDoc(doc(db, 'users', member.id), { status: 'active' });
                        }}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                      >
                        Approve
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Live Class Sessions</h2>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Schedule Session
              </button>
            </div>
            
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <Video className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No live classes scheduled yet.</p>
              <p className="text-slate-400 text-xs mt-1">Schedule a session to start teaching in real-time.</p>
            </div>
          </div>
        )}

        {activeTab === 'developer' && isDeveloper && (
          <div className="space-y-8">
            {/* Pending Approvals */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pending Admin Approvals</h2>
                  <p className="text-sm text-slate-500">New administrators waiting for platform access.</p>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-xl">
                  <span className="text-amber-600 font-bold text-sm">{pendingAdmins.length} Pending</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pendingAdmins.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No pending admin registrations.</p>
                  </div>
                ) : (
                  pendingAdmins.map((admin) => (
                    <div key={admin.id} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/30 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{admin.fullName}</h4>
                          <p className="text-sm text-slate-500">{admin.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleApproveAdmin(admin.id)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        Approve Access
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Platform Overview</h2>
                  <p className="text-sm text-slate-500">Monitoring all active classrooms and administrative activities.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl">
                  <span className="text-indigo-600 font-bold text-sm">{allClassrooms.length} Total Classrooms</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {allClassrooms.map((cls) => (
                  <div key={cls.id} className="p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-white transition-all">
                          <Building2 className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{cls.name}</h4>
                          <p className="text-sm text-slate-500">{cls.schoolName} • Admin ID: {cls.adminId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cls.subscriptionStatus === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {cls.subscriptionStatus}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Created {new Date(cls.createdAt?.toDate()).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => {
                            // Logic to "View as this Admin" could go here
                            alert(`Viewing activities for ${cls.name} is coming soon!`);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
                        >
                          <ArrowUpRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

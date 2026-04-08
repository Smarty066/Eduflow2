'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Users, GraduationCap, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function JoinClassroomPage() {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classroom, setClassroom] = useState<any>(null);
  const router = useRouter();

  const validateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Check for student token
      const qStudent = query(collection(db, 'classrooms'), where('studentInviteToken', '==', token));
      const snapStudent = await getDocs(qStudent);
      
      if (!snapStudent.empty) {
        setClassroom({ ...snapStudent.docs[0].data(), role: 'student' });
        setStep(2);
      } else {
        // Check for rep token
        const qRep = query(collection(db, 'classrooms'), where('repInviteToken', '==', token));
        const snapRep = await getDocs(qRep);
        if (!snapRep.empty) {
          setClassroom({ ...snapRep.docs[0].data(), role: 'rep' });
          setStep(2);
        } else {
          setError('Invalid invite token. Please check with your Admin.');
        }
      }
    } catch (err: any) {
      setError('Error validating token.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create User Doc
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: user.displayName,
        email: user.email,
        role: classroom.role,
        status: classroom.role === 'rep' ? 'pending' : 'active',
        classroomId: classroom.id,
        createdAt: serverTimestamp(),
      });

      setStep(3);
      setTimeout(() => {
        if (classroom.role === 'rep') router.push('/rep');
        else router.push('/student');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">EduFlow</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            {step === 1 ? 'Join a Classroom' : step === 2 ? 'Confirm Identity' : 'Welcome!'}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100"
            >
              <form onSubmit={validateToken} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Invite Token</label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl font-mono tracking-widest uppercase"
                    placeholder="ABC123XYZ"
                  />
                  <p className="text-xs text-slate-400 mt-3 text-center">Enter the token provided by your Classroom Admin or Rep.</p>
                </div>

                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validate Token'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {classroom.role === 'student' ? <GraduationCap className="w-8 h-8 text-indigo-600" /> : <Users className="w-8 h-8 text-indigo-600" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{classroom.name}</h3>
                <p className="text-slate-500 text-sm">Joining as a <span className="font-bold text-indigo-600 uppercase">{classroom.role}</span></p>
              </div>

              <p className="text-slate-600 text-sm mb-8 text-center">
                To join this classroom, please sign in with your Google account to verify your identity.
              </p>

              {error && <p className="text-red-500 text-sm font-medium mb-4 text-center">{error}</p>}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Successfully Joined!</h2>
              <p className="text-slate-500">
                {classroom.role === 'rep' ? 'Your access is pending Admin approval.' : 'Redirecting to your dashboard...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

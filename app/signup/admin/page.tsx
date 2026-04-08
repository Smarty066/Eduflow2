'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Mail, Lock, User, Building, Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    classroomName: '',
    schoolName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    try {
      await performSignup();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const performSignup = async () => {
    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: formData.fullName });

    // 2. Create Classroom
    const classroomId = Math.random().toString(36).substring(2, 15);
    const studentToken = Math.random().toString(36).substring(2, 10);
    const repToken = Math.random().toString(36).substring(2, 10);

    await setDoc(doc(db, 'classrooms', classroomId), {
      id: classroomId,
      name: formData.classroomName,
      schoolName: formData.schoolName,
      adminId: user.uid,
      studentInviteToken: studentToken,
      repInviteToken: repToken,
      subscriptionStatus: 'active',
      createdAt: serverTimestamp(),
    });

    // 3. Create User Doc - Set status to 'pending' for developer approval
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      fullName: formData.fullName,
      email: formData.email,
      role: 'admin',
      status: 'pending', // Changed from 'active' to 'pending'
      classroomId: classroomId,
      createdAt: serverTimestamp(),
    });

    setStep(3);
    // No longer redirecting immediately to /admin as they are pending
  };

  const handleDeveloperSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await performSignup();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setStep(1);
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
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-200'}`}
              />
            ))}
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            {step === 1 ? 'Create Admin Account' : step === 2 ? 'Payment Simulation' : 'Success!'}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100"
            >
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Classroom Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.classroomName}
                      onChange={(e) => setFormData({ ...formData, classroomName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Computer Science 2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Classroom'}
                </button>
              </form>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Registration Submitted!</h2>
              <p className="text-slate-600 mb-8">
                Your admin account has been created. For security, all new admins must be manually approved by the developer before accessing the dashboard.
              </p>
              <Link 
                href="/login" 
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

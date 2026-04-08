'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">EduFlow</span>
          </Link>
          <h1 className="text-4xl font-display font-bold text-slate-900">Choose your path</h1>
          <p className="text-slate-500 mt-2 text-lg">Select how you want to use EduFlow today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Path */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 flex flex-col"
          >
            <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Classroom Creator</h2>
            <p className="text-slate-600 mb-8 flex-grow">
              Start your own virtual classroom. Upload handouts, manage students, and host live classes.
              <span className="block mt-4 font-bold text-indigo-600">₦5,000 / month</span>
            </p>
            <Link 
              href="/signup/admin" 
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Create Classroom <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Student/Rep Path */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col"
          >
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Join a Classroom</h2>
            <p className="text-slate-600 mb-8 flex-grow">
              Join an existing classroom as a Student or Class Representative using an invite link.
            </p>
            <Link 
              href="/signup/join" 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              Join Classroom <Users className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <p className="text-center mt-12 text-slate-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

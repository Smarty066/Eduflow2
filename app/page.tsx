'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Mic, Sparkles, Video, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">EduFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              The Future of Learning
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 mb-6">
              Your Virtual Classroom, <br />
              <span className="text-indigo-600">Reimagined.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
              Transform hardcopy handouts into digital experiences. AI-powered summaries, 
              audio reading, and live teaching—all in one premium platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
                Start Your Classroom <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-50 transition-all">
                Watch Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Everything you need to excel</h2>
            <p className="text-slate-600">Designed for universities, polytechnics, and modern educators.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
                title: "AI Handout Processing",
                desc: "Upload scans and let Gemini extract text, summarize key points, and generate revision notes automatically."
              },
              {
                icon: <Mic className="w-6 h-6 text-indigo-600" />,
                title: "Audio Reading",
                desc: "Listen to your handouts on the go. High-quality text-to-speech makes learning accessible anywhere."
              },
              {
                icon: <Video className="w-6 h-6 text-indigo-600" />,
                title: "Live Online Classes",
                desc: "Host interactive sessions with built-in Zoom integration. Share handouts and discuss in real-time."
              },
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                title: "Role-Based Control",
                desc: "Dedicated portals for Admins, Class Reps, and Students with granular permissions and invite links."
              },
              {
                icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
                title: "Premium Reader",
                desc: "A beautiful, editorial-style reading experience with dark mode, progress tracking, and bookmarks."
              },
              {
                icon: <CheckCircle2 className="w-6 h-6 text-indigo-600" />,
                title: "Secure & Scalable",
                desc: "Built on Firebase for real-time updates and enterprise-grade security for your academic data."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all"
              >
                <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-indigo-100">
            <div className="p-10 text-center">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Admin Plan</span>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-display font-bold text-slate-900">₦5,000</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="mt-4 text-slate-600">Perfect for class creators and department heads.</p>
              
              <ul className="mt-8 space-y-4 text-left">
                {[
                  "Unlimited Handout Uploads",
                  "AI Summaries & OCR",
                  "Audio Reading (TTS)",
                  "Live Class Integration",
                  "Student & Rep Invite Links",
                  "Role Management"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="mt-10 block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight">EduFlow</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 EduFlow Virtual Classroom. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

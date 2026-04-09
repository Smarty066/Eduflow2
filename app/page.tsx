'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Mic, 
  Sparkles, 
  Video, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Globe, 
  Zap, 
  Shield,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-slate-900">EduFlow</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Solutions', 'Pricing', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-100 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-[100px] opacity-40" />
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>The Future of Academic Management</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-slate-900 leading-[0.9] mb-8">
                Your Classroom, <br />
                <span className="text-indigo-600 italic">Digitized.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-slate-500 max-w-lg leading-relaxed mb-12">
                Transform hardcopy handouts into interactive digital experiences. 
                AI-powered summaries, audio reading, and live teaching—all in one premium platform.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-5">
                <Link 
                  href="/signup" 
                  className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[2rem] text-lg font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group"
                >
                  Start Your Classroom
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/demo" 
                  className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-[2rem] text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  Watch Demo
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-16 flex items-center gap-8 border-t border-slate-100 pt-10">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden relative">
                      <Image 
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        alt="User" 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Trusted by 2,000+ Educators</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Sparkles key={i} className="w-3 h-3 text-amber-400 fill-current" />
                    ))}
                    <span className="text-xs text-slate-500 ml-2">4.9/5 rating</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] border-[12px] border-white aspect-[4/5]">
                <Image 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                  alt="Students using EduFlow" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Summary</p>
                  <p className="font-bold text-slate-900">Ready in 12s</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audio Mode</p>
                  <p className="font-bold text-slate-900">Listening Active</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">Built for the Modern Academic</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                We&apos;ve combined cutting-edge AI with a beautiful reading experience to create 
                the ultimate tool for students and educators alike.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "AI Handout Processing",
                  desc: "Upload scans and let Gemini extract text, summarize key points, and generate revision notes automatically.",
                  color: "bg-indigo-50 text-indigo-600"
                },
                {
                  icon: Mic,
                  title: "Audio Reading",
                  desc: "Listen to your handouts on the go. High-quality text-to-speech makes learning accessible anywhere.",
                  color: "bg-amber-50 text-amber-600"
                },
                {
                  icon: Video,
                  title: "Live Online Classes",
                  desc: "Host interactive sessions with built-in Zoom integration. Share handouts and discuss in real-time.",
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  icon: Users,
                  title: "Role-Based Control",
                  desc: "Dedicated portals for Admins, Class Reps, and Students with granular permissions and invite links.",
                  color: "bg-purple-50 text-purple-600"
                },
                {
                  icon: Globe,
                  title: "Cloud Sync",
                  desc: "Access your handouts and progress from any device. Your library is always with you.",
                  color: "bg-green-50 text-green-600"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "Your academic data is protected with industry-standard encryption and secure Firebase infrastructure.",
                  color: "bg-red-50 text-red-600"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500"
                >
                  <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-8">{feature.desc}</p>
                  <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white aspect-[4/5]">
                  <Image 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                    alt="Collaborative Learning" 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-indigo-600 rounded-full -z-10 blur-3xl opacity-20" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-8 leading-tight">
                  Empowering the next generation of <span className="text-indigo-600">scholars.</span>
                </h2>
                <div className="space-y-6 text-lg text-slate-500 leading-relaxed">
                  <p>
                    EduFlow was born from a simple observation: the bridge between physical handouts and digital learning was broken. We set out to build a platform that doesn&apos;t just store documents, but brings them to life.
                  </p>
                  <p>
                    By combining advanced AI OCR with natural-sounding text-to-speech and real-time collaboration, we&apos;ve created an ecosystem where students can focus on understanding, not just organizing.
                  </p>
                  <p>
                    Whether you&apos;re a Class Rep coordinating handouts or a student preparing for finals, EduFlow provides the tools you need to excel in a fast-paced academic world.
                  </p>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-3xl font-display font-bold text-slate-900">98%</p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Student Satisfaction</p>
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-slate-900">50k+</p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Pages Processed</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-slate-900 rounded-[4rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 p-12 md:p-24 items-center">
                <div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 leading-tight">
                    Ready to transform your <span className="text-indigo-400">classroom?</span>
                  </h2>
                  <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                    Join thousands of educators who are already using EduFlow to deliver 
                    a superior learning experience.
                  </p>
                  <div className="space-y-6">
                    {[
                      "Unlimited Handout Uploads",
                      "AI Summaries & OCR",
                      "Live Class Integration",
                      "Student & Rep Management"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl">
                  <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Admin Plan</span>
                  <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-display font-bold text-slate-900">₦5,000</span>
                    <span className="text-slate-500 font-medium">/month</span>
                  </div>
                  <p className="mt-6 text-slate-500 font-medium">Everything you need to manage a modern classroom.</p>
                  
                  <Link 
                    href="/signup" 
                    className="mt-12 block w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Get Started Now
                  </Link>
                  <p className="mt-6 text-xs text-slate-400 font-medium">No credit card required to start. Cancel anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-slate-900">EduFlow</span>
            </Link>
            <p className="text-slate-500 max-w-xs leading-relaxed">
              Empowering educators and students with AI-driven classroom management 
              and a premium reading experience.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Product</h4>
            <ul className="space-y-4">
              {['Features', 'AI Tools', 'Audio Mode', 'Live Classes'].map((item) => (
                <li key={item}><a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4">
              {['About', 'Privacy', 'Terms', 'Contact'].map((item) => (
                <li key={item}><a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-sm font-medium">© 2026 EduFlow Virtual Classroom. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Globe className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Users className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

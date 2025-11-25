'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, BookOpen, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformStats } from './types';

interface HeroSectionProps {
  stats: PlatformStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();

  const handleBrowseClick = () => {
    router.push('/exampapers');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements with Hero Image */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Hero Image Background */}
        <div className="absolute inset-0">
          <Image
            src="/hero-image.jpg"
            alt="Students studying"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay with Green Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/80 to-emerald-900/70"></div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 w-fit">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Master Your Exams</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                Ace Your
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Exams Today
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                Access {stats.totalPapers.toLocaleString()}+ past exam papers from {stats.totalInstitutions.toLocaleString()}+ institutions. Practice with real questions and master every subject.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleBrowseClick}
                size="lg"
                className="h-14 px-8 text-base bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Browse Papers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={handleSignUp}
                size="lg"
                className="h-14 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
              </Button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Real Exam Papers</p>
                  <p className="text-sm text-slate-400">From top institutions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Instant Access</p>
                  <p className="text-sm text-slate-400">Start studying now</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Track Progress</p>
                  <p className="text-sm text-slate-400">Monitor your improvement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Free Forever</p>
                  <p className="text-sm text-slate-400">No hidden charges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block z-10">
            <div className="relative">
              {/* Card Stack Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div>
                        <p className="text-sm text-slate-400">Exam Papers</p>
                        <p className="text-2xl font-bold text-white">{stats.totalPapers.toLocaleString()}+</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div>
                        <p className="text-sm text-slate-400">Questions</p>
                        <p className="text-2xl font-bold text-white">{stats.totalQuestions.toLocaleString()}+</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div>
                        <p className="text-sm text-slate-400">Institutions</p>
                        <p className="text-2xl font-bold text-white">{stats.totalInstitutions.toLocaleString()}+</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button onClick={handleBrowseClick} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all">
                    Start Exploring
                  </button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="relative border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.totalPapers.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Exam Papers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {stats.totalInstitutions.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Institutions</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {stats.totalQuestions.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Questions</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {(stats.totalCourses || 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Courses</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Building2, HelpCircle } from 'lucide-react';
import type { PlatformStats } from './types';

interface StatsSectionProps {
  stats: PlatformStats;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay?: number;
}

function StatItem({ icon, value, label, delay = 0 }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
        {count.toLocaleString()}
      </div>
      <div className="text-base md:text-lg text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Growing Library of Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students using our platform to ace their exams
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatItem
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              value={stats.totalPapers}
              label="Exam Papers"
              delay={0}
            />
            <StatItem
              icon={<Building2 className="h-8 w-8 text-blue-600" />}
              value={stats.totalInstitutions}
              label="Institutions"
              delay={100}
            />
            <StatItem
              icon={<HelpCircle className="h-8 w-8 text-blue-600" />}
              value={stats.totalQuestions}
              label="Questions"
              delay={200}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

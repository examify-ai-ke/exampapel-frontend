"use client"

import { ChevronDown } from "lucide-react"

interface Question {
  id: string
  question_number: string
  text: {
    blocks: Array<{
      data: {
        text: string
      }
    }>
  }
  marks: number
  total_marks: number
  children_count: number
  children: Array<{
    id: string
    question_number: string
    text: {
      blocks: Array<{
        data: {
          text: string
        }
      }>
    }
    marks: number
  }>
  exam_paper: {
    year_of_exam: string
  }
  course: {
    name: string
    course_acronym: string
  }
  institution: {
    name: string
  }
  programme?: {
    name: string
  }
  module?: {
    name: string
  }
}

interface QuestionCardProps {
  question: Question
  isExpanded: boolean
}

export function QuestionCard({ question, isExpanded }: QuestionCardProps) {
  const mainText = question.text.blocks[0]?.data?.text || ""

  return (
    <div
      className={`
        w-full p-6 rounded-lg border-2 transition-all duration-200
        ${isExpanded ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-card/80"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {question.institution.name}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-chart-2 text-white text-xs font-bold">
              {question.course.course_acronym}
            </span>
            {question.programme && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-chart-4 text-white text-xs font-bold">
                {question.programme.name}
              </span>
            )}
            {question.module && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-chart-5 text-white text-xs font-bold">
                {question.module.name}
              </span>
            )}
          </div>

          {/* Question Number Badge */}
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {question.question_number}
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Question</span>
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">{mainText}</h3>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Marks:</span>
              <span className="text-base font-bold text-primary">{question.total_marks}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Sub-questions:</span>
              <span className="text-base font-bold text-foreground">{question.children_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Year:</span>
              <span className="text-base font-bold text-foreground">{question.exam_paper.year_of_exam}</span>
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        <div className="flex-shrink-0">
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { QuestionCard } from "./question-card"

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

interface QuestionsGridProps {
  questions: Question[]
}

const sortSubQuestions = (children: Question["children"]) => {
  return [...children].sort((a, b) => {
    return a.question_number.localeCompare(b.question_number, undefined, { numeric: true })
  })
}

export function QuestionsGrid({ questions }: QuestionsGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="group">
            <button onClick={() => toggleExpand(question.id)} className="w-full text-left">
              <QuestionCard question={question} isExpanded={expandedId === question.id} />
            </button>

            {/* Expanded Content */}
            {expandedId === question.id && (
              <div className="mt-2 ml-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {sortSubQuestions(question.children).map((subQuestion) => (
                  <div
                    key={subQuestion.id}
                    className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-primary min-w-fit">
                        ({subQuestion.question_number})
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{subQuestion.text.blocks[0]?.data?.text}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-xs font-medium text-muted-foreground">
                            Marks: <span className="text-primary">{subQuestion.marks}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

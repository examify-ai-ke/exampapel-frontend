import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ExamPapersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Past Exam Papers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Access thousands of past exam papers and questions from various institutions. 
            Find the perfect study materials to enhance your preparation.
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-4 max-w-2xl mx-auto mb-8">
            <Input
              placeholder="Search papers, questions, or institutions..."
              className="flex-1"
            />
            <Button size="lg">Search</Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="default" className="cursor-pointer">All Subjects</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Mathematics</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Physics</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Chemistry</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Biology</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">English</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Computer Science</Badge>
          </div>
        </div>

        {/* Latest Questions Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Questions</h2>
            <Button variant="outline" asChild>
              <Link href="/exampapers/questions">View All Questions</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Latest Questions */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">Question #{i}</Badge>
                    <Badge variant="outline">New</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    What is the derivative of f(x) = x² + 3x - 5?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Subject:</span>
                      <span className="font-medium">Mathematics</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Institution:</span>
                      <span className="font-medium">University of Example</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year:</span>
                      <span className="font-medium">2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <Badge variant="outline" className="text-xs">Intermediate</Badge>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full" variant="outline" size="sm">
                      View Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Exam Papers Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Exam Papers</h2>
            <Button variant="outline" asChild>
              <Link href="/exampapers/papers">Browse All Papers</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Featured Papers */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Mathematics Paper {i}</CardTitle>
                    <Badge>2024</Badge>
                  </div>
                  <p className="text-sm text-gray-600">University of Example</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Questions:</span>
                      <span>25</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span>3 hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Level:</span>
                      <span>Undergraduate</span>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full" variant="outline">
                        View Paper
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">1,234</div>
              <div className="text-gray-600">Exam Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">89</div>
              <div className="text-gray-600">Institutions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">567</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Studying?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of students who are already using our platform to excel in their studies.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

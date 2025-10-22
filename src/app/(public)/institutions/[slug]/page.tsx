'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';
import { ExamPaperCard } from '@/components/public';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  MapPin,
  FileText,
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  Mail,
  Globe,
  Phone,
} from 'lucide-react';

export default function InstitutionProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch institution by slug
  const { data: institution, isLoading: institutionLoading, error: institutionError } = useQuery({
    queryKey: ['institution', slug],
    queryFn: async () => {
      const result = await publicAPI.institutions.getBySlug(slug);
      if (result.error) {
        throw new Error('Failed to fetch institution');
      }
      return result.data;
    },
    enabled: !!slug,
  });

  // Fetch exam papers for this institution
  const { data: papersData, isLoading: papersLoading } = useQuery({
    queryKey: ['institutionPapers', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return { data: [], total: 0 };
      
      const result = await publicAPI.examPapers.list({
        skip: 0,
        limit: 12, // Show first 12 papers
      });
      
      if (result.error) {
        throw new Error('Failed to fetch papers');
      }
      
      // Filter papers by institution on client side
      const filteredPapers = (result.data || []).filter(
        (paper: any) => paper.institution?.id === institution.id
      );
      
      return {
        data: filteredPapers,
        total: filteredPapers.length,
      };
    },
    enabled: !!institution?.id,
  });

  const isLoading = institutionLoading || papersLoading;

  if (institutionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (institutionError || !institution) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Institution Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The institution you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/institutions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
      </div>
    );
  }

  const papers = papersData?.data || [];
  const totalPapers = (institution as any).exam_papers_count || papers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/institutions')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Institution Logo */}
            <div className="shrink-0">
              {institution.logo_url ? (
                <Image
                  src={institution.logo_url}
                  alt={institution.name}
                  width={160}
                  height={160}
                  className="object-contain rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-20 w-20 text-blue-600" />
                </div>
              )}
            </div>

            {/* Institution Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {institution.name}
                  </h1>
                  {institution.acronym && (
                    <p className="text-lg text-gray-600">({institution.acronym})</p>
                  )}
                </div>
              </div>

              {institution.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {institution.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {institution.institution_type && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium">{institution.institution_type}</span>
                  </div>
                )}
                {institution.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{institution.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">
                    {totalPapers.toLocaleString()} {totalPapers === 1 ? 'Paper' : 'Papers'}
                  </span>
                </div>
              </div>

              {/* Tags/Badges */}
              <div className="flex flex-wrap gap-2">
                {institution.institution_type && (
                  <Badge variant="secondary">
                    {institution.institution_type}
                  </Badge>
                )}
                {institution.location && (
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {institution.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FileText className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Papers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPapers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Institution Type</p>
                  <p className="text-xl font-bold text-gray-900">
                    {institution.institution_type || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-xl font-bold text-gray-900">
                    {institution.location || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information (if available) */}
          {(institution as any).contact_email || (institution as any).website || (institution as any).phone && (
            <div className="bg-white rounded-lg border p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(institution as any).contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <a
                      href={`mailto:${(institution as any).contact_email}`}
                      className="text-teal-600 hover:text-teal-700"
                    >
                      {(institution as any).contact_email}
                    </a>
                  </div>
                )}
                {(institution as any).website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={(institution as any).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {(institution as any).phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a
                      href={`tel:${(institution as any).phone}`}
                      className="text-teal-600 hover:text-teal-700"
                    >
                      {(institution as any).phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exam Papers Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Exam Papers ({totalPapers})
              </h2>
              {totalPapers > 12 && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/institutions/${slug}/papers`)}
                >
                  View All Papers
                </Button>
              )}
            </div>

            {papersLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {!papersLoading && papers.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  No exam papers available for this institution yet.
                </p>
              </div>
            )}

            {!papersLoading && papers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper: any) => (
                  <ExamPaperCard
                    key={paper.id}
                    paper={paper}
                    variant="grid"
                    showBookmark={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* About Section */}
          {institution.description && (
            <div className="bg-white rounded-lg border p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About {institution.name}
              </h2>
              <Separator className="mb-4" />
              <p className="text-gray-700 leading-relaxed">
                {institution.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

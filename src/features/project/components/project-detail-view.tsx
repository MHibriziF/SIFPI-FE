'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import { SummaryCard } from './summary-card';
import { SectionCard } from './section-card';
import type { AdminProjectDetailDTO } from '../types/admin-detail';

interface ProjectDetailViewProps {
  project: AdminProjectDetailDTO;
  onVerify: (id: number) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  isLoading?: boolean;
}

import { SummaryItem } from '@/features/project/utils/summary-formatters';

export function ProjectDetailView({
  project,
  onVerify,
  onReject,
  isLoading = false,
}: Readonly<ProjectDetailViewProps>) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const projectId = `PRJ-${String(project.id).padStart(7, '0')}`;

  const notesLength = rejectionNotes.length;
  const isValidNotes = notesLength >= 10 && notesLength <= 500;

  const handleVerify = async () => {
    try {
      setActionLoading(true);
      setError('');
      await onVerify(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!isValidNotes) {
      setError('Catatan harus antara 10-500 karakter');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await onReject(project.id, rejectionNotes);
      setRejectionNotes('');
      setIsRejecting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject project');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
          <ChevronLeft className="h-4 w-4" />
          View all project list
        </Link>

        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide">Projects / {projectId}</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-primary">{project.name}</h1>
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-900">
              {project.status}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-600">{project.sector}</p>
        </div>
      </div>

      {/* Strategic Narrative */}
      <SummaryCard>
        <SummaryCard.Header title="Strategic Narrative / Value Proposition" />
        <SummaryCard.Body className="space-y-4">
          <p className="text-sm text-primary">{project.valueProposition ?? '-'}</p>
          {project.locationImageUrl && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={project.locationImageUrl}
                alt="Location Map"
                className="w-full h-auto object-cover max-h-96"
                onError={(e) => {
                  e.currentTarget.alt = 'Image failed to load';
                  e.currentTarget.className = 'w-full h-40 object-cover bg-gray-100 flex items-center justify-center text-gray-500';
                }}
              />
            </div>
          )}
        </SummaryCard.Body>
      </SummaryCard>

      {/* Project Information */}
      <SummaryCard>
        <SummaryCard.Header title="Project Information" />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Project Name" value={project.name} />
          <SummaryItem label="Sector" value={project.sector} />
          <SummaryItem label="Location" value={project.location} />
          <SummaryItem label="Short Description" value={project.description} />
        </SummaryCard.Body>
      </SummaryCard>

      {/* Project Structure */}
      <SummaryCard>
        <SummaryCard.Header title="Project Structure" />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Cooperation Model" value={project.cooperationModel} />
          <SummaryItem label="Concession Period" value={`${project.concessionPeriod} tahun`} />
          <SummaryItem label="Asset Readiness" value={project.assetReadiness} />
          {project.projectStructureImageUrl && (
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={project.projectStructureImageUrl}
                  alt="Project Structure"
                  className="w-full h-auto object-cover max-h-96"
                  onError={(e) => {
                    e.currentTarget.alt = 'Image failed to load';
                  }}
                />
              </div>
            </div>
          )}
          <SummaryItem label="Revenue Stream" value={project.revenueStream} />
          <SummaryItem label="Is Feasibility Study" value={project.isFeasibilityStudy ? 'Ya' : 'Tidak'} />
        </SummaryCard.Body>
      </SummaryCard>

      {/* Government Support */}
      <SummaryCard>
        <SummaryCard.Header title="Incentives / Government Support" />
        <SummaryCard.Body>
          <p className="text-sm text-primary">{project.governmentSupport ?? '-'}</p>
        </SummaryCard.Body>
      </SummaryCard>

      {/* Revenue Stream */}
      <SummaryCard>
        <SummaryCard.Header title="Revenue Stream" />
        <SummaryCard.Body>
          <p className="text-sm text-primary">{project.revenueStream ?? '-'}</p>
        </SummaryCard.Body>
      </SummaryCard>

      {/* Project Owner */}
      <SummaryCard>
        <SummaryCard.Header title="Project Owner" />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Owner Institution" value={project.ownerInstitution} />
          <SummaryItem label="Contact Person" value={project.contactPersonName} />
          <SummaryItem label="Email" value={project.contactPersonEmail} />
          <SummaryItem label="Phone" value={project.contactPersonPhone} />
        </SummaryCard.Body>
      </SummaryCard>

      {/* Financials */}
      <SummaryCard>
        <SummaryCard.Header title="Financials" />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem
            label="Total CAPEX (million USD)"
            value={project.totalCapex ? `$${project.totalCapex.toFixed(2)}` : '-'}
          />
          <SummaryItem
            label="Total OPEX (million USD)"
            value={project.totalOpex ? `$${project.totalOpex.toFixed(2)}` : '-'}
          />
          <SummaryItem
            label="NPV (million USD)"
            value={project.npv ? `$${project.npv.toFixed(2)}` : '-'}
          />
          <SummaryItem
            label="IRR (%)"
            value={project.irr ? `${project.irr.toFixed(2)}%` : '-'}
          />
        </SummaryCard.Body>
      </SummaryCard>

      {/* Additional Information */}
      {project.additionalInfo && (
        <SummaryCard>
          <SummaryCard.Header title="Additional Information and Assumptions" />
          <SummaryCard.Body>
            <p className="text-sm text-primary whitespace-pre-wrap">{project.additionalInfo}</p>
          </SummaryCard.Body>
        </SummaryCard>
      )}

      {/* Timeline */}
      {project.timelines && project.timelines.length > 0 && (
        <SummaryCard>
          <SummaryCard.Header title="Indicative / High-level Timeline" />
          <SummaryCard.Body>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {project.timelines.map((timeline) => (
                <div
                  key={timeline.id}
                  className="flex-shrink-0 w-48 rounded-lg bg-gradient-to-br from-primary to-primary/80 p-4 text-white"
                >
                  <h3 className="font-bold">{timeline.timeRange}</h3>
                  <p className="mt-2 text-sm text-primary/90">{timeline.phaseDescription}</p>
                </div>
              ))}
            </div>
          </SummaryCard.Body>
        </SummaryCard>
      )}

      {/* Project Documents */}
      {project.projectFileDownloadUrl && (
        <SummaryCard>
          <SummaryCard.Header title="Project Documents" />
          <SummaryCard.Body>
            <a
              href={project.projectFileDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              <FileText className="h-4 w-4" />
              Download Project File
            </a>
          </SummaryCard.Body>
        </SummaryCard>
      )}

      {/* Verification Panel */}
      <SectionCard>
        <SectionCard.Header title="Verification Panel" />
        <SectionCard.Body className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isRejecting ? (
            <div className="space-y-3">
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Memverifikasi...' : '✓ Verify Project'}
              </button>

              <button
                onClick={() => setIsRejecting(true)}
                disabled={actionLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ✕ Reject & Revision
              </button>
            </div>
          ) : (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <label className="block">
                <p className="text-sm font-semibold text-gray-900 mb-2">Provide a detailed description</p>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => {
                    setRejectionNotes(e.target.value);
                    setError('');
                  }}
                  maxLength={500}
                  placeholder="Provide a detailed description of required revisions..."
                  className="w-full h-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {notesLength} / 500 characters
                </p>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !isValidNotes}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Menolak...' : 'Reject & Revision'}
                </button>
                <button
                  onClick={() => {
                    setIsRejecting(false);
                    setRejectionNotes('');
                    setError('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <Link
            href="/admin/projects"
            className="block w-full text-center rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to List
          </Link>
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}

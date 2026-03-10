'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, FolderKanban } from 'lucide-react';

import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { ApiError } from '@/shared/types/api';
import { ProjectStatus } from '@/shared/enums/project-status';
import { ProjectSubmissionStepper } from '@/features/project/components/project-submission-stepper';
import { getProjectById, updateProject } from '@/features/project/services';
import type { ProjectDetailDTO } from '@/features/project/types';
import {
  editProjectFormSchema,
  EDIT_STEP_FIELDS,
  EDIT_STEP_LABELS,
  type EditProjectFormValues,
} from '@/features/project/types/edit-project-form';
import { EditStepGeneral } from './step-general';
import { EditStepTechnical } from './step-technical';
import { EditStepFinancial } from './step-financial';
import { EditStepSummary } from './step-summary';

function renderStep(
  step: number,
  project: ProjectDetailDTO
) {
  if (step === 1)
    return <EditStepGeneral existingMapFileUrl={project.locationImageUrl} />;
  if (step === 2)
    return (
      <EditStepTechnical
        existingStructureFileUrl={project.projectStructureImageUrl}
        existingProjectFileUrl={project.projectFileDownloadUrl}
      />
    );
  if (step === 3) return <EditStepFinancial />;
  return null;
}

interface EditProjectPageProps {
  projectId: number;
}

export default function EditProjectPage({ projectId }: EditProjectPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<ProjectDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRejected = project?.status === ProjectStatus.PERBAIKAN_DATA;

  const form = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      general: { projectName: '', shortDescription: '', sector: '', location: '', valueProposition: '', ownerInstitution: '', contactPerson: '', email: '', phone: '' },
      technical: { cooperationModel: '', concessionPeriod: 0, assetReadiness: '', governmentSupport: '', revenueStream: '', isFeasibilityStudy: false },
      financial: { totalCapex: undefined, totalOpex: undefined, npv: undefined, irr: undefined, additionalInfo: '' },
      timelines: [{ timeRange: '', phaseDescription: '' }],
      confirmation: { confirmDataAccuracy: false, agreePublication: false, acknowledgeVerification: false, allowPromotion: false },
      files: { mapFile: null, projectStructureFile: null, feasibilityStudyFile: null },
    },
    mode: 'onTouched',
  });

  // Fetch project data and populate form
  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProjectById(projectId);
      const p = res.data;

      if (!p) {
        showToast('danger', 'Proyek tidak ditemukan', 'Proyek yang ingin diedit tidak ditemukan.');
        router.replace('/project-owner/projects');
        return;
      }

      // Only DRAFT or PERBAIKAN_DATA can be edited
      if (p.status !== ProjectStatus.DRAFT && p.status !== ProjectStatus.PERBAIKAN_DATA) {
        showToast('danger', 'Tidak dapat diedit', 'Hanya proyek berstatus Draft atau Perbaikan Data yang dapat diedit.');
        router.replace(`/project-owner/projects/${projectId}`);
        return;
      }

      setProject(p);

      // Populate form with existing data
      form.reset({
        general: {
          projectName: p.name ?? '',
          shortDescription: p.description ?? '',
          sector: p.sector as string ?? '',
          location: p.location ?? '',
          valueProposition: p.valueProposition ?? '',
          ownerInstitution: p.ownerInstitution ?? '',
          contactPerson: p.contactPersonName ?? '',
          email: p.contactPersonEmail ?? '',
          phone: p.contactPersonPhone ?? '',
        },
        technical: {
          cooperationModel: p.cooperationModel ?? '',
          concessionPeriod: p.concessionPeriod ?? 0,
          assetReadiness: p.assetReadiness ?? '',
          governmentSupport: p.governmentSupport ?? '',
          revenueStream: p.revenueStream ?? '',
          isFeasibilityStudy: p.isFeasibilityStudy ?? false,
        },
        financial: {
          totalCapex: p.totalCapex || undefined,
          totalOpex: p.totalOpex || undefined,
          npv: p.npv || undefined,
          irr: p.irr || undefined,
          additionalInfo: p.additionalInfo ?? '',
        },
        timelines:
          p.timelines.length > 0
            ? p.timelines.map(t => ({ timeRange: t.timeRange, phaseDescription: t.phaseDescription }))
            : [{ timeRange: '', phaseDescription: '' }],
        confirmation: {
          confirmDataAccuracy: false,
          agreePublication: false,
          acknowledgeVerification: false,
          allowPromotion: false,
        },
        files: {
          mapFile: null,
          projectStructureFile: null,
          feasibilityStudyFile: null,
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          router.replace('/project-owner/projects');
          return;
        }
        showToast('danger', 'Gagal memuat proyek', err.message);
      } else {
        showToast('danger', 'Gagal memuat proyek', 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router, form]);

  useEffect(() => {
    fetchProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const steps = useMemo(
    () => EDIT_STEP_LABELS.map((label, index) => ({ index: index + 1, label })),
    []
  );

  const goToStep = (step: number) => {
    if (step > maxVisitedStep) return;
    setCurrentStep(step as 1 | 2 | 3 | 4);
  };

  const handleNext = async () => {
    if (currentStep === 4) return;

    const fields = EDIT_STEP_FIELDS[currentStep] as FieldPath<EditProjectFormValues>[];
    const isValid = await form.trigger(fields);
    if (!isValid) return;

    const nextStep = (currentStep + 1) as 1 | 2 | 3 | 4;
    setCurrentStep(nextStep);
    setMaxVisitedStep(previous => (nextStep > previous ? nextStep : previous));
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
  };

  const submitUpdate = async (values: EditProjectFormValues, isSubmitted: boolean) => {
    setSubmitting(true);
    try {
      await updateProject(projectId, {
        data: {
          name: values.general.projectName,
          description: values.general.shortDescription,
          sector: values.general.sector,
          location: values.general.location,
          valueProposition: values.general.valueProposition,
          ownerInstitution: values.general.ownerInstitution,
          contactPersonName: values.general.contactPerson,
          contactPersonEmail: values.general.email,
          contactPersonPhone: values.general.phone,
          cooperationModel: values.technical.cooperationModel,
          concessionPeriod: values.technical.concessionPeriod,
          assetReadiness: values.technical.assetReadiness,
          governmentSupport: values.technical.governmentSupport,
          totalCapex: values.financial.totalCapex ?? 0,
          totalOpex: values.financial.totalOpex ?? 0,
          npv: values.financial.npv ?? 0,
          irr: values.financial.irr ?? 0,
          revenueStream: values.technical.revenueStream,
          isFeasibilityStudy: values.technical.isFeasibilityStudy,
          additionalInfo: values.financial.additionalInfo,
          timelines: values.timelines,
          isSubmitted,
        },
        mapFile: values.files.mapFile,
        projectStructureFile: values.files.projectStructureFile,
        projectFile: values.files.feasibilityStudyFile,
      });

      if (isSubmitted) {
        showToast('success', 'Berhasil', 'Proyek berhasil disubmit ulang untuk review.');
      } else {
        showToast('success', 'Berhasil', 'Perubahan proyek berhasil disimpan.');
      }
      router.push('/project-owner/projects');
    } catch (error) {
      const message =
        error instanceof ApiError && error.isForbidden
          ? 'Anda tidak memiliki izin untuk mengedit proyek ini.'
          : error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Gagal menyimpan perubahan proyek.';
      showToast('danger', 'Gagal menyimpan', message);
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveDraft = form.handleSubmit(async values => submitUpdate(values, false));
  const onSubmitReview = form.handleSubmit(async values => submitUpdate(values, true));

  // ── Loading skeleton ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <main className="min-h-full bg-gray-50 px-4 pt-6 pb-2 md:px-6 md:pb-3">
        <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-gray-300 rounded" />
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!project) return null;

  return (
    <main className="min-h-full bg-gray-50 px-4 pt-6 pb-2 md:px-6 md:pb-3">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="flex items-start gap-3 px-1">
          <div className="mt-0.5 flex size-13 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/8">
            <FolderKanban className="size-8 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-medium text-primary">Manajemen Proyek</p>
            <p className="mt-0.5 text-m text-gray-500">Kelola proyek yang diajukan</p>
          </div>
        </section>

        <header className="rounded-xl bg-gray-50 px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Edit Proyek</h1>
            <p className="text-sm text-gray-500 mt-1">#{project.id} — {project.name}</p>
            <Link
              href={`/project-owner/projects/${project.id}`}
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              <div className="flex items-center mt-1">
                <ArrowLeft className="mr-2 size-4" />
                Kembali ke detail proyek
              </div>
            </Link>
          </div>
        </header>

        {/* Rejection banner */}
        {isRejected && project.rejectionReason && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Proyek ditolak — Perbaikan Data Diperlukan
                </p>
                <p className="mt-1 text-sm text-yellow-700">
                  Catatan dari Admin: {project.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-2 py-1">
          <div className="mx-auto max-w-4xl">
            <ProjectSubmissionStepper
              steps={steps}
              currentStep={currentStep}
              maxVisitedStep={maxVisitedStep}
              onStepChange={goToStep}
            />
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            {currentStep === 4 ? (
              <EditStepSummary
                onBack={handleBack}
                onEditStep={step => goToStep(step)}
                onSaveDraft={() => void onSaveDraft()}
                onSubmit={() => void onSubmitReview()}
                submitting={submitting}
                isResubmit={isRejected}
                existingMapFileUrl={project.locationImageUrl}
                existingStructureFileUrl={project.projectStructureImageUrl}
                existingProjectFileUrl={project.projectFileDownloadUrl}
              />
            ) : (
              <>
                {renderStep(currentStep, project)}
                {currentStep === 1 ? (
                  <div className="flex flex-wrap items-center justify-start gap-3">
                    <Button type="button" onClick={() => void handleNext()}>
                      Simpan data dan lanjutkan
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <Button type="button" variant="outlined" onClick={handleBack}>
                      Kembali
                    </Button>
                    <Button type="button" onClick={() => void handleNext()}>
                      Lanjut
                    </Button>
                  </div>
                )}
              </>
            )}
          </form>
        </FormProvider>
      </div>
    </main>
  );
}

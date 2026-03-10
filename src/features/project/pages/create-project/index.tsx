'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FormProvider, useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { ApiError } from '@/shared/types/api';
import { ProjectSubmissionStepper } from '@/features/project/components/project-submission-stepper';
import { createProject } from '@/features/project/services';
import {
  DEFAULT_PROJECT_FORM_VALUES,
  projectFormSchema,
  STEP_FIELDS,
  STEP_LABELS,
  type ProjectFormValues,
} from '@/features/project/types/create-project-form';
import { StepFinancial } from './step-financial';
import { StepGeneral } from './step-general';
import { StepSummary } from './step-summary';
import { StepTechnical } from './step-technical';

function renderStep(step: number) {
  if (step === 1) return <StepGeneral />;
  if (step === 2) return <StepTechnical />;
  if (step === 3) return <StepFinancial />;
  return null;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: DEFAULT_PROJECT_FORM_VALUES,
    mode: 'onTouched',
  });

  const steps = useMemo(
    () => STEP_LABELS.map((label, index) => ({ index: index + 1, label })),
    []
  );

  const goToStep = (step: number) => {
    if (step > maxVisitedStep) return;
    setCurrentStep(step as 1 | 2 | 3 | 4);
  };

  const handleNext = async () => {
    if (currentStep === 4) return;

    const fields = STEP_FIELDS[currentStep] as FieldPath<ProjectFormValues>[];
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

  const submitProject = async (values: ProjectFormValues, isSubmitted: boolean) => {
    setSubmitting(true);
    try {
      await createProject({
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
        mapFile: values.files.mapFile as File,
        projectStructureFile: values.files.projectStructureFile as File,
        projectFile: values.files.feasibilityStudyFile as File,
      });

      showToast(
        'success',
        'Berhasil',
        isSubmitted ? 'Proyek berhasil diajukan.' : 'Draft proyek berhasil disimpan.'
      );
      router.push('/project-owner/projects');
    } catch (error) {
      const message =
        error instanceof ApiError && error.isForbidden
          ? 'Akun Anda belum diverifikasi oleh admin. Silakan tunggu verifikasi sebelum dapat mengajukan proyek.'
          : error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Gagal mengirim proyek.';
      showToast('danger', 'Pengajuan gagal', message);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = form.handleSubmit(async values => submitProject(values, true));
  const onSaveDraft = form.handleSubmit(async values => submitProject(values, false));

  return (
    <main className="bg-white">
      <section className="w-full bg-grey px-4 py-5 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-3xl font-semibold text-primary">Manajemen Proyek</p>
          <p className="mt-1 text-base text-gray-600">Kelola proyek yang diajukan</p>
        </div>
      </section>

      <div className="px-4 py-6 pb-4 md:px-6 md:py-5 md:pb-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <header className="px-1">
            <h1 className="text-2xl font-semibold text-primary">Buat Pengajuan Proyek Baru</h1>
            <Link
              href="/project-owner/projects"
              className="mt-1 inline-flex items-center text-sm font-medium text-primary/90 hover:text-primary"
            >
              <ArrowLeft className="mr-2 size-4" />
              Lihat semua riwayat proyek
            </Link>
          </header>

          <div className="px-1">
            <ProjectSubmissionStepper
              steps={steps}
              currentStep={currentStep}
              maxVisitedStep={maxVisitedStep}
              onStepChange={goToStep}
            />
          </div>

          <FormProvider {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {currentStep === 4 ? (
                <StepSummary
                  onBack={handleBack}
                  onEditStep={step => goToStep(step)}
                  onSaveDraft={() => void onSaveDraft()}
                  submitting={submitting}
                />
              ) : (
                <>
                  {renderStep(currentStep)}
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
      </div>
    </main>
  );
}

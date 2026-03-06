import { cn } from '@/shared/lib/utils';

export interface StepperStep {
  index: number;
  label: string;
}

interface ProjectSubmissionStepperProps {
  steps: StepperStep[];
  currentStep: number;
  maxVisitedStep: number;
  onStepChange: (step: number) => void;
}

function Root({ steps, currentStep, maxVisitedStep, onStepChange }: ProjectSubmissionStepperProps) {
  return (
    <nav aria-label="Project submission steps">
      <div className="overflow-x-auto">
        <ol className="mx-auto flex min-w-[36rem] items-start justify-between py-1">
          {steps.map((step, index) => {
            const isCompleted = step.index < currentStep;
            const isCurrent = step.index === currentStep;
            const isDisabled = step.index > maxVisitedStep;
            const connectorActive = step.index <= currentStep;

            return (
              <StepperStep
                key={step.index}
                step={step}
                isFirst={index === 0}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isDisabled={isDisabled}
                connectorActive={connectorActive}
                onClick={() => onStepChange(step.index)}
              />
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

interface StepperItemProps {
  step: StepperStep;
  isFirst: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isDisabled: boolean;
  connectorActive: boolean;
  onClick: () => void;
}

function StepperStep({
  step,
  isFirst,
  isCompleted,
  isCurrent,
  isDisabled,
  connectorActive,
  onClick,
}: StepperItemProps) {
  const isDone = isCompleted || isCurrent;

  return (
    <li className="relative flex min-w-36 flex-1 justify-center">
      {!isFirst ? <StepperConnector active={connectorActive} /> : null}
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'relative z-10 flex w-full flex-col items-center text-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
          isDisabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-full border text-sm font-semibold',
            isDone && 'border-primary bg-primary text-white',
            !isDone && 'border-gray-300 bg-gray-100 text-gray-400'
          )}
        >
          {step.index}
        </span>
        <span
          className={cn(
            'mt-2 text-sm font-medium',
            isDone ? 'text-primary' : 'text-gray-400'
          )}
        >
          {step.label}
        </span>
      </button>
    </li>
  );
}

function StepperConnector({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-5 -left-1/2 h-0 w-full -translate-y-1/2',
        active ? 'border-t-2 border-primary' : 'border-t-2 border-dashed border-gray-300'
      )}
    />
  );
}

export const ProjectSubmissionStepper = Object.assign(Root, {
  StepperStep,
  StepperConnector,
});

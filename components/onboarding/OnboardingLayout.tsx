import { ReactNode } from 'react';
import { ONBOARDING_STEPS } from '@/lib/constants/onboarding';

interface OnboardingLayoutProps {
  currentStep: number;
  children: ReactNode;
}

export function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  const progress = (currentStep / ONBOARDING_STEPS.length) * 100;
  const stepInfo = ONBOARDING_STEPS.find((s) => s.step === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome to praav.uk
          </h1>
          <p className="text-muted-foreground">
            Let&apos;s set up your seller profile
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </p>
            <p className="text-sm font-medium">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {stepInfo && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">{stepInfo.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {stepInfo.description}
              </p>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-lg border shadow-sm p-6 md:p-8">
          {children}
        </div>

        {/* Steps Overview */}
        <div className="mt-8 grid grid-cols-4 gap-2">
          {ONBOARDING_STEPS.map((step) => (
            <div
              key={step.step}
              className={`text-center p-3 rounded-lg border transition-colors ${
                step.step === currentStep
                  ? 'bg-accent text-accent-foreground border-accent'
                  : step.step < currentStep
                  ? 'bg-muted border-muted'
                  : 'bg-card border-border'
              }`}
            >
              <div className="text-xs font-medium">Step {step.step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

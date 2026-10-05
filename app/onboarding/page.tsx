import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getSellerCategories, getSellerSizes } from '@/lib/supabase/profile-actions';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Step1BasicInfo } from '@/components/onboarding/Step1BasicInfo';
import { Step2Location } from '@/components/onboarding/Step2Location';
import { Step3Preferences } from '@/components/onboarding/Step3Preferences';
import { Step4Complete } from '@/components/onboarding/Step4Complete';

interface OnboardingPageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/signup');
  }

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  // Get profile
  const profileResult = await getProfile();

  if (profileResult.error || !profileResult.profile) {
    redirect('/signup');
  }

  const profile = profileResult.profile;

  // If already completed onboarding, redirect to marketplace
  if (profile.onboarding_completed) {
    redirect('/marketplace');
  }

  // Get current step from query params or profile
  const params = await searchParams;
  const stepParam = params.step;
  const currentStep = stepParam ? parseInt(stepParam, 10) : profile.onboarding_step || 1;

  // Validate step number
  if (currentStep < 1 || currentStep > 4) {
    redirect('/onboarding?step=1');
  }

  // Load additional data for step 4
  let categories: any[] = [];
  let sizes: string[] = [];

  if (currentStep === 4) {
    const categoriesResult = await getSellerCategories();
    if (categoriesResult.categories) {
      categories = categoriesResult.categories.map((sc: any) => sc.categories);
    }

    const sizesResult = await getSellerSizes();
    if (sizesResult.sizes) {
      sizes = sizesResult.sizes.map((ss: any) => ss.size);
    }
  }

  // Load category IDs and sizes for step 3
  let initialCategoryIds: string[] = [];
  let initialSizes: string[] = [];

  if (currentStep === 3) {
    const categoriesResult = await getSellerCategories();
    if (categoriesResult.categories) {
      initialCategoryIds = categoriesResult.categories.map((sc: any) => sc.category_id);
    }

    const sizesResult = await getSellerSizes();
    if (sizesResult.sizes) {
      initialSizes = sizesResult.sizes.map((ss: any) => ss.size);
    }
  }

  return (
    <OnboardingLayout currentStep={currentStep}>
      {currentStep === 1 && (
        <Step1BasicInfo
          userId={user.id}
          initialData={{
            avatar_url: profile.avatar_url,
            display_name: profile.display_name,
            username: profile.username,
            bio: profile.bio,
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2Location
          initialData={{
            city: profile.city,
            postcode: profile.postcode,
            address_line_1: profile.address_line_1,
            address_line_2: profile.address_line_2,
          }}
        />
      )}

      {currentStep === 3 && (
        <Step3Preferences
          initialCategories={initialCategoryIds}
          initialSizes={initialSizes}
        />
      )}

      {currentStep === 4 && (
        <Step4Complete
          profile={{
            avatar_url: profile.avatar_url,
            display_name: profile.display_name,
            username: profile.username,
            bio: profile.bio,
            city: profile.city,
            postcode: profile.postcode,
          }}
          categories={categories}
          sizes={sizes}
        />
      )}
    </OnboardingLayout>
  );
}

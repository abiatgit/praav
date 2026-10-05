'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, Tag, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  getCategories,
  updateSellerCategories,
  updateSellerSizes,
  updateOnboardingStep,
} from '@/lib/supabase/profile-actions';
import { ALL_SIZES } from '@/lib/constants/onboarding';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Step3PreferencesProps {
  initialCategories?: string[];
  initialSizes?: string[];
}

export function Step3Preferences({ initialCategories = [], initialSizes = [] }: Step3PreferencesProps) {
  const router = useRouter();

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Sizes state
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const result = await getCategories();
        if (result.categories) {
          setCategories(result.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleBack = () => {
    router.push('/onboarding?step=2');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSaveAndContinue = async () => {
    setSaveError(null);

    // Validate at least one category
    if (selectedCategories.length === 0) {
      setSaveError('Please select at least one category');
      return;
    }

    setIsSaving(true);

    try {
      // Update categories
      const categoryResult = await updateSellerCategories(selectedCategories);
      if (categoryResult.error) {
        setSaveError(categoryResult.error);
        setIsSaving(false);
        return;
      }

      // Update sizes (optional)
      if (selectedSizes.length > 0) {
        const sizeResult = await updateSellerSizes(selectedSizes);
        if (sizeResult.error) {
          setSaveError(sizeResult.error);
          setIsSaving(false);
          return;
        }
      }

      // Update onboarding step
      await updateOnboardingStep(4);

      // Navigate to step 4
      router.push('/onboarding?step=4');
    } catch (error) {
      setSaveError('Failed to save preferences. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = selectedCategories.length > 0;

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-accent" />
          <div>
            <Label className="text-base font-semibold">
              Categories <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              What types of items do you usually sell? (Select at least 1)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Button
                key={category.id}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                className="h-auto min-h-[72px] py-3 px-4 justify-start text-left"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <span className="font-medium text-sm leading-tight">{category.name}</span>
                  {category.description && (
                    <span className="text-xs opacity-80 line-clamp-2 leading-tight">
                      {category.description}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Selected {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
        </p>
      </div>

      {/* Sizes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-accent" />
          <div>
            <Label className="text-base font-semibold">Sizes (Optional)</Label>
            <p className="text-xs text-muted-foreground mt-1">
              What sizes do you typically sell? This helps buyers find your items.
            </p>
          </div>
        </div>

        {/* UK Women's Sizes */}
        <div className="space-y-3">
          <p className="text-sm font-medium">UK Women&apos;s Sizes</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {ALL_SIZES.filter((size) => size.startsWith('UK')).map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <Button
                  key={size}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="h-9"
                  onClick={() => toggleSize(size)}
                >
                  {size.replace('UK ', '')}
                </Button>
              );
            })}
          </div>
        </div>

        {/* UK Men's Sizes */}
        <div className="space-y-3">
          <p className="text-sm font-medium">UK Men&apos;s / Unisex Sizes</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-7 gap-2">
            {ALL_SIZES.filter((size) => ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(size)).map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <Button
                  key={size}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="h-9"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Special Sizes */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Special Sizes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_SIZES.filter((size) => ['Free Size', 'One Size', 'Custom'].includes(size)).map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <Button
                  key={size}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="h-9"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </Button>
              );
            })}
          </div>
        </div>

        {selectedSizes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected {selectedSizes.length} {selectedSizes.length === 1 ? 'size' : 'sizes'}
          </p>
        )}
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={isSaving}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSaveAndContinue}
          disabled={!isFormValid || isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </div>
    </div>
  );
}

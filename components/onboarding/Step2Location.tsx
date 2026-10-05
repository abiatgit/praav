'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, updateOnboardingStep } from '@/lib/supabase/profile-actions';

interface Step2LocationProps {
  initialData?: {
    city?: string | null;
    postcode?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
  };
}

export function Step2Location({ initialData }: Step2LocationProps) {
  const router = useRouter();

  // Form state
  const [city, setCity] = useState(initialData?.city || '');
  const [postcode, setPostcode] = useState(initialData?.postcode || '');
  const [addressLine1, setAddressLine1] = useState(initialData?.address_line_1 || '');
  const [addressLine2, setAddressLine2] = useState(initialData?.address_line_2 || '');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/onboarding?step=1');
  };

  const handleSaveAndContinue = async () => {
    setSaveError(null);

    // Validate required fields
    if (!city.trim()) {
      setSaveError('City is required');
      return;
    }

    if (!postcode.trim()) {
      setSaveError('Postcode is required');
      return;
    }

    setIsSaving(true);

    try {
      // Update profile
      const result = await updateProfile({
        city: city.trim(),
        postcode: postcode.trim().toUpperCase(),
        address_line_1: addressLine1.trim() || null,
        address_line_2: addressLine2.trim() || null,
        country: 'United Kingdom',
      });

      if (result.error) {
        setSaveError(result.error);
        return;
      }

      // Update onboarding step
      await updateOnboardingStep(3);

      // Navigate to step 3
      router.push('/onboarding?step=3');
    } catch (error) {
      setSaveError('Failed to save location. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = city.trim() && postcode.trim();

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="p-4 rounded-lg bg-muted border border-border">
        <div className="flex gap-3">
          <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Your privacy matters</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your full address is private and will never be shown publicly. Only your city
              will be visible to buyers to help them find local sellers.
            </p>
          </div>
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">
          City <span className="text-destructive">*</span>
        </Label>
        <Input
          id="city"
          type="text"
          placeholder="e.g., London"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          This will be shown on your public profile
        </p>
      </div>

      {/* Postcode */}
      <div className="space-y-2">
        <Label htmlFor="postcode">
          Postcode <span className="text-destructive">*</span>
        </Label>
        <Input
          id="postcode"
          type="text"
          placeholder="e.g., SW1A 1AA"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          maxLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">
          UK postcode format
        </p>
      </div>

      {/* Address Line 1 */}
      <div className="space-y-2">
        <Label htmlFor="address_line_1">Address Line 1 (Optional)</Label>
        <Input
          id="address_line_1"
          type="text"
          placeholder="Street address, P.O. box"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          For future shipping features - completely private
        </p>
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
        <Input
          id="address_line_2"
          type="text"
          placeholder="Apartment, suite, unit, building, floor, etc."
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isSaving}
        >
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

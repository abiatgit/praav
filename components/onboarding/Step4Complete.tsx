'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ChevronLeft, User, MapPin, Tag, Ruler, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { completeOnboarding } from '@/lib/supabase/profile-actions';

interface Step4CompleteProps {
  profile: {
    avatar_url?: string | null;
    display_name?: string | null;
    username?: string | null;
    bio?: string | null;
    city?: string | null;
    postcode?: string | null;
  };
  categories?: Array<{ name: string }>;
  sizes?: string[];
}

export function Step4Complete({ profile, categories = [], sizes = [] }: Step4CompleteProps) {
  const router = useRouter();

  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/onboarding?step=3');
  };

  const handleComplete = async () => {
    setCompleteError(null);
    setIsCompleting(true);

    try {
      const result = await completeOnboarding();

      if (result.error) {
        setCompleteError(result.error);
        setIsCompleting(false);
        return;
      }

      // Navigate to marketplace
      router.push('/marketplace');
    } catch (error) {
      setCompleteError('Failed to complete onboarding. Please try again.');
      console.error('Complete error:', error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Message */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-xl font-semibold mb-2">You&apos;re almost done!</h3>
        <p className="text-muted-foreground">
          Review your profile and click complete to start selling
        </p>
      </div>

      {/* Profile Preview */}
      <div className="space-y-6 p-6 rounded-lg border bg-muted/30">
        {/* Avatar & Name */}
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Profile avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-xl font-semibold truncate">
                {profile.display_name || 'No name set'}
              </h3>
              <span className="text-sm text-muted-foreground">
                @{profile.username || 'username'}
              </span>
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <Label className="text-sm font-medium">Location</Label>
          </div>
          <p className="text-sm pl-6">
            {profile.city || 'No city set'}
            {profile.postcode && ` • ${profile.postcode}`}
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <Label className="text-sm font-medium">Categories</Label>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ruler className="h-4 w-4" />
              <Label className="text-sm font-medium">Sizes I sell</Label>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {sizes.slice(0, 10).map((size, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border"
                >
                  {size}
                </span>
              ))}
              {sizes.length > 10 && (
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs text-muted-foreground">
                  +{sizes.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-lg bg-muted border border-border">
        <p className="text-sm text-muted-foreground">
          You can edit all of this information later in your profile settings.
        </p>
      </div>

      {/* Error Message */}
      {completeError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{completeError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={isCompleting}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleComplete} disabled={isCompleting} size="lg">
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

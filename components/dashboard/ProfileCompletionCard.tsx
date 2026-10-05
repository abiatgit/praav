import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileCompletionCardProps {
  percentage: number;
  profile: {
    avatar_url?: string | null;
    display_name?: string | null;
    username?: string | null;
    bio?: string | null;
    city?: string | null;
    postcode?: string | null;
  };
}

export function ProfileCompletionCard({ percentage, profile }: ProfileCompletionCardProps) {
  const missingFields = [];

  if (!profile.avatar_url) missingFields.push('Profile photo');
  if (!profile.display_name) missingFields.push('Display name');
  if (!profile.username) missingFields.push('Username');
  if (!profile.bio) missingFields.push('Bio');
  if (!profile.city) missingFields.push('City');
  if (!profile.postcode) missingFields.push('Postcode');

  return (
    <div className="p-3 sm:p-4 rounded-lg border bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            {percentage === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-accent" />
            )}
            <h3 className="font-semibold text-sm sm:text-base">
              {percentage === 100
                ? 'Profile Complete!'
                : 'Complete Your Profile'}
            </h3>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">
                  {percentage}% complete
                </p>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {missingFields.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Add: {missingFields.join(', ')}
              </p>
            )}
          </div>
        </div>

        <Button size="sm" asChild className="w-full sm:w-auto">
          <Link href="/settings">Complete</Link>
        </Button>
      </div>
    </div>
  );
}

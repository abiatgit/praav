'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, User, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateProfile, checkUsernameAvailable, updateOnboardingStep } from '@/lib/supabase/profile-actions';
import { uploadAvatar, compressImage } from '@/lib/utils/upload';
import {
  USERNAME_REGEX,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
} from '@/lib/constants/onboarding';

interface Step1BasicInfoProps {
  userId: string;
  initialData?: {
    avatar_url?: string | null;
    display_name?: string | null;
    username?: string | null;
    bio?: string | null;
  };
}

export function Step1BasicInfo({ userId, initialData }: Step1BasicInfoProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '');
  const [displayName, setDisplayName] = useState(initialData?.display_name || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [bio, setBio] = useState(initialData?.bio || '');

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Username validation state
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Debounced username check
  useEffect(() => {
    if (!username) {
      setUsernameError(null);
      setUsernameAvailable(null);
      return;
    }

    // Validate format
    if (username.length < USERNAME_MIN_LENGTH) {
      setUsernameError(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
      setUsernameAvailable(null);
      return;
    }

    if (username.length > USERNAME_MAX_LENGTH) {
      setUsernameError(`Username must be less than ${USERNAME_MAX_LENGTH} characters`);
      setUsernameAvailable(null);
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setUsernameError('Username can only contain lowercase letters, numbers, hyphens, and underscores');
      setUsernameAvailable(null);
      return;
    }

    setUsernameError(null);

    // Check availability
    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { available } = await checkUsernameAvailable(username);
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('This username is already taken');
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Compress image first
      const compressedFile = await compressImage(file);

      // Upload to Supabase
      const result = await uploadAvatar(compressedFile, userId);

      if (result.error) {
        setUploadError(result.error);
      } else if (result.url) {
        setAvatarUrl(result.url);
        // Save avatar URL immediately
        await updateProfile({ avatar_url: result.url });
      }
    } catch (error) {
      setUploadError('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaveError(null);

    // Validate required fields
    if (!displayName.trim()) {
      setSaveError('Display name is required');
      return;
    }

    if (!username.trim()) {
      setSaveError('Username is required');
      return;
    }

    if (usernameError || !usernameAvailable) {
      setSaveError('Please fix the username error before continuing');
      return;
    }

    setIsSaving(true);

    try {
      // Update profile
      const result = await updateProfile({
        display_name: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      });

      if (result.error) {
        setSaveError(result.error);
        return;
      }

      // Update onboarding step
      await updateOnboardingStep(2);

      // Navigate to step 2
      router.push('/onboarding?step=2');
    } catch (error) {
      setSaveError('Failed to save profile. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = displayName.trim() && username.trim() && usernameAvailable && !usernameError;

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-muted border-2 border-border">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            variant="default"
            className="absolute bottom-0 right-0 rounded-full shadow-lg"
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WebP. Max 5MB.
          </p>
          {uploadError && (
            <p className="text-xs text-destructive mt-1">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="display_name">
          Display Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="display_name"
          type="text"
          placeholder="e.g., Priya Sharma"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground">
          This is how buyers will see your name
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            @
          </div>
          <Input
            id="username"
            type="text"
            placeholder="yourusername"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="pl-7 pr-10"
            maxLength={USERNAME_MAX_LENGTH}
            required
          />
          {username && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCheckingUsername ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : usernameAvailable ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : usernameError ? (
                <X className="h-4 w-4 text-destructive" />
              ) : null}
            </div>
          )}
        </div>
        {usernameError ? (
          <p className="text-xs text-destructive">{usernameError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Your profile will be at praav.uk/@{username || 'yourusername'}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Short Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder="Tell buyers a bit about yourself and what you sell..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={BIO_MAX_LENGTH}
          rows={4}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            A short description for your profile
          </p>
          <p className="text-xs text-muted-foreground">
            {bio.length}/{BIO_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4">
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

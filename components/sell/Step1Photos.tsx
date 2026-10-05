'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Star, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { LISTING_VALIDATION, type ImagePreview } from '@/lib/types/listing';

interface Step1PhotosProps {
  initialImages?: ImagePreview[];
  onImagesChange: (images: ImagePreview[], coverIndex: number) => void;
  onNext: () => void;
}

export function Step1Photos({ initialImages = [], onImagesChange, onNext }: Step1PhotosProps) {
  const router = useRouter();
  const [images, setImages] = useState<ImagePreview[]>(initialImages);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!LISTING_VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WebP image';
    }

    if (file.size > LISTING_VALIDATION.IMAGE_MAX_SIZE) {
      return `Image must be less than ${LISTING_VALIDATION.IMAGE_MAX_SIZE / 1024 / 1024}MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      setUploadError(null);

      const newFiles = Array.from(files);

      // Check total count
      if (images.length + newFiles.length > LISTING_VALIDATION.MAX_IMAGES) {
        setUploadError(
          `You can only upload up to ${LISTING_VALIDATION.MAX_IMAGES} images`
        );
        return;
      }

      // Validate and create previews
      const validImages: ImagePreview[] = [];

      for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
          setUploadError(error);
          return;
        }

        const preview = URL.createObjectURL(file);
        validImages.push({
          file,
          preview,
          id: `${Date.now()}-${Math.random()}`,
        });
      }

      const updatedImages = [...images, ...validImages];
      setImages(updatedImages);
      onImagesChange(updatedImages, coverImageIndex);
    },
    [images, coverImageIndex, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

    // Adjust cover index if needed
    let newCoverIndex = coverImageIndex;
    if (index === coverImageIndex) {
      newCoverIndex = 0;
    } else if (index < coverImageIndex) {
      newCoverIndex = coverImageIndex - 1;
    }
    setCoverImageIndex(newCoverIndex);

    onImagesChange(updatedImages, newCoverIndex);

    // Revoke object URL
    URL.revokeObjectURL(images[index].preview);
  };

  const setCoverImage = (index: number) => {
    setCoverImageIndex(index);
    onImagesChange(images, index);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setImages(updatedImages);

    // Adjust cover index
    let newCoverIndex = coverImageIndex;
    if (fromIndex === coverImageIndex) {
      newCoverIndex = toIndex;
    } else if (fromIndex < coverImageIndex && toIndex >= coverImageIndex) {
      newCoverIndex = coverImageIndex - 1;
    } else if (fromIndex > coverImageIndex && toIndex <= coverImageIndex) {
      newCoverIndex = coverImageIndex + 1;
    }
    setCoverImageIndex(newCoverIndex);

    onImagesChange(updatedImages, newCoverIndex);
  };

  const handleNext = () => {
    if (images.length === 0) {
      setUploadError('Please add at least one photo');
      return;
    }

    onNext();
  };

  const isFormValid = images.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Add Photos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add up to {LISTING_VALIDATION.MAX_IMAGES} photos. The first photo will be your
          cover image.
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Photos <span className="text-destructive">*</span>
        </Label>

        {images.length < LISTING_VALIDATION.MAX_IMAGES && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drag and drop your photos here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or WebP (max {LISTING_VALIDATION.IMAGE_MAX_SIZE / 1024 / 1024}MB
                  each)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept={LISTING_VALIDATION.ALLOWED_IMAGE_TYPES.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {images.length} of {LISTING_VALIDATION.MAX_IMAGES} photos
              </p>
              <p className="text-xs text-muted-foreground">
                <Star className="h-3 w-3 inline mr-1" />
                Tap star to set cover photo
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor:
                      index === coverImageIndex
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--border))',
                  }}
                >
                  <Image
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCoverImage(index)}
                      className="h-8"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          index === coverImageIndex ? 'fill-current' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Cover Badge */}
                  {index === coverImageIndex && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Cover
                    </div>
                  )}

                  {/* Position Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mt-3">No photos yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Cancel
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid} size="lg">
          Next: Item Details
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

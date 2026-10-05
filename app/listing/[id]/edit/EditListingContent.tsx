'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { updateListing, uploadListingImage, addListingImages, deleteListingImage } from '@/lib/supabase/listing-actions';
import { LISTING_CONDITIONS, LISTING_VALIDATION } from '@/lib/types/listing';
import type { ListingWithDetails, Category } from '@/lib/types/listing';

interface EditListingContentProps {
  listing: ListingWithDetails;
  categories: Category[];
}

interface ExistingImage {
  id: string;
  url: string;
  isCover: boolean;
  displayOrder: number;
}

interface NewImage {
  file: File;
  preview: string;
  tempId: string;
}

export default function EditListingContent({ listing, categories }: EditListingContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing images from the listing
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    listing.images.map((img) => ({
      id: img.id,
      url: img.image_url,
      isCover: img.is_cover,
      displayOrder: img.display_order,
    }))
  );

  // New images to upload
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    title: listing.title,
    category_id: listing.category_id,
    price: listing.price,
    size: listing.size || '',
    condition: listing.condition,
    description: listing.description || '',
    brand: listing.brand || '',
    colour: listing.colour || '',
    fabric: listing.fabric || '',
    occasion: listing.occasion || '',
    original_price: listing.original_price || '',
    purchase_year: listing.purchase_year || '',
    damage_description: listing.damage_description || '',
    measurement_unit: listing.measurement_unit || 'cm',
    bust: listing.bust || '',
    waist: listing.waist || '',
    hip: listing.hip || '',
    length: listing.length || '',
    sleeve_length: listing.sleeve_length || '',
  });

  const totalImages = existingImages.length + newImages.length;
  const coverImageIndex = existingImages.findIndex((img) => img.isCover);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = LISTING_VALIDATION.MAX_IMAGES - totalImages;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const validFiles: NewImage[] = [];

    for (const file of filesToAdd) {
      if (!LISTING_VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}`);
        continue;
      }

      if (file.size > LISTING_VALIDATION.IMAGE_MAX_SIZE) {
        setError(`File too large: ${file.name}`);
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        tempId: `new-${Date.now()}-${Math.random()}`,
      });
    }

    setNewImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const removeExistingImage = async (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (tempId: string) => {
    setNewImages((prev) => {
      const img = prev.find((i) => i.tempId === tempId);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.tempId !== tempId);
    });
  };

  const setCoverImage = (index: number) => {
    setExistingImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (totalImages === 0) {
        setError('Please add at least one image');
        setIsSubmitting(false);
        return;
      }

      if (!formData.title || !formData.category_id || !formData.price || !formData.condition) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Update listing basic data
      const updateResult = await updateListing(listing.id, {
        title: formData.title,
        category_id: formData.category_id,
        price: Number(formData.price),
        size: formData.size || null,
        condition: formData.condition,
        description: formData.description || null,
        brand: formData.brand || null,
        colour: formData.colour || null,
        fabric: formData.fabric || null,
        occasion: formData.occasion || null,
        original_price: formData.original_price ? Number(formData.original_price) : null,
        purchase_year: formData.purchase_year ? Number(formData.purchase_year) : null,
        damage_description: formData.damage_description || null,
        measurement_unit: formData.measurement_unit || null,
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hip: formData.hip ? Number(formData.hip) : null,
        length: formData.length ? Number(formData.length) : null,
        sleeve_length: formData.sleeve_length ? Number(formData.sleeve_length) : null,
      });

      if (updateResult.error) {
        setError(updateResult.error);
        setIsSubmitting(false);
        return;
      }

      // Handle image updates
      // Delete removed existing images
      const imagesToDelete = listing.images.filter(
        (img) => !existingImages.find((ei) => ei.id === img.id)
      );

      for (const img of imagesToDelete) {
        await deleteListingImage(img.id);
      }

      // Upload new images
      if (newImages.length > 0) {
        const uploadedImages = [];

        for (let i = 0; i < newImages.length; i++) {
          const newImage = newImages[i];
          const result = await uploadListingImage(
            newImage.file,
            listing.id,
            listing.seller_id
          );

          if (result.error || !result.url) {
            setError(`Failed to upload image: ${newImage.file.name}`);
            setIsSubmitting(false);
            return;
          }

          uploadedImages.push({
            url: result.url,
            storagePath: `${listing.seller_id}/${listing.id}/${newImage.file.name}`,
            displayOrder: existingImages.length + i,
            isCover: existingImages.length === 0 && i === 0,
          });
        }

        await addListingImages(listing.id, uploadedImages);
      }

      // Success! Redirect to listing page
      router.push(`/listing/${listing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/listing/${listing.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Listing</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Images Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Photos</h2>
              <p className="text-sm text-muted-foreground">
                {totalImages} of {LISTING_VALIDATION.MAX_IMAGES} photos
              </p>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Existing Images */}
              {existingImages.map((image, index) => (
                <div key={image.id} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {image.isCover && (
                    <Badge className="absolute top-2 left-2">Cover</Badge>
                  )}
                  <button
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {!image.isCover && (
                    <button
                      onClick={() => setCoverImage(index)}
                      className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-2 py-1 rounded"
                    >
                      Set as cover
                    </button>
                  )}
                </div>
              ))}

              {/* New Images */}
              {newImages.map((image, index) => (
                <div key={image.tempId} className="relative aspect-square">
                  <Image
                    src={image.preview}
                    alt={`New photo ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    New
                  </Badge>
                  <button
                    onClick={() => removeNewImage(image.tempId)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {totalImages < LISTING_VALIDATION.MAX_IMAGES && (
                <div>
                  <input
                    id="file-upload-edit"
                    type="file"
                    multiple
                    accept={LISTING_VALIDATION.ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('file-upload-edit')?.click()}
                    className="aspect-square w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add Photos</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Details Form */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Details</h2>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={LISTING_VALIDATION.TITLE_MAX_LENGTH}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (£) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Condition <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Size and Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href={`/listing/${listing.id}`} className="flex-1">
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

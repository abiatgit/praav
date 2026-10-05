'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { LISTING_CONDITIONS, type ListingFormData } from '@/lib/types/listing';
import { createListing, uploadListingImage, addListingImages, publishListing } from '@/lib/supabase/listing-actions';

interface Category {
  id: string;
  name: string;
}

interface Step3ReviewProps {
  formData: Partial<ListingFormData>;
  categories: Category[];
  onBack: () => void;
}

export function Step3Review({ formData, categories, onBack }: Step3ReviewProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = categories.find((c) => c.id === formData.category_id);
  const condition = LISTING_CONDITIONS.find((c) => c.value === formData.condition);

  const handlePublish = async () => {
    await handleSubmit(true);
  };

  const handleSaveDraft = async () => {
    await handleSubmit(false);
  };

  const handleSubmit = async (publish: boolean) => {
    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }
    setError(null);

    try {
      // 1. Create listing
      const listingData = {
        title: formData.title!,
        description: formData.description || undefined,
        category_id: formData.category_id!,
        size: formData.size || undefined,
        condition: formData.condition!,
        price: parseFloat(formData.price!),
        currency: 'GBP' as const,
        brand: formData.brand || undefined,
        colour: formData.colour || undefined,
        fabric: formData.fabric || undefined,
        occasion: formData.occasion || undefined,
        damage_description: formData.damage_description || undefined,
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        purchase_year: formData.purchase_year ? parseInt(formData.purchase_year) : undefined,
        measurement_unit: formData.measurement_unit || undefined,
        bust: formData.bust ? parseFloat(formData.bust) : undefined,
        waist: formData.waist ? parseFloat(formData.waist) : undefined,
        hip: formData.hip ? parseFloat(formData.hip) : undefined,
        length: formData.length ? parseFloat(formData.length) : undefined,
        sleeve_length: formData.sleeve_length ? parseFloat(formData.sleeve_length) : undefined,
      };

      const createResult = await createListing(listingData);

      if (createResult.error || !createResult.listing) {
        throw new Error(createResult.error || 'Failed to create listing');
      }

      const listingId = createResult.listing.id;
      const userId = createResult.listing.seller_id;

      // 2. Upload images
      if (formData.images && formData.images.length > 0) {
        const imageUploads = formData.images.map(async (image, index) => {
          const uploadResult = await uploadListingImage(image.file, listingId, userId);

          if (uploadResult.error || !uploadResult.url) {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }

          return {
            url: uploadResult.url,
            storagePath: `${userId}/${listingId}/${image.file.name}`,
            displayOrder: index,
            isCover: index === (formData.coverImageIndex || 0),
          };
        });

        const uploadedImages = await Promise.all(imageUploads);

        // 3. Add image records to database
        const imagesResult = await addListingImages(listingId, uploadedImages);

        if (imagesResult.error) {
          throw new Error(imagesResult.error);
        }
      }

      // 4. Publish if requested
      if (publish) {
        const publishResult = await publishListing(listingId);

        if (publishResult.error) {
          throw new Error(publishResult.error);
        }
      }

      // 5. Redirect to dashboard to view listing
      router.push('/dashboard?listing=created');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Review Your Listing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check everything looks good before publishing
        </p>
      </div>

      {/* Images Preview */}
      {formData.images && formData.images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Photos ({formData.images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {formData.images.map((image, index) => (
              <div
                key={image.id || index}
                className="relative aspect-square rounded-lg overflow-hidden border-2"
                style={{
                  borderColor:
                    index === (formData.coverImageIndex || 0)
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
                {index === (formData.coverImageIndex || 0) && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Item Details</h3>
        <div className="border rounded-lg divide-y">
          {/* Title */}
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-sm text-muted-foreground">Title</div>
            <div className="col-span-2 text-sm font-medium">{formData.title}</div>
          </div>

          {/* Category */}
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-sm text-muted-foreground">Category</div>
            <div className="col-span-2 text-sm">{category?.name}</div>
          </div>

          {/* Size */}
          {formData.size && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Size</div>
              <div className="col-span-2 text-sm">{formData.size}</div>
            </div>
          )}

          {/* Condition */}
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-sm text-muted-foreground">Condition</div>
            <div className="col-span-2 text-sm">{condition?.label}</div>
          </div>

          {/* Damage Description */}
          {formData.damage_description && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Damage</div>
              <div className="col-span-2 text-sm">{formData.damage_description}</div>
            </div>
          )}

          {/* Price */}
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="col-span-2 text-sm font-semibold">
              £{parseFloat(formData.price || '0').toFixed(2)}
            </div>
          </div>

          {/* Description */}
          {formData.description && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="col-span-2 text-sm whitespace-pre-wrap">
                {formData.description}
              </div>
            </div>
          )}

          {/* Brand */}
          {formData.brand && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Brand</div>
              <div className="col-span-2 text-sm">{formData.brand}</div>
            </div>
          )}

          {/* Colour */}
          {formData.colour && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Colour</div>
              <div className="col-span-2 text-sm">{formData.colour}</div>
            </div>
          )}

          {/* Fabric */}
          {formData.fabric && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Fabric</div>
              <div className="col-span-2 text-sm">{formData.fabric}</div>
            </div>
          )}

          {/* Occasion */}
          {formData.occasion && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Occasion</div>
              <div className="col-span-2 text-sm">{formData.occasion}</div>
            </div>
          )}

          {/* Original Price */}
          {formData.original_price && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Original Price</div>
              <div className="col-span-2 text-sm">
                £{parseFloat(formData.original_price).toFixed(2)}
              </div>
            </div>
          )}

          {/* Purchase Year */}
          {formData.purchase_year && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Purchase Year</div>
              <div className="col-span-2 text-sm">{formData.purchase_year}</div>
            </div>
          )}
        </div>
      </div>

      {/* Measurements */}
      {formData.measurement_unit && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Measurements ({formData.measurement_unit})</h3>
          <div className="border rounded-lg divide-y">
            {formData.bust && (
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Bust</div>
                <div className="col-span-2 text-sm">
                  {formData.bust} {formData.measurement_unit}
                </div>
              </div>
            )}
            {formData.waist && (
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Waist</div>
                <div className="col-span-2 text-sm">
                  {formData.waist} {formData.measurement_unit}
                </div>
              </div>
            )}
            {formData.hip && (
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Hip</div>
                <div className="col-span-2 text-sm">
                  {formData.hip} {formData.measurement_unit}
                </div>
              </div>
            )}
            {formData.length && (
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Length</div>
                <div className="col-span-2 text-sm">
                  {formData.length} {formData.measurement_unit}
                </div>
              </div>
            )}
            {formData.sleeve_length && (
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Sleeve</div>
                <div className="col-span-2 text-sm">
                  {formData.sleeve_length} {formData.measurement_unit}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isPublishing || isSavingDraft}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isPublishing || isSavingDraft}
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || isSavingDraft}
            size="lg"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Publish Listing
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

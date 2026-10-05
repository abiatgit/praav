'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
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
import { getCategories } from '@/lib/supabase/profile-actions';
import {
  LISTING_CONDITIONS,
  COMMON_COLORS,
  COMMON_FABRICS,
  COMMON_OCCASIONS,
  MEASUREMENT_UNITS,
  LISTING_VALIDATION,
  type ListingCondition,
  type MeasurementUnit,
  type ListingFormData,
} from '@/lib/types/listing';
import { ALL_SIZES } from '@/lib/constants/onboarding';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Step2DetailsProps {
  formData: Partial<ListingFormData>;
  onFormDataChange: (data: Partial<ListingFormData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step2Details({
  formData,
  onFormDataChange,
  onBack,
  onNext,
}: Step2DetailsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories();
      if (result.categories) {
        setCategories(result.categories);
      }
    }
    loadCategories();
  }, []);

  const updateField = (field: keyof ListingFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title || formData.title.trim().length < LISTING_VALIDATION.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${LISTING_VALIDATION.TITLE_MIN_LENGTH} characters`;
    }

    if (
      formData.title &&
      formData.title.length > LISTING_VALIDATION.TITLE_MAX_LENGTH
    ) {
      newErrors.title = `Title must be less than ${LISTING_VALIDATION.TITLE_MAX_LENGTH} characters`;
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select a condition';
    }

    if (!formData.price || parseFloat(formData.price) < LISTING_VALIDATION.MIN_PRICE) {
      newErrors.price = `Price must be at least £${LISTING_VALIDATION.MIN_PRICE}`;
    }

    if (formData.price && parseFloat(formData.price) > LISTING_VALIDATION.MAX_PRICE) {
      newErrors.price = `Price must be less than £${LISTING_VALIDATION.MAX_PRICE}`;
    }

    // Conditional validation
    if (
      formData.condition === 'fair' &&
      (!formData.damage_description || formData.damage_description.trim().length === 0)
    ) {
      newErrors.damage_description =
        'Please describe the damage or wear for items in fair condition';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const showDamageField = formData.condition === 'fair';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Item Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell buyers about your item
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g., Red Silk Saree with Gold Border"
            maxLength={LISTING_VALIDATION.TITLE_MAX_LENGTH}
            aria-invalid={!!errors.title}
          />
          <div className="flex justify-between">
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Be specific and descriptive
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.title?.length || 0}/{LISTING_VALIDATION.TITLE_MAX_LENGTH}
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category_id || ''}
            onValueChange={(value) => updateField('category_id', value)}
          >
            <SelectTrigger
              id="category"
              aria-invalid={!!errors.category_id}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && (
            <p className="text-xs text-destructive">{errors.category_id}</p>
          )}
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label htmlFor="size">Size (Optional)</Label>
          <Select
            value={formData.size || ''}
            onValueChange={(value) => updateField('size', value)}
          >
            <SelectTrigger id="size">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {ALL_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition">
            Condition <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.condition || ''}
            onValueChange={(value) => updateField('condition', value as ListingCondition)}
          >
            <SelectTrigger
              id="condition"
              aria-invalid={!!errors.condition}
            >
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {LISTING_CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  <div>
                    <div className="font-medium">{condition.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {condition.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-xs text-destructive">{errors.condition}</p>
          )}
        </div>

        {/* Damage Description (conditional) */}
        {showDamageField && (
          <div className="space-y-2">
            <Label htmlFor="damage_description">
              Damage Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="damage_description"
              value={formData.damage_description || ''}
              onChange={(e) => updateField('damage_description', e.target.value)}
              placeholder="Please describe any damage, stains, or wear..."
              maxLength={LISTING_VALIDATION.DAMAGE_DESCRIPTION_MAX_LENGTH}
              aria-invalid={!!errors.damage_description}
              className="min-h-20"
            />
            <div className="flex justify-between">
              {errors.damage_description ? (
                <p className="text-xs text-destructive">{errors.damage_description}</p>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Be honest about the condition to avoid returns
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.damage_description?.length || 0}/
                {LISTING_VALIDATION.DAMAGE_DESCRIPTION_MAX_LENGTH}
              </p>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Price (£) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            min={LISTING_VALIDATION.MIN_PRICE}
            max={LISTING_VALIDATION.MAX_PRICE}
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => updateField('price', e.target.value)}
            placeholder="0.00"
            aria-invalid={!!errors.price}
          />
          {errors.price ? (
            <p className="text-xs text-destructive">{errors.price}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Set a competitive price for your item
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe your item in detail..."
            maxLength={LISTING_VALIDATION.DESCRIPTION_MAX_LENGTH}
            className="min-h-32"
          />
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              Include details like fabric, fit, occasion, etc.
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.description?.length || 0}/
              {LISTING_VALIDATION.DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
        </div>
      </div>

      {/* Optional Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Optional Details</h3>
        <p className="text-sm text-muted-foreground -mt-2">
          Add more details to help buyers find your item
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand || ''}
              onChange={(e) => updateField('brand', e.target.value)}
              placeholder="e.g., Fabindia, Sabyasachi"
              maxLength={LISTING_VALIDATION.BRAND_MAX_LENGTH}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="colour">Colour</Label>
            <Select
              value={formData.colour || ''}
              onValueChange={(value) => updateField('colour', value)}
            >
              <SelectTrigger id="colour">
                <SelectValue placeholder="Select colour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {COMMON_COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fabric */}
          <div className="space-y-2">
            <Label htmlFor="fabric">Fabric</Label>
            <Select
              value={formData.fabric || ''}
              onValueChange={(value) => updateField('fabric', value)}
            >
              <SelectTrigger id="fabric">
                <SelectValue placeholder="Select fabric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {COMMON_FABRICS.map((fabric) => (
                  <SelectItem key={fabric} value={fabric}>
                    {fabric}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occasion */}
          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Select
              value={formData.occasion || ''}
              onValueChange={(value) => updateField('occasion', value)}
            >
              <SelectTrigger id="occasion">
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {COMMON_OCCASIONS.map((occasion) => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Original Price */}
          <div className="space-y-2">
            <Label htmlFor="original_price">Original Price (£)</Label>
            <Input
              id="original_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.original_price || ''}
              onChange={(e) => updateField('original_price', e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Purchase Year */}
          <div className="space-y-2">
            <Label htmlFor="purchase_year">Purchase Year</Label>
            <Input
              id="purchase_year"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.purchase_year || ''}
              onChange={(e) => updateField('purchase_year', e.target.value)}
              placeholder={new Date().getFullYear().toString()}
            />
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Measurements (Optional)</h3>
        <p className="text-sm text-muted-foreground -mt-2">
          Provide measurements to help buyers ensure the right fit
        </p>

        {/* Measurement Unit */}
        <div className="space-y-2">
          <Label htmlFor="measurement_unit">Unit</Label>
          <Select
            value={formData.measurement_unit || ''}
            onValueChange={(value) =>
              updateField('measurement_unit', value as MeasurementUnit)
            }
          >
            <SelectTrigger id="measurement_unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {MEASUREMENT_UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.measurement_unit && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Bust */}
            <div className="space-y-2">
              <Label htmlFor="bust">Bust</Label>
              <Input
                id="bust"
                type="number"
                min="0"
                step="0.1"
                value={formData.bust || ''}
                onChange={(e) => updateField('bust', e.target.value)}
                placeholder="0.0"
              />
            </div>

            {/* Waist */}
            <div className="space-y-2">
              <Label htmlFor="waist">Waist</Label>
              <Input
                id="waist"
                type="number"
                min="0"
                step="0.1"
                value={formData.waist || ''}
                onChange={(e) => updateField('waist', e.target.value)}
                placeholder="0.0"
              />
            </div>

            {/* Hip */}
            <div className="space-y-2">
              <Label htmlFor="hip">Hip</Label>
              <Input
                id="hip"
                type="number"
                min="0"
                step="0.1"
                value={formData.hip || ''}
                onChange={(e) => updateField('hip', e.target.value)}
                placeholder="0.0"
              />
            </div>

            {/* Length */}
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.1"
                value={formData.length || ''}
                onChange={(e) => updateField('length', e.target.value)}
                placeholder="0.0"
              />
            </div>

            {/* Sleeve Length */}
            <div className="space-y-2">
              <Label htmlFor="sleeve_length">Sleeve</Label>
              <Input
                id="sleeve_length"
                type="number"
                min="0"
                step="0.1"
                value={formData.sleeve_length || ''}
                onChange={(e) => updateField('sleeve_length', e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Next: Review
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

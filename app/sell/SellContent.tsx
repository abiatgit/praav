'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Step1Photos } from '@/components/sell/Step1Photos';
import { Step2Details } from '@/components/sell/Step2Details';
import { Step3Review } from '@/components/sell/Step3Review';
import type { ListingFormData, ImagePreview } from '@/lib/types/listing';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SellContentProps {
  categories: Category[];
}

const STEPS = [
  { number: 1, title: 'Photos', description: 'Add photos of your item' },
  { number: 2, title: 'Details', description: 'Describe your item' },
  { number: 3, title: 'Review', description: 'Review and publish' },
];

export default function SellContent({ categories }: SellContentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ListingFormData>>({
    images: [],
    coverImageIndex: 0,
    title: '',
    description: '',
    category_id: '',
    size: '',
    condition: undefined,
    price: '',
    brand: '',
    colour: '',
    fabric: '',
    occasion: '',
    damage_description: '',
    original_price: '',
    purchase_year: '',
    measurement_unit: undefined,
    bust: '',
    waist: '',
    hip: '',
    length: '',
    sleeve_length: '',
  });

  const handleImagesChange = (images: ImagePreview[], coverIndex: number) => {
    setFormData({
      ...formData,
      images,
      coverImageIndex: coverIndex,
    });
  };

  const handleFormDataChange = (data: Partial<ListingFormData>) => {
    setFormData(data);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/praavlogo.png"
                  alt="Praav Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold">praav</span>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Marketplace</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Sell an Item</h1>
          <p className="text-muted-foreground mt-1">
            List your pre-loved Indian ethnic fashion
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-3 flex-1">
                  {/* Step Number Circle */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.number
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="hidden sm:block flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        currentStep >= step.number
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block h-0.5 flex-1 mx-4 transition-all ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <Step1Photos
            initialImages={formData.images as ImagePreview[]}
            onImagesChange={handleImagesChange}
            onNext={() => goToStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Details
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3Review
            formData={formData}
            categories={categories}
            onBack={() => goToStep(2)}
          />
        )}
      </div>
    </div>
  );
}

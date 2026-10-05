'use server';

import { createClient } from './server';
import { v4 as uuidv4 } from 'uuid';
import type {
  CreateListingData,
  UpdateListingData,
  Listing,
  ListingImage,
  ListingWithImages,
  ListingWithDetails,
} from '@/lib/types/listing';

// ============================================
// CREATE LISTING
// ============================================

export async function createListing(data: CreateListingData) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a listing' };
  }

  // Create listing
  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      ...data,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating listing:', error);
    return { error: error.message };
  }

  return { listing };
}

// ============================================
// UPLOAD LISTING IMAGES
// ============================================

interface UploadImageResult {
  url?: string;
  error?: string;
}

export async function uploadListingImage(
  file: File,
  listingId: string,
  userId: string
): Promise<UploadImageResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Please upload a JPG, PNG, or WebP image' };
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: 'Image must be less than 10MB' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${userId}/${listingId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('listing-images').getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function addListingImages(
  listingId: string,
  images: { url: string; storagePath: string; displayOrder: number; isCover: boolean }[]
) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase
    .from('listing_images')
    .insert(
      images.map((img) => ({
        listing_id: listingId,
        image_url: img.url,
        storage_path: img.storagePath,
        display_order: img.displayOrder,
        is_cover: img.isCover,
      }))
    )
    .select();

  if (error) {
    console.error('Error adding listing images:', error);
    return { error: error.message };
  }

  return { images: data };
}

// ============================================
// UPDATE LISTING
// ============================================

export async function updateListing(listingId: string, data: UpdateListingData) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update a listing' };
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update(data)
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating listing:', error);
    return { error: error.message };
  }

  return { listing };
}

// ============================================
// PUBLISH LISTING
// ============================================

export async function publishListing(listingId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to publish a listing' };
  }

  // Check if listing has at least one image
  const { data: images } = await supabase
    .from('listing_images')
    .select('id')
    .eq('listing_id', listingId);

  if (!images || images.length === 0) {
    return { error: 'You must add at least one image before publishing' };
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error publishing listing:', error);
    return { error: error.message };
  }

  return { listing };
}

// ============================================
// ARCHIVE LISTING
// ============================================

export async function archiveListing(listingId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in' };
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update({ status: 'archived' })
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error archiving listing:', error);
    return { error: error.message };
  }

  return { listing };
}

// ============================================
// DELETE LISTING
// ============================================

export async function deleteListing(listingId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in' };
  }

  // Get all images to delete from storage
  const { data: images } = await supabase
    .from('listing_images')
    .select('storage_path')
    .eq('listing_id', listingId);

  if (images && images.length > 0) {
    const paths = images.map((img) => img.storage_path);
    await supabase.storage.from('listing-images').remove(paths);
  }

  // Delete listing (cascade will delete images from DB)
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('seller_id', user.id);

  if (error) {
    console.error('Error deleting listing:', error);
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// GET LISTING BY ID
// ============================================

export async function getListing(listingId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      images:listing_images(*),
      category:categories(id, name, slug),
      seller:profiles(user_id, username, display_name, avatar_url)
    `
    )
    .eq('id', listingId)
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    return { error: error.message };
  }

  return { listing: listing as unknown as ListingWithDetails };
}

// ============================================
// GET SELLER LISTINGS
// ============================================

export async function getSellerListings(sellerId?: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  // If no sellerId provided, use current user
  let targetSellerId = sellerId;

  if (!sellerId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    targetSellerId = user.id;
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      images:listing_images(*),
      category:categories(id, name, slug)
    `
    )
    .eq('seller_id', targetSellerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller listings:', error);
    return { error: error.message };
  }

  return { listings: listings as unknown as ListingWithImages[] };
}

// ============================================
// GET PUBLIC LISTINGS
// ============================================

export async function getPublicListings(filters?: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  condition?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  let query = supabase
    .from('listings')
    .select(
      `
      *,
      images:listing_images(*),
      category:categories(id, name, slug),
      seller:profiles(user_id, username, display_name, avatar_url)
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.size) {
    query = query.eq('size', filters.size);
  }

  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data: listings, error } = await query;

  if (error) {
    console.error('Error fetching public listings:', error);
    return { error: error.message };
  }

  return { listings: listings as unknown as ListingWithDetails[] };
}

// ============================================
// GET SELLER PUBLIC LISTINGS
// ============================================

export async function getSellerPublicListings(userId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      images:listing_images(*),
      category:categories(id, name, slug)
    `
    )
    .eq('seller_id', userId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller public listings:', error);
    return { error: error.message };
  }

  return { listings: listings as unknown as ListingWithImages[] };
}

// ============================================
// DELETE LISTING IMAGE
// ============================================

export async function deleteListingImage(imageId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in' };
  }

  // Get image details
  const { data: image } = await supabase
    .from('listing_images')
    .select('storage_path, listing_id')
    .eq('id', imageId)
    .single();

  if (!image) {
    return { error: 'Image not found' };
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', image.listing_id)
    .single();

  if (!listing || listing.seller_id !== user.id) {
    return { error: 'You do not have permission to delete this image' };
  }

  // Delete from storage
  await supabase.storage.from('listing-images').remove([image.storage_path]);

  // Delete from database
  const { error } = await supabase.from('listing_images').delete().eq('id', imageId);

  if (error) {
    console.error('Error deleting image:', error);
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// UPDATE IMAGE ORDER
// ============================================

export async function updateImageOrder(
  imageId: string,
  displayOrder: number,
  isCover: boolean
) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in' };
  }

  const { data: image, error } = await supabase
    .from('listing_images')
    .update({ display_order: displayOrder, is_cover: isCover })
    .eq('id', imageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating image order:', error);
    return { error: error.message };
  }

  return { image };
}

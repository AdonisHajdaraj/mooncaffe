// ============================================================
// src/services/productService.js
// Reusable CRUD functions for products and categories.
// All functions return { data, error } from Supabase.
// ============================================================

import { supabase } from './supabaseClient';

// ─── Categories ─────────────────────────────────────────────

/**
 * Fetch all categories ordered by name.
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error };
  }
}

/**
 * Add a new category.
 * @param {string} name
 */
export async function addCategory(name) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error adding category:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing category.
 * @param {string} id 
 * @param {string} name 
 */
export async function updateCategory(id, name) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error updating category:', error);
    return { data: null, error };
  }
}

/**
 * Delete a category by id.
 * @param {string} id 
 */
export async function deleteCategory(id) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    return { error };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { error };
  }
}

// ─── Products ───────────────────────────────────────────────

/**
 * Fetch all products joined with their category.
 * Optionally filter by category_id or a search query.
 */
export async function getProducts({ categoryId = null, search = '' } = {}) {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name)
      `)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, error };
  }
}

/**
 * Get a single product by ID.
 * @param {string} id 
 */
export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { data: null, error };
  }
}

/**
 * Add a new product.
 * @param {{ name, description, price, image_url, category_id }} product
 */
export async function addProduct(product) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description || null,
        price: parseFloat(product.price),
        image_url: product.image_url || null,
        category_id: product.category_id
      }])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error adding product:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing product by id.
 * @param {string} id  UUID of the product
 * @param {{ name?, description?, price?, image_url?, category_id? }} updates
 */
export async function updateProduct(id, updates) {
  try {
    // Prepare update object (only include fields that are provided)
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = parseFloat(updates.price);
    if (updates.image_url !== undefined) updateData.image_url = updates.image_url || null;
    if (updates.category_id !== undefined) updateData.category_id = updates.category_id;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error updating product:', error);
    return { data: null, error };
  }
}

/**
 * Delete a product by id.
 * @param {string} id  UUID of the product
 */
export async function deleteProduct(id) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { error };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { error };
  }
}

// ─── Image Upload ───────────────────────────────────────────

/**
 * Upload an image to Supabase Storage and return its public URL.
 * Requires a public bucket named "product-images" in your project.
 * @param {File} file
 */
export async function uploadProductImage(file) {
  try {
    if (!file) {
      return { url: null, error: new Error('No file provided') };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: new Error('File must be an image') };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: new Error('Image too large. Maximum 5MB') };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `products/${fileName}`;

    console.log('Uploading image:', { filePath, size: file.size });

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Check if bucket exists
      if (uploadError.message?.includes('bucket not found')) {
        return { 
          url: null, 
          error: new Error('Storage bucket "product-images" not found. Please create it in Supabase Dashboard → Storage.') 
        };
      }
      
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    console.log('Upload successful, URL:', publicUrlData.publicUrl);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload exception:', error);
    return { url: null, error };
  }
}

/**
 * Delete an image from Supabase Storage.
 * @param {string} imageUrl 
 */
export async function deleteProductImage(imageUrl) {
  try {
    if (!imageUrl) return { error: null };
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('product-images') + 1).join('/');
    
    if (!filePath) return { error: null };
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);
      
    return { error };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { error };
  }
}
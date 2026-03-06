import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

export function initSupabase(url, anonKey) {
  if (!url || !anonKey) return null
  supabaseInstance = createClient(url, anonKey)
  return supabaseInstance
}

export function getSupabase() {
  return supabaseInstance
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(bucket, path, file, contentType) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not initialized')

  const { data, error } = await sb.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) throw error

  const { data: urlData } = sb.storage
    .from(bucket)
    .getPublicUrl(path)

  return urlData.publicUrl
}

/**
 * Save a cv_generate record
 */
export async function saveCvRecord({ originalCvUrl, newCvUrl, jobDescription, latexCode }) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not initialized')

  const { data, error } = await sb
    .from('cv_generate')
    .insert({
      original_cv_url: originalCvUrl,
      new_cv_url: newCvUrl,
      job_description: jobDescription,
      latex_code: latexCode,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch history of generated CVs
 */
export async function fetchCvHistory(limit = 20) {
  const sb = getSupabase()
  if (!sb) return []

  const { data, error } = await sb
    .from('cv_generate')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch history:', error)
    return []
  }
  return data || []
}

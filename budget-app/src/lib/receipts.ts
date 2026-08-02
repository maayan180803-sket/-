import { supabase } from './supabaseClient';

const BUCKET = 'receipts';
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function isReceiptFileValid(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'ניתן לצרף קובץ תמונה בלבד';
  if (file.size > MAX_FILE_BYTES) return 'התמונה גדולה מדי (מקסימום 8MB)';
  return null;
}

export async function uploadReceipt(householdId: string, file: File): Promise<{ path: string | null; error: string | null }> {
  const invalidReason = isReceiptFileValid(file);
  if (invalidReason) return { path: null, error: invalidReason };

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${householdId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { path: null, error: error.message };
  return { path, error: null };
}

export async function deleteReceipt(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function getReceiptSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) return null;
  return data.signedUrl;
}

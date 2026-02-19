'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Upload, Loader2, ImageIcon, Trash2 } from 'lucide-react';
import GlassCard from './GlassCard';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploaderProps {
  currentImageUrl: string | null;
  fallbackImage: string;
  storagePath: string;
  settingsKey: string;
  title: string;
  description: string;
  bucket?: string;
}

export default function ImageUploader({
  currentImageUrl,
  fallbackImage,
  storagePath,
  settingsKey,
  title,
  description,
  bucket = 'hero-images',
}: ImageUploaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const displayUrl = currentImageUrl || fallbackImage;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('Файл занадто великий. Максимум 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Дозволені лише зображення.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert({ key: settingsKey, value: publicUrl } as never, { onConflict: 'key' });

      if (upsertError) throw upsertError;

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Повернути стандартне зображення?')) return;

    setDeleting(true);
    setError('');

    try {
      await supabase.storage.from(bucket).remove([storagePath]);

      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', settingsKey);

      if (deleteError) throw deleteError;

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <GlassCard className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <Image
            src={displayUrl}
            alt="Preview"
            fill
            className="object-cover"
            sizes="256px"
          />
          {!currentImageUrl && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-300 text-center">
                Стандартне зображення
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {uploading ? 'Завантаження...' : 'Завантажити нове фото'}
          </button>

          {currentImageUrl && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50 border border-white/5"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Видалити та повернути стандартне
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
            <ImageIcon className="w-4 h-4" />
            JPG, PNG, WebP, AVIF до 5MB
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

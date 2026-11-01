import { useState, useEffect, useCallback } from 'react';
import { useEvent } from './useEvent';
import { useAuth } from './useAuth';
import { ImageStorageService } from '../services/image/imageStorageService';
import { ImageMetadata, StoredImage, ImageType } from '../types/image';

export function useImages() {
  const { event } = useEvent();
  const { user } = useAuth();

  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetadataList = useCallback(async () => {
    if (!event) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const list = await ImageStorageService.getEventImageMetadataList(event.id);
      // Sort newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      setImages(list);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load event images:', err);
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [event?.id]);

  useEffect(() => {
    loadMetadataList();
  }, [loadMetadataList]);

  const uploadImage = async (
    file: File | Blob,
    options?: {
      caption?: string;
      imageType?: ImageType;
      fileName?: string;
    }
  ): Promise<{ imageId: string; metadata: ImageMetadata }> => {
    if (!event || !user) {
      throw new Error('Active event and authenticated user required');
    }

    setUploading(true);
    setError(null);

    try {
      const result = await ImageStorageService.saveImage(file, {
        eventId: event.id,
        ownerId: user.uid,
        imageType: options?.imageType || 'moodboard',
        caption: options?.caption || '',
        fileName: options?.fileName || (file instanceof File ? file.name : 'image.jpg'),
      });

      // Update local state with the new metadata
      setImages((prev) => [result.metadata, ...prev]);
      return result;
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getFullImage = async (imageId: string): Promise<StoredImage | null> => {
    return await ImageStorageService.getImage(imageId);
  };

  const deleteImage = async (imageId: string) => {
    if (!event) return;
    try {
      await ImageStorageService.deleteImage(imageId, event.id);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
      throw err;
    }
  };

  return {
    images,
    loading,
    uploading,
    error,
    refresh: loadMetadataList,
    uploadImage,
    getFullImage,
    deleteImage,
    remainingSlots: Math.max(0, 20 - images.length),
  };
}


import { ref, set, get, remove, child } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import {
  compressAndEncodeImage,
  validateImageMimeType,
  calculateBase64SizeBytes,
  MAX_ENCODED_SIZE_BYTES,
  CompressionResult,
} from '../../utils/imageCompressor';
import { sanitizeFileName } from '../../utils/security';
import { StoredImage, ImageMetadata, ImageUploadOptions } from '../../types/image';

const LOCAL_STORAGE_IMAGES_KEY = 'eventwise_demo_images';
const MAX_IMAGES_PER_EVENT = 20;

export const ImageStorageService = {
  /**
   * 1. Validates image MIME type and preliminary size
   */
  validateImage(file: File | Blob): { valid: boolean; error?: string } {
    if (!validateImageMimeType(file.type)) {
      return {
        valid: false,
        error: `Unsupported image format: ${file.type}. Please use JPEG, PNG, or WebP.`,
      };
    }
    return { valid: true };
  },

  /**
   * 2. Compresses image using client-side canvas pipeline
   */
  async compressImage(
    fileOrBlob: Blob,
    options?: { maxDimension?: number; initialQuality?: number }
  ): Promise<CompressionResult> {
    return await compressAndEncodeImage(fileOrBlob, options);
  },

  /**
   * 3. Encodes raw image to base64 Data URL and calculates size
   */
  encodeImage(base64DataUrl: string): { sizeBytes: number; isValid: boolean } {
    const sizeBytes = calculateBase64SizeBytes(base64DataUrl);
    return {
      sizeBytes,
      isValid: sizeBytes <= MAX_ENCODED_SIZE_BYTES,
    };
  },

  /**
   * 4. Saves compressed Base64 image to Firebase Realtime Database at /images/{imageId}
   */
  async saveImage(
    fileOrBlob: Blob,
    options: ImageUploadOptions
  ): Promise<{ imageId: string; metadata: ImageMetadata }> {
    // Check validation
    const validation = this.validateImage(fileOrBlob);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image');
    }

    // Check event image count quota (max 20 images per event)
    const existingCount = await this.getEventImageCount(options.eventId);
    if (existingCount >= MAX_IMAGES_PER_EVENT) {
      throw new Error(
        `Event image limit reached (${MAX_IMAGES_PER_EVENT} images). Please delete existing images before uploading new ones.`
      );
    }

    // Compress client-side
    const compressed = await this.compressImage(fileOrBlob, {
      maxDimension: options.maxDimension || 1600,
      initialQuality: options.quality || 0.85,
    });

    // Enforce 1MB size limit
    if (compressed.sizeBytes > MAX_ENCODED_SIZE_BYTES) {
      throw new Error(
        `Image encoded size (${(compressed.sizeBytes / 1024 / 1024).toFixed(2)} MB) exceeds strict 1 MB limit.`
      );
    }

    const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = Date.now();

    const safeFileName = sanitizeFileName(options.fileName);
    const safeCaption = (options.caption || '').slice(0, 200).trim();

    const storedImage: StoredImage = {
      id: imageId,
      ownerId: options.ownerId,
      eventId: options.eventId,
      fileName: safeFileName,
      mimeType: compressed.mimeType,
      base64Data: compressed.base64Data,
      sizeBytes: compressed.sizeBytes,
      width: compressed.width,
      height: compressed.height,
      imageType: options.imageType,
      caption: safeCaption,
      createdAt,
    };

    const metadata: ImageMetadata = {
      id: imageId,
      ownerId: options.ownerId,
      eventId: options.eventId,
      fileName: storedImage.fileName,
      mimeType: storedImage.mimeType,
      sizeBytes: storedImage.sizeBytes,
      width: storedImage.width,
      height: storedImage.height,
      imageType: storedImage.imageType,
      caption: storedImage.caption,
      createdAt,
    };

    if (!isFirebaseConfigured || !database) {
      // Local fallback for demo
      const localImages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY) || '{}');
      localImages[imageId] = storedImage;
      localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(localImages));
      return { imageId, metadata };
    }

    // Store full image in Realtime Database under images/{imageId}
    const imageRef = ref(database, `images/${imageId}`);
    await set(imageRef, storedImage);

    // Also store lightweight reference under events/{eventId}/imageIndex/{imageId} = metadata
    const indexRef = ref(database, `events/${options.eventId}/imageIndex/${imageId}`);
    await set(indexRef, metadata);

    return { imageId, metadata };
  },

  /**
   * 5. Retrieves full image (including Base64 string) on-demand
   */
  async getImage(imageId: string): Promise<StoredImage | null> {
    if (!isFirebaseConfigured || !database) {
      const localImages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY) || '{}');
      return localImages[imageId] || null;
    }

    const snap = await get(ref(database, `images/${imageId}`));
    if (!snap.exists()) return null;
    return snap.val() as StoredImage;
  },

  /**
   * 6. Retrieves only image metadata (avoiding heavy Base64 payload)
   */
  async getImageMetadata(imageId: string, eventId?: string): Promise<ImageMetadata | null> {
    if (!isFirebaseConfigured || !database) {
      const localImages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY) || '{}');
      const item = localImages[imageId];
      if (!item) return null;
      const { base64Data: _, ...meta } = item;
      return meta;
    }

    if (eventId) {
      const indexSnap = await get(ref(database, `events/${eventId}/imageIndex/${imageId}`));
      if (indexSnap.exists()) return indexSnap.val() as ImageMetadata;
    }

    // Fallback: read fields except base64 if queryable
    const snap = await get(ref(database, `images/${imageId}`));
    if (!snap.exists()) return null;
    const data = snap.val() as StoredImage;
    const { base64Data: _, ...meta } = data;
    return meta;
  },

  /**
   * Retrieves all image metadata list for an event
   */
  async getEventImageMetadataList(eventId: string): Promise<ImageMetadata[]> {
    if (!isFirebaseConfigured || !database) {
      const localImages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY) || '{}');
      return Object.values(localImages)
        .filter((img: any) => img.eventId === eventId)
        .map(({ base64Data: _, ...meta }: any) => meta);
    }

    const indexSnap = await get(ref(database, `events/${eventId}/imageIndex`));
    if (!indexSnap.exists()) return [];
    return Object.values(indexSnap.val() as Record<string, ImageMetadata>);
  },

  /**
   * Count images associated with an event
   */
  async getEventImageCount(eventId: string): Promise<number> {
    const list = await this.getEventImageMetadataList(eventId);
    return list.length;
  },

  /**
   * 7. Deletes image record from Firebase Realtime Database
   */
  async deleteImage(imageId: string, eventId: string): Promise<void> {
    if (!isFirebaseConfigured || !database) {
      const localImages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY) || '{}');
      delete localImages[imageId];
      localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(localImages));
      return;
    }

    // Atomic-like removal: delete both the image payload and the event image reference
    await remove(ref(database, `images/${imageId}`));
    await remove(ref(database, `events/${eventId}/imageIndex/${imageId}`));
  },
};


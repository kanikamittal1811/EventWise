export type ImageType = 'user-uploaded' | 'ai-generated' | 'vendor-reference' | 'moodboard';

export interface StoredImage {
  id: string;
  ownerId: string;
  eventId: string;
  fileName: string;
  mimeType: string;
  base64Data: string;
  sizeBytes: number;
  width: number;
  height: number;
  imageType: ImageType;
  createdAt: number;
  caption?: string;
  tags?: string[];
}

export type ImageMetadata = Omit<StoredImage, 'base64Data'>;

export interface ImageUploadOptions {
  eventId: string;
  ownerId: string;
  imageType: ImageType;
  fileName?: string;
  caption?: string;
  maxDimension?: number;
  quality?: number;
}


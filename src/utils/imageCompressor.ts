/**
 * Client-Side Browser Image Compression Pipeline
 * Enforces maximum dimension (1600px) and strict 1MB Base64 limit.
 */

export interface CompressionResult {
  base64Data: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

export const MAX_ENCODED_SIZE_BYTES = 1024 * 1024; // 1 MB strict maximum
const MAX_DIMENSION = 1600;
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Calculates byte size of a Base64 string / data URL
 */
export function calculateBase64SizeBytes(base64DataUrl: string): number {
  return new Blob([base64DataUrl]).size;
}

/**
 * Loads a File or Blob into an HTMLImageElement
 */
function loadImageElement(fileOrBlob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Compresses an image client-side using HTMLCanvasElement
 */
export async function compressAndEncodeImage(
  fileOrBlob: Blob,
  options?: {
    maxDimension?: number;
    initialQuality?: number;
    targetMimeType?: 'image/jpeg' | 'image/webp';
  }
): Promise<CompressionResult> {
  if (!validateImageMimeType(fileOrBlob.type)) {
    throw new Error(
      `Unsupported image format: ${fileOrBlob.type}. Supported formats: JPEG, PNG, WebP.`
    );
  }

  const maxDimension = options?.maxDimension || MAX_DIMENSION;
  const targetMimeType = options?.targetMimeType || (fileOrBlob.type === 'image/png' ? 'image/jpeg' : fileOrBlob.type as 'image/jpeg' | 'image/webp');
  const img = await loadImageElement(fileOrBlob);

  let { width, height } = img;

  // Scale down maintaining aspect ratio
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw background white for transparent PNGs converted to JPEG
  if (targetMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Iterative compression loop to guarantee <= 1 MB
  let quality = options?.initialQuality ?? 0.85;
  let base64Data = canvas.toDataURL(targetMimeType, quality);
  let sizeBytes = calculateBase64SizeBytes(base64Data);

  let attempts = 0;
  while (sizeBytes > MAX_ENCODED_SIZE_BYTES && attempts < 5) {
    attempts++;
    quality -= 0.15;
    if (quality < 0.2) {
      // Also scale down dimensions if quality is already low
      width = Math.round(width * 0.75);
      height = Math.round(height * 0.75);
      canvas.width = width;
      canvas.height = height;
      if (targetMimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      quality = 0.6;
    }

    base64Data = canvas.toDataURL(targetMimeType, quality);
    sizeBytes = calculateBase64SizeBytes(base64Data);
  }

  if (sizeBytes > MAX_ENCODED_SIZE_BYTES) {
    throw new Error(
      `Unable to compress image below 1 MB limit. Compressed size is ${(sizeBytes / 1024 / 1024).toFixed(2)} MB. Please choose a smaller image.`
    );
  }

  return {
    base64Data,
    width,
    height,
    sizeBytes,
    mimeType: targetMimeType,
  };
}


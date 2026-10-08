/**
 * Image optimization utility to resize and compress uploaded assets
 * to lightweight, high-resolution data URLs that safely fit in LocalStorage and HTTP payloads.
 */
export function compressImage(
  file: File,
  maxWidth = 380,
  maxHeight = 120,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, retain crisp vector format directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          // Prefer WebP for high quality & small size, fallback to PNG
          try {
            const webp = canvas.toDataURL('image/webp', quality);
            if (webp && webp.startsWith('data:image/webp')) {
              resolve(webp);
              return;
            }
          } catch {}
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

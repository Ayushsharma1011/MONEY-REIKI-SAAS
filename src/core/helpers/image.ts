export type ImageDimensions = {
  width: number;
  height: number;
};

export function getImageExtension(contentType: string): string | null {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

export function isPortrait({ width, height }: ImageDimensions): boolean {
  return height > width;
}

export function getAspectRatio({ width, height }: ImageDimensions): number {
  if (height === 0) {
    return 0;
  }

  return width / height;
}

export function buildImageFileName(baseName: string, contentType: string): string {
  const extension = getImageExtension(contentType);

  if (!extension) {
    return baseName;
  }

  return baseName.endsWith(`.${extension}`) ? baseName : `${baseName}.${extension}`;
}

import type { PageImage } from "./types";

/**
 * 加载单张图片
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
    img.src = src;
  });
}

/**
 * 加载背景图和环形图
 */
export async function loadBackgroundImages(
  bgImagePath: string,
  ringImagePath: string
): Promise<{ bgImage: HTMLImageElement; ringImage: HTMLImageElement }> {
  const [bgImage, ringImage] = await Promise.all([
    loadImage(bgImagePath),
    loadImage(ringImagePath),
  ]);

  return { bgImage, ringImage };
}

/**
 * 预加载所有用户图片
 */
export async function preloadUserImages(
  images: PageImage[]
): Promise<HTMLImageElement[]> {
  const imageLoadPromises: Promise<HTMLImageElement>[] = [];

  for (const imgObj of images) {
    if (imgObj && imgObj.image) {
      imageLoadPromises.push(loadImage(imgObj.image));
    }
  }

  return Promise.all(imageLoadPromises);
}

/**
 * 加载所有图片（背景图、环形图、用户图片）
 */
export async function loadAllImages(
  images: PageImage[],
  bgImagePath: string,
  ringImagePath: string
): Promise<{
  bgImage: HTMLImageElement;
  ringImage: HTMLImageElement;
  loadedImages: HTMLImageElement[];
}> {
  const [bgImage, ringImage, loadedImages] = await Promise.all([
    loadImage(bgImagePath),
    loadImage(ringImagePath),
    preloadUserImages(images),
  ]);

  return { bgImage, ringImage, loadedImages };
}

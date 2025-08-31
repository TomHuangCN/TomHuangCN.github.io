import { CalendarPicture } from "./calendar-demo";

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
  images: CalendarPicture[]
): Promise<HTMLImageElement[]> {
  const imageLoadPromises: Promise<HTMLImageElement>[] = [];

  for (const imgObj of images) {
    if (imgObj && imgObj.url) {
      imageLoadPromises.push(loadImage(imgObj.url));
    }
  }

  return Promise.all(imageLoadPromises);
}

/**
 * 加载所有图片（背景图、环形图、用户图片）
 */
export async function loadAllImages(
  images: CalendarPicture[],
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

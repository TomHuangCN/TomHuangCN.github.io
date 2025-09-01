import type { TemplatePage, PageImage } from "./types";

// 创建页面图片的 Canvas
export async function createPageImageCanvas(
  templatePage: TemplatePage,
  pictureUrl: string,
  pageWidth: number,
  pageHeight: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("无法获取 Canvas 上下文"));
      return;
    }

    // 设置画布尺寸
    canvas.width = pageWidth;
    canvas.height = pageHeight;

    // 如果有模板图片，先绘制模板图片作为背景
    if (templatePage.templateImage) {
      const templateImg = new Image();
      templateImg.onload = () => {
        // 先绘制模板图片作为背景，拉伸到指定尺寸
        ctx.drawImage(templateImg, 0, 0, pageWidth, pageHeight);
        
        // 绘制用户图片
        drawUserPicture();
      };
      templateImg.onerror = () => {
        console.warn("模板图片加载失败，使用空白背景");
        drawUserPicture();
      };
      templateImg.src = templatePage.templateImage;
    } else {
      // 没有模板图片，直接绘制用户图片
      drawUserPicture();
    }

    // 绘制用户图片的函数
    function drawUserPicture() {
      // 加载用户图片
      const pictureImg = new Image();
      pictureImg.onload = () => {
        // 将百分比转换为像素坐标和尺寸
        const startXPx = (templatePage.startX / 100) * pageWidth;
        const startYPx = (templatePage.startY / 100) * pageHeight;
        const widthPx = (templatePage.pictureWidth / 100) * pageWidth;
        const heightPx = (templatePage.pictureHeight / 100) * pageHeight;

        // 在指定位置绘制用户图片
        if (ctx) {
          ctx.drawImage(
            pictureImg,
            startXPx,
            startYPx,
            widthPx,
            heightPx
          );
        }
        resolve(canvas);
      };
      pictureImg.onerror = () => reject(new Error("用户图片加载失败"));
      pictureImg.src = pictureUrl;
    }
  });
}

// 批量创建页面图片
export async function createPageImages(
  templatePages: TemplatePage[],
  pictures: string[],
  pageWidth: number,
  pageHeight: number
): Promise<PageImage[]> {
  const pageImages: PageImage[] = [];

  for (let i = 0; i < Math.min(templatePages.length, pictures.length); i++) {
    const templatePage = templatePages[i];
    const picture = pictures[i];

    try {
      const canvas = await createPageImageCanvas(
        templatePage,
        picture,
        pageWidth,
        pageHeight
      );

      pageImages.push({
        image: canvas.toDataURL("image/png"),
      });
    } catch (error) {
      console.error(`创建第 ${i + 1} 页图片失败:`, error);
      // 如果失败，创建一个空的 canvas
      const canvas = document.createElement("canvas");
      canvas.width = pageWidth;
      canvas.height = pageHeight;

      pageImages.push({
        image: canvas.toDataURL("image/png"),
      });
    }
  }

  return pageImages;
}

// 将 Canvas 转换为 base64 图片
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

// 将 Canvas 转换为 Blob
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob!);
    }, "image/png");
  });
}

import JSZip from "jszip";
import { htmlToPng } from "../../utils/html-to-png";

/**
 * 下载所有月份日历图片
 */
export const downloadAllImages = async (year: number): Promise<void> => {
  try {
    const zip = new JSZip();

    // 获取所有月份元素
    const monthElements = document.querySelectorAll("#body ul");

    for (let i = 0; i < monthElements.length; i++) {
      const monthElement = monthElements[i] as HTMLElement;
      const monthNumber = i + 1;

      try {
        // 确保字体已加载完成
        await document.fonts.ready;

        // 生成PNG图片 (300 DPI)
        const pngData = await htmlToPng(monthElement, {
          width: 370, // 350px + 20px margin
          height: 354, // 334px + 20px margin
          scale: 4, // 300 DPI = 4x scale (72 DPI * 4 = 288 DPI, 接近300 DPI)
        });

        // 将PNG数据转换为Blob并添加到ZIP
        const pngBlob = await fetch(pngData).then(res => res.blob());
        zip.file(`${year}年${monthNumber}月日历.png`, pngBlob);
      } catch (error) {
        console.error(`生成${monthNumber}月图片失败:`, error);
      }
    }

    // 生成并下载ZIP文件
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${year}年日历.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载图片失败:", error);
    throw error;
  }
};

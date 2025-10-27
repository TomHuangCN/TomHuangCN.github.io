import React, { useState, useRef, useCallback, useEffect } from "react";
import { ImageCollageGenerator } from "./image-collage-generator";
import { ColorOption } from "./color-utils";

interface UploadedImage {
  url: string;
  file: File;
}

export const ImageCollage: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [recommendedColors, setRecommendedColors] = useState<ColorOption[]>([]);
  const [selectedBackgroundColor, setSelectedBackgroundColor] =
    useState<string>("");
  const [generatedCanvas, setGeneratedCanvas] =
    useState<HTMLCanvasElement | null>(null);
  const [collageData, setCollageData] = useState<{
    images: Array<{
      img: HTMLImageElement;
      width: number;
      height: number;
      aspectRatio: number;
    }>;
    layout: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 重新绘制canvas（当背景色改变时）
  const redrawCanvas = useCallback(
    (newBackgroundColor: string) => {
      if (collageData && canvasRef.current) {
        console.log("重新生成canvas，新背景色:", newBackgroundColor);

        try {
          // 使用生成器重新创建canvas
          const generator = new ImageCollageGenerator();
          const newCanvas = generator.createCanvasWithNewBackground(
            collageData.images,
            collageData.layout,
            newBackgroundColor
          );

          // 更新页面canvas
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            // 设置画布尺寸
            canvasRef.current.width = newCanvas.width;
            canvasRef.current.height = newCanvas.height;

            // 绘制新生成的canvas
            ctx.drawImage(newCanvas, 0, 0);
            console.log("canvas重新生成完成");

            // 更新生成的canvas引用
            setGeneratedCanvas(newCanvas);

            // 更新dataUrl
            const newDataUrl = newCanvas.toDataURL("image/png", 1.0);
            setResultUrl(newDataUrl);
          }
        } catch (error) {
          console.error("重新生成canvas失败:", error);
        }
      }
    },
    [collageData]
  );

  // 当生成器创建了canvas后，渲染到页面canvas
  useEffect(() => {
    if (generatedCanvas && canvasRef.current) {
      console.log("useEffect: 开始渲染canvas到页面");
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        console.log("useEffect: 获取到canvas上下文");

        // 设置画布尺寸
        canvasRef.current.width = generatedCanvas.width;
        canvasRef.current.height = generatedCanvas.height;
        console.log(
          "useEffect: 画布尺寸已设置",
          generatedCanvas.width,
          "x",
          generatedCanvas.height
        );

        // 绘制结果
        try {
          ctx.drawImage(generatedCanvas, 0, 0);
          console.log("useEffect: 结果已绘制到页面canvas");
        } catch (error) {
          console.error("useEffect: 绘制到页面canvas失败:", error);
        }
      }
    }
  }, [generatedCanvas]);

  // 当选择的背景色改变时，重新绘制
  useEffect(() => {
    if (
      selectedBackgroundColor &&
      selectedBackgroundColor !== backgroundColor
    ) {
      redrawCanvas(selectedBackgroundColor);
    }
  }, [selectedBackgroundColor, backgroundColor, redrawCanvas]);

  // 处理文件选择
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newImages: UploadedImage[] = [];
      Array.from(files).forEach(file => {
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          newImages.push({ url, file });
        }
      });

      setImages(prev => [...prev, ...newImages]);
      // 清空input，允许重复选择相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // 删除图片
  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // 生成拼接图 - 重构版本
  const handleGenerate = useCallback(async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    try {
      console.log("开始生成拼接图，图片数量:", images.length);

      // 直接使用生成器，内部会处理图片加载
      const generator = new ImageCollageGenerator();
      const result = await generator.generate(images.map(img => img.url));

      console.log(
        "拼接图生成完成，画布尺寸:",
        result.canvas.width,
        "x",
        result.canvas.height
      );

      // 设置生成的canvas，让useEffect处理渲染
      console.log("设置generatedCanvas状态");
      setGeneratedCanvas(result.canvas);

      // 设置结果数据
      console.log("开始生成dataUrl");
      const dataUrl = result.canvas.toDataURL("image/png", 1.0);
      console.log("dataUrl生成完成，长度:", dataUrl.length);

      setResultUrl(dataUrl);
      setBackgroundColor(result.backgroundColor);
      setRecommendedColors(result.recommendedColors);
      setSelectedBackgroundColor(result.backgroundColor);
      setCollageData({
        images: result.images,
        layout: result.layout,
      });
      console.log("状态已更新");

      console.log("拼接图生成成功");
    } catch (error) {
      console.error("生成失败:", error);
      alert(`生成失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsGenerating(false);
    }
  }, [images]);

  // 下载图片
  const handleDownload = useCallback(() => {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.download = `collage-${Date.now()}.png`;
    link.href = resultUrl;
    link.click();
  }, [resultUrl]);

  // 清空所有
  const handleClear = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setResultUrl("");
    setBackgroundColor("");
    setRecommendedColors([]);
    setSelectedBackgroundColor("");
    setGeneratedCanvas(null);
    setCollageData(null);
  }, [images]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      {/* 上传区域 */}
      <div
        style={{
          border: "2px dashed #ccc",
          borderRadius: 8,
          padding: 40,
          textAlign: "center",
          marginBottom: 20,
          backgroundColor: "#f9f9f9",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          style={{
            cursor: "pointer",
            color: "#007bff",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          点击选择图片或拖拽图片到此处
        </label>
        <p style={{ color: "#666", marginTop: 10, fontSize: 14 }}>
          支持选择多张图片，将自动拼接并生成合适的背景色
        </p>
      </div>

      {/* 已选择的图片列表 */}
      {images.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0 }}>已选择 {images.length} 张图片</h3>
            <button
              onClick={handleClear}
              style={{
                padding: "6px 12px",
                fontSize: 14,
                cursor: "pointer",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 4,
              }}
            >
              清空全部
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 10,
            }}
          >
            {images.map((img, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  paddingBottom: "100%",
                  border: "1px solid #eee",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <img
                  src={img.url}
                  alt={`预览 ${index + 1}`}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: "24px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {images.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              padding: "10px 24px",
              fontSize: 16,
              cursor: isGenerating ? "not-allowed" : "pointer",
              backgroundColor: isGenerating ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontWeight: 500,
            }}
          >
            {isGenerating ? "生成中..." : "生成拼接图"}
          </button>
        </div>
      )}

      {/* 结果展示 */}
      {resultUrl && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0 }}>生成结果</h3>
            <button
              onClick={handleDownload}
              style={{
                padding: "8px 16px",
                fontSize: 14,
                cursor: "pointer",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
              }}
            >
              下载图片
            </button>
          </div>

          {recommendedColors.length > 0 && (
            <div
              style={{
                marginBottom: 20,
                padding: 15,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #e9ecef",
              }}
            >
              <h4 style={{ margin: "0 0 15px 0", fontSize: 16, color: "#333" }}>
                智能推荐背景色（3选1）：
              </h4>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "stretch",
                  justifyContent: "center",
                }}
              >
                {recommendedColors.map((colorOption, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      setSelectedBackgroundColor(colorOption.color)
                    }
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: 16,
                      borderRadius: 12,
                      border:
                        selectedBackgroundColor === colorOption.color
                          ? "3px solid #007bff"
                          : "2px solid #e0e0e0",
                      backgroundColor:
                        selectedBackgroundColor === colorOption.color
                          ? "#e7f3ff"
                          : "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      minWidth: 160,
                      flex: 1,
                      maxWidth: 200,
                      boxShadow:
                        selectedBackgroundColor === colorOption.color
                          ? "0 4px 12px rgba(0, 123, 255, 0.15)"
                          : "0 2px 8px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          backgroundColor: colorOption.color,
                          border: "2px solid #fff",
                          borderRadius: 8,
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#333",
                            marginBottom: 4,
                          }}
                        >
                          {colorOption.style}
                        </div>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: "#666",
                            backgroundColor: "#f5f5f5",
                            padding: "2px 6px",
                            borderRadius: 4,
                            display: "inline-block",
                          }}
                        >
                          {colorOption.color}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        lineHeight: 1.4,
                        textAlign: "left",
                      }}
                    >
                      {colorOption.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                height: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCollage;

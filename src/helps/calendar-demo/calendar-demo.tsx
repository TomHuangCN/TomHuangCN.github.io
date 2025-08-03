import React, { useState, useCallback, useEffect, useRef } from "react";
import CalendarSelector from "./calendar-selector";
import ImageSelector from "./image-selector";
import CalendarRenderer from "./calendar-renderer";
import { CalendarStorage, Calendar } from "./calendar-demo-storage";

// 工具函数：file 转 url
// function fileToUrl(file: File): Promise<string> {
//   return new Promise(resolve => {
//     const reader = new FileReader();
//     reader.onload = e => resolve(e.target?.result as string);
//     reader.readAsDataURL(file);
//   });
// }

// 类型定义
export interface CalendarImage {
  url: string;
  file?: File;
}

interface CalendarDemoProps {
  maxImages?: number;
  renderPage?: (imgs: CalendarImage[]) => React.ReactNode;
  storeName?: string;
}

// 主组件
function CalendarDemo({
  maxImages = 13,
  renderPage,
  storeName = "calendars",
}: CalendarDemoProps) {
  // 创建存储实例
  const [storage] = useState(() => new CalendarStorage(storeName));

  // 日历列表
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  // 当前编辑的图片
  const [images, setImages] = useState<CalendarImage[]>([]);
  // 当前选中的日历 id
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 是否已生成日历
  const [isGenerated, setIsGenerated] = useState(false);

  // 防抖定时器引用
  const debounceTimerRef = useRef<number | null>(null);

  // 初始化时加载日历数据
  useEffect(() => {
    const loadCalendars = async () => {
      try {
        const allCalendars = await storage.getAll();
        setCalendars(allCalendars);
      } catch (error) {
        console.error("加载日历失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCalendars();
  }, [storage]);

  // 生成日历并存储到 IndexedDB
  const handleGenerate = useCallback(async () => {
    if (images.length < maxImages || images.some(img => !img.url)) return;
    const id = Date.now().toString();
    const cover = images[0].url;
    const pages = images.map(img => img.url);
    const cal: Calendar = { id, cover, pages };

    const success = await storage.save(cal);
    if (success) {
      const allCalendars = await storage.getAll();

      setCalendars(allCalendars);
      setSelectedId(id);
      setIsGenerated(true);
    } else {
      alert("保存失败，请重试");
    }
  }, [images, maxImages, storage]);

  // 选择日历
  const handleSelect = useCallback((cal: Calendar) => {
    setSelectedId(cal.id);
    setImages(cal.pages.map((url: string) => ({ url })));
    setIsGenerated(true);
  }, []);

  // 删除日历
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await storage.delete(id);
        const allCalendars = await storage.getAll();
        setCalendars(allCalendars);
        if (selectedId === id) {
          setSelectedId(null);
          setImages([]);
          setIsGenerated(false);
        }
      } catch (error) {
        console.error("删除日历失败:", error);
        alert("删除失败，请重试");
      }
    },
    [selectedId, storage]
  );

  // 处理单张图片替换 - 优化版本
  const handleImageReplace = useCallback(
    async (newImages: CalendarImage[]) => {
      if (selectedId && newImages.length > 0) {
        // 清除之前的定时器
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // 设置防抖定时器，300ms 后执行保存操作
        debounceTimerRef.current = setTimeout(async () => {
          try {
            // 更新当前日历的图片
            const cover = newImages[0].url;
            const pages = newImages.map(img => img.url);
            const updatedCalendar: Calendar = { id: selectedId, cover, pages };

            const success = await storage.save(updatedCalendar);
            if (success) {
              // 只在成功保存后更新日历列表，避免频繁更新
              const allCalendars = await storage.getAll();
              setCalendars(allCalendars);
            } else {
              console.error("更新日历失败");
            }
          } catch (error) {
            console.error("更新日历失败:", error);
          }
        }, 300);
      }
    },
    [selectedId, storage]
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* 上：日历选择 */}
      <CalendarSelector
        calendars={calendars}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
      {/* 中：原图选择 */}
      <ImageSelector
        images={images}
        setImages={setImages}
        maxImages={maxImages}
        onImageReplace={handleImageReplace}
      />
      <button onClick={handleGenerate} style={{ marginBottom: 16 }}>
        生成日历
      </button>
      {/* 下：日历渲染 */}
      {isGenerated && (
        <CalendarRenderer images={images} renderPage={renderPage} />
      )}
    </div>
  );
}

export default CalendarDemo;

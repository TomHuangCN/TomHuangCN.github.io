import React, { useState, useCallback, useEffect } from "react";
import CalendarSelector from "./calendar-selector";
import ImageSelector from "./image-selector";
import CalendarRenderer from "./calendar-renderer";
import { CalendarStorage, Calendar } from "./storage";

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

interface CalendarGenProps {
  maxImages?: number;
  renderPage?: (img: CalendarImage, idx: number) => React.ReactNode;
  storeName?: string;
}

// 主组件
function CalendarGen({
  maxImages = 13,
  renderPage,
  storeName = "calendars",
}: CalendarGenProps) {
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

export default CalendarGen;

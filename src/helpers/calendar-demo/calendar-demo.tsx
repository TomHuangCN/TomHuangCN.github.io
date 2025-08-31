import React, { useState, useCallback, useEffect, useRef } from "react";
import CalendarSelector from "./calendar-selector";
import PictureSelector from "./picture-selector";
import CalendarPoster from "./calendar-poster";
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
export interface CalendarPicture {
  url: string;
  file?: File;
  aspectRatio?: number; // 宽高比
}

interface CalendarDemoProps {
  maxPages?: number;
  pageWidth: number; // 像素宽度
  pageHeight: number; // 像素高度
  renderPoster?: (imgs: CalendarPicture[]) => React.ReactNode;
  storeName?: string;
}

// 主组件
function CalendarDemo({
  maxPages = 13,
  pageWidth,
  pageHeight,
  renderPoster,
  storeName = "calendars",
}: CalendarDemoProps) {
  // 在组件内部计算宽高比
  const aspectRatio = pageWidth / pageHeight;

  // 创建存储实例
  const [storage] = useState(() => new CalendarStorage(storeName));

  // 日历列表
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  // 当前编辑的图片
  const [pictures, setPictures] = useState<CalendarPicture[]>([]);
  // 当前选中的日历 id
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 是否已生成样机
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

  // 生成样机并存储到 IndexedDB
  const handleGenerate = useCallback(async () => {
    if (pictures.length < maxPages || pictures.some(img => !img.url)) return;
    const id = Date.now().toString();
    const cover = pictures[0].url;
    const pages = pictures.map(img => img.url);
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
  }, [pictures, maxPages, storage]);

  // 选择日历
  const handleSelect = useCallback((cal: Calendar) => {
    setSelectedId(cal.id);
    setPictures(cal.pages.map((url: string) => ({ url })));
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
          setPictures([]);
          setIsGenerated(false);
        }
      } catch (error) {
        console.error("删除日历失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedId, storage]
  );

  // 新建日历
  const handleCreateNew = useCallback(() => {
    setSelectedId(null);
    setPictures([]);
    setIsGenerated(false);
  }, []);

  // 处理单张图片替换 - 优化版本
  const handlePictureReplace = useCallback(
    async (newPictures: CalendarPicture[]) => {
      if (selectedId && newPictures.length > 0) {
        // 清除之前的定时器
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // 设置防抖定时器，300ms 后执行保存操作
        debounceTimerRef.current = setTimeout(async () => {
          try {
            // 更新当前日历的图片
            const cover = newPictures[0].url;
            const pages = newPictures.map(img => img.url);
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
        selectedId={selectedId}
        aspectRatio={aspectRatio}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />
      {/* 中：原图选择 */}
      <PictureSelector
        pictures={pictures}
        setPictures={setPictures}
        maxPages={maxPages}
        onPictureReplace={handlePictureReplace}
        aspectRatio={aspectRatio}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={handleGenerate}
          disabled={pictures.length < maxPages || isGenerated}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor:
              pictures.length < maxPages || isGenerated
                ? "not-allowed"
                : "pointer",
            opacity: pictures.length < maxPages || isGenerated ? 0.6 : 1,
            backgroundColor:
              pictures.length < maxPages || isGenerated ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {pictures.length < maxPages
            ? `请选择${maxPages}张图片`
            : isGenerated
              ? "样机已生成"
              : "生成样机"}
        </button>
      </div>
      {/* 下：日历渲染 */}
      {isGenerated && (
        <CalendarPoster pictures={pictures} renderPoster={renderPoster} />
      )}
    </div>
  );
}

export default CalendarDemo;

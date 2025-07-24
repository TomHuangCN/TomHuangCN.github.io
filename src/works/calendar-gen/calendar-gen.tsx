import { useState } from 'react';
import CalendarSelector from './calendar-selector';
import ImageSelector from './image-selector';
import CalendarRenderer from './calendar-renderer';

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

export interface Calendar {
  id: string;
  cover: string;
  pages: string[];
}

interface CalendarGenProps {
  maxImages?: number;
  renderPage?: (img: CalendarImage, idx: number) => React.ReactNode;
}

// 主组件
function CalendarGen({ maxImages = 13, renderPage }: CalendarGenProps) {
  // 日历列表
  const [calendars, setCalendars] = useState<Calendar[]>(getCalendars());
  // 当前编辑的图片
  const [images, setImages] = useState<CalendarImage[]>([]);
  // 当前选中的日历 id
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 生成日历并存储到 localStorage
  const handleGenerate = () => {
    if (images.length < maxImages || images.some((img) => !img.url)) return;
    const id = Date.now().toString();
    const cover = images[0].url;
    const pages = images.map((img) => img.url);
    const cal: Calendar = { id, cover, pages };
    localStorage.setItem('calendar_' + id, JSON.stringify(cal));
    setCalendars(getCalendars());
    setSelectedId(id);
  };

  // 选择日历
  const handleSelect = (cal: Calendar) => {
    setSelectedId(cal.id);
    setImages(cal.pages.map((url: string) => ({ url })));
  };

  // 删除日历
  const handleDelete = (id: string) => {
    localStorage.removeItem('calendar_' + id);
    setCalendars(getCalendars());
    if (selectedId === id) {
      setSelectedId(null);
      setImages([]);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      {/* 上：日历选择 */}
      <CalendarSelector calendars={calendars} onSelect={handleSelect} onDelete={handleDelete} />
      {/* 中：原图选择 */}
      <ImageSelector images={images} setImages={setImages} maxImages={maxImages} />
      <button onClick={handleGenerate} style={{ marginBottom: 16 }}>生成日历</button>
      {/* 下：日历渲染 */}
      <CalendarRenderer images={images} renderPage={renderPage} />
    </div>
  );
}

// 获取所有日历
function getCalendars(): Calendar[] {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('calendar_'));
  return keys.map(k => {
    try {
      return JSON.parse(localStorage.getItem(k) || '{}');
    } catch {
      return null;
    }
  }).filter(Boolean) as Calendar[];
}

export default CalendarGen;

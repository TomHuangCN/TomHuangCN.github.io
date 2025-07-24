import React from 'react';
import type { CalendarImage } from './calendar-gen'

interface ImageSelectorProps {
  images: CalendarImage[];
  setImages: React.Dispatch<React.SetStateAction<CalendarImage[]>>;
  maxImages: number;
}

function fileToUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

export default function ImageSelector({ images, setImages, maxImages }: ImageSelectorProps) {
  // 批量上传
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, maxImages);
    Promise.all(arr.map(f => fileToUrl(f))).then(urls => {
      setImages(urls.map((url, i) => ({ url, file: arr[i] })));
    });
  };
  // 单张替换
  const handleReplace = (idx: number, file: File) => {
    fileToUrl(file).then(url => {
      setImages((imgs) => imgs.map((img, i) => i === idx ? { url, file } : img));
    });
  };
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input type="file" multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
      {Array.from({ length: maxImages }).map((_, i) => (
        <div key={i} style={{ width: 60, height: 80, border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          {images[i]?.url ? (
            <>
              <img src={images[i].url} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => e.target.files && handleReplace(i, e.target.files[0])} />
            </>
          ) : (
            <span style={{ color: '#aaa', fontSize: 12, lineHeight: '80px', textAlign: 'center', display: 'block' }}>{i === 0 ? '封面' : `内页${i}`}</span>
          )}
        </div>
      ))}
    </div>
  );
} 
// 基础页面类型
export interface Page {
  id: string;
  width: number;
  height: number;
}

// 模板页面配置
export interface TemplatePage extends Page {
  templateImage: string;
  startX: number; // 百分比 0-100
  startY: number; // 百分比 0-100
  pictureWidth: number; // 百分比 0-100
  pictureHeight: number; // 百分比 0-100
}

// 模板定义
export interface Template {
  id: string;
  name: string;
  pages: TemplatePage[];
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown; // 添加索引签名以满足StorageData约束
}

// 渲染后的页面图片
export interface PageImage {
  image: string; // base64 或 URL
}

// 模板配置
export interface TemplateConfig {
  enabled: boolean;
  selectedTemplateId: string | null;
}

// 日历数据
export interface Calendar {
  id: string;
  cover: string;
  pages: string[];
  templateId?: string;
  [key: string]: unknown; // 添加索引签名以满足StorageData约束
}

// 用户选择的图片
export interface UserImage {
  url: string;
  file?: File;
  aspectRatio?: number;
}

// 日历演示组件配置
export interface CalendarDemoConfig {
  maxPages: number;
  pageWidth: number;
  pageHeight: number;
  storeName: string;
}

// 日历演示状态
export interface CalendarDemoState {
  calendars: Calendar[];
  pictures: UserImage[];
  selectedId: string | null;
  templates: Template[];
  templateConfig: TemplateConfig;
  pageImages: PageImage[];
  loading: boolean;
  isGenerated: boolean;
  generatingLoading: boolean;
  switchingLoading: boolean;
  isGeneratingTemplate: boolean;
}

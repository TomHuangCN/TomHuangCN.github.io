import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import CalendarSelector from "./calendar-selector";
import PictureSelector from "./picture-selector";
import CalendarPoster from "./calendar-poster";
import TemplateSelector from "./template-selector";
import { CalendarStorage } from "./calendar-demo-storage";
import { TemplateStorage } from "./template-storage";
import type {
  Template,
  PageImage,
  TemplateConfig,
  Calendar,
  UserImage,
} from "./types";
import { createPageImages } from "./template-utils";

interface CalendarDemoProps {
  maxPages?: number;
  pageWidth: number;
  pageHeight: number;
  renderPoster?: (imgs: PageImage[]) => React.ReactNode;
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
  const [templateStorage] = useState(() => new TemplateStorage());

  // 日历列表
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  // 当前编辑的图片
  const [pictures, setPictures] = useState<UserImage[]>([]);
  // 当前选中的日历 id
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 是否已生成样机
  const [isGenerated, setIsGenerated] = useState(false);
  // 生成样机 loading 状态
  const [generatingLoading, setGeneratingLoading] = useState(false);
  // 日历切换 loading 状态
  const [switchingLoading, setSwitchingLoading] = useState(false);

  // 模板相关状态
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    enabled: false,
    selectedTemplateId: null,
  });
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  // 防抖定时器引用
  const debounceTimerRef = useRef<number | null>(null);

  // 初始化时加载日历数据和模板数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载日历数据
        const allCalendars = await storage.getAll();
        setCalendars(allCalendars);

        // 加载模板数据
        const allTemplates = await templateStorage.getAll();
        setTemplates(allTemplates);

        // 加载模板配置
        const config = await templateStorage.getConfig();
        setTemplateConfig(config);
        setSelectedTemplateId(config.selectedTemplateId);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [storage, templateStorage]);

  // 监听模板配置变化（从控制台页面修改）
  useEffect(() => {
    const checkTemplateConfig = async () => {
      try {
        const config = await templateStorage.getConfig();
        if (config.enabled !== templateConfig.enabled) {
          setTemplateConfig(config);
          setSelectedTemplateId(config.selectedTemplateId);
        }
      } catch (error) {
        console.error("检查模板配置失败:", error);
      }
    };

    // 定期检查配置变化
    const interval = setInterval(checkTemplateConfig, 2000);
    return () => clearInterval(interval);
  }, [templateConfig.enabled, templateStorage]);

  // 生成样机并存储到 IndexedDB
  const handleGenerate = useCallback(async () => {
    if (pictures.length < maxPages || pictures.some(img => !img.url)) return;

    setGeneratingLoading(true);
    try {
      const id = Date.now().toString();
      const cover = pictures[0].url;
      const pages = pictures.map(img => img.url);
      const cal: Calendar = {
        id,
        cover,
        pages,
        templateId:
          templateConfig.enabled && selectedTemplateId
            ? selectedTemplateId
            : undefined,
      };

      const success = await storage.save(cal);
      if (success) {
        const allCalendars = await storage.getAll();

        setCalendars(allCalendars);
        setSelectedId(id);
        setIsGenerated(true);
      } else {
        alert("保存失败，请重试");
      }
    } catch (error) {
      console.error("生成样机失败:", error);
      alert("生成样机失败，请重试");
    } finally {
      setGeneratingLoading(false);
    }
  }, [pictures, maxPages, storage, templateConfig.enabled, selectedTemplateId]);

  // 选择日历
  const handleSelect = useCallback(
    async (cal: Calendar) => {
      setSwitchingLoading(true);
      try {
        setSelectedId(cal.id);
        setPictures(cal.pages.map((url: string) => ({ url })));
        setIsGenerated(true);

        // 同步恢复所使用的模板
        if (templateConfig.enabled && cal.templateId) {
          setSelectedTemplateId(cal.templateId);
        }
      } catch (error) {
        console.error("切换日历失败:", error);
        alert("切换日历失败，请重试");
      } finally {
        setSwitchingLoading(false);
      }
    },
    [templateConfig.enabled]
  );

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
    setSwitchingLoading(true);
    try {
      setSelectedId(null);
      setPictures([]);
      setIsGenerated(false);
      setSelectedTemplateId(null);
      setPageImages([]);
    } catch (error) {
      console.error("新建日历失败:", error);
      alert("新建日历失败，请重试");
    } finally {
      setSwitchingLoading(false);
    }
  }, []);

  // 模板相关处理函数
  const handleTemplateSelect = useCallback(
    async (templateId: string | null) => {
      setSelectedTemplateId(templateId);

      if (templateId) {
        // 保存配置
        const newConfig = { ...templateConfig, selectedTemplateId: templateId };
        await templateStorage.saveConfig(newConfig);
        setTemplateConfig(newConfig);
      }
    },
    [templateConfig, templateStorage]
  );

  const handleTemplateCreate = useCallback(
    async (pages: Template["pages"], templateName: string) => {
      try {
        const templateId = await templateStorage.createTemplate(
          templateName,
          pages
        );

        if (templateId) {
          // 重新加载模板列表
          const allTemplates = await templateStorage.getAll();
          setTemplates(allTemplates);

          // 选择新创建的模板
          await handleTemplateSelect(templateId);
        }
      } catch (error) {
        console.error("创建模板失败:", error);
        alert("创建模板失败，请重试");
      }
    },
    [templateStorage, handleTemplateSelect]
  );

  const handleTemplateUpdate = useCallback(
    async (
      templateId: string,
      pages: Template["pages"],
      templateName: string
    ) => {
      try {
        const success = await templateStorage.updateTemplate(templateId, {
          pages,
          name: templateName,
        });
        if (success) {
          // 重新加载模板列表
          const allTemplates = await templateStorage.getAll();
          setTemplates(allTemplates);
        } else {
          alert("更新模板失败，请重试");
        }
      } catch (error) {
        console.error("更新模板失败:", error);
        alert("更新模板失败，请重试");
      }
    },
    [templateStorage]
  );

  const handleTemplateDelete = useCallback(
    async (templateId: string) => {
      try {
        const success = await templateStorage.deleteTemplate(templateId);
        if (success) {
          // 重新加载模板列表
          const allTemplates = await templateStorage.getAll();
          setTemplates(allTemplates);

          // 如果删除的是当前选中的模板，清除选择
          if (selectedTemplateId === templateId) {
            setSelectedTemplateId(null);
          }
        } else {
          alert("删除模板失败，请重试");
        }
      } catch (error) {
        console.error("删除模板失败:", error);
        alert("删除模板失败，请重试");
      }
    },
    [templateStorage, selectedTemplateId]
  );

  // 当模板或图片变化时，重新生成页面图片
  useEffect(() => {
    // 只有在模板启用且有选中模板时才生成页面图片
    if (templateConfig.enabled && selectedTemplateId && pictures.length > 0) {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (selectedTemplate) {
        setIsGeneratingTemplate(true);
        createPageImages(
          selectedTemplate.pages,
          pictures.map(p => p.url),
          pageWidth,
          pageHeight
        )
          .then(setPageImages)
          .finally(() => setIsGeneratingTemplate(false));
      }
    } else {
      // 如果模板未启用或没有选中模板，清空页面图片
      setPageImages([]);
      setIsGeneratingTemplate(false);
    }
  }, [
    templateConfig.enabled,
    selectedTemplateId,
    templates,
    pictures,
    pageWidth,
    pageHeight,
  ]);

  // 计算最终要渲染的页面图片，避免在渲染过程中计算
  const finalPageImages = useMemo(() => {
    // 如果正在生成模板图片，返回空数组，避免渲染
    if (isGeneratingTemplate) {
      return [];
    }

    if (templateConfig.enabled && pageImages.length > 0) {
      return pageImages;
    } else {
      return pictures.map(picture => ({
        image: picture.url,
      }));
    }
  }, [templateConfig.enabled, pageImages, pictures, isGeneratingTemplate]);

  // 处理单张图片替换 - 优化版本
  const handlePictureReplace = useCallback(
    async (newPictures: UserImage[]) => {
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
        onTemplateSync={handleTemplateSelect}
        loading={switchingLoading}
      />

      {/* 模板选择器 */}
      {templateConfig.enabled && (
        <TemplateSelector
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          onTemplateCreate={handleTemplateCreate}
          onTemplateUpdate={handleTemplateUpdate}
          onTemplateDelete={handleTemplateDelete}
          maxPages={maxPages}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      )}

      {/* 中：原图选择 */}
      <PictureSelector
        pictures={pictures}
        setPictures={setPictures}
        maxPages={maxPages}
        onPictureReplace={handlePictureReplace}
        aspectRatio={aspectRatio}
        templateMode={templateConfig.enabled && selectedTemplateId !== null}
        templateAspectRatio={(() => {
          if (templateConfig.enabled && selectedTemplateId) {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template?.pages[0]) {
              return template.pages[0].width / template.pages[0].height;
            }
          }
          return undefined;
        })()}
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
          disabled={
            pictures.length < maxPages || isGenerated || generatingLoading
          }
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor:
              pictures.length < maxPages || isGenerated || generatingLoading
                ? "not-allowed"
                : "pointer",
            opacity:
              pictures.length < maxPages || isGenerated || generatingLoading
                ? 0.6
                : 1,
            backgroundColor:
              pictures.length < maxPages || isGenerated || generatingLoading
                ? "#ccc"
                : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {generatingLoading
            ? "生成中..."
            : pictures.length < maxPages
              ? `请选择${maxPages}张图片`
              : isGenerated
                ? "样机已生成"
                : "生成样机"}
        </button>
      </div>
      {/* 下：日历渲染 */}
      {isGenerated && (
        <CalendarPoster
          pageImages={finalPageImages}
          renderPoster={renderPoster}
        />
      )}
    </div>
  );
}

export default CalendarDemo;

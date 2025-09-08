import { useState, useCallback, useEffect, useRef } from "react";
import { CalendarStorage } from "./calendar-demo-storage";
import { TemplateStorage } from "./template-storage";
import { createPageImages } from "./template-utils";
import type {
  Calendar,
  Template,
  TemplateConfig,
  UserImage,
  CalendarDemoConfig,
  CalendarDemoState,
} from "./types";

// 初始状态
const createInitialState = (): CalendarDemoState => ({
  calendars: [],
  pictures: [],
  selectedId: null,
  templates: [],
  templateConfig: { enabled: false, selectedTemplateId: null },
  pageImages: [],
  loading: true,
  isGenerated: false,
  generatingLoading: false,
  switchingLoading: false,
  isGeneratingTemplate: false,
});

// 日历管理hook
export const useCalendarManagement = (config: CalendarDemoConfig) => {
  const [state, setState] = useState<CalendarDemoState>(createInitialState);
  const [storage] = useState(() => new CalendarStorage(config.storeName));
  const [templateStorage] = useState(() => new TemplateStorage());
  const debounceTimerRef = useRef<number | null>(null);

  // 更新状态
  const updateState = useCallback((updates: Partial<CalendarDemoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 加载初始数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [allCalendars, allTemplates, templateConfig] = await Promise.all([
          storage.getAll(),
          templateStorage.getAll(),
          templateStorage.getConfig(),
        ]);

        updateState({
          calendars: allCalendars,
          templates: allTemplates,
          templateConfig,
          loading: false,
        });
      } catch (error) {
        console.error("加载数据失败:", error);
        updateState({ loading: false });
      }
    };
    loadData();
  }, [storage, templateStorage, updateState]);

  // 监听模板配置变化
  useEffect(() => {
    const checkTemplateConfig = async () => {
      try {
        const config = await templateStorage.getConfig();
        if (config.enabled !== state.templateConfig.enabled) {
          updateState({ templateConfig: config });
        }
      } catch (error) {
        console.error("检查模板配置失败:", error);
      }
    };

    const interval = setInterval(checkTemplateConfig, 2000);
    return () => clearInterval(interval);
  }, [state.templateConfig.enabled, templateStorage, updateState]);

  // 生成日历
  const generateCalendar = useCallback(async () => {
    if (
      state.pictures.length < config.maxPages ||
      state.pictures.some(img => !img.url)
    ) {
      return;
    }

    updateState({ generatingLoading: true });
    try {
      const id = Date.now().toString();
      const cover = state.pictures[0].url;
      const pages = state.pictures.map(img => img.url);
      const calendar: Calendar = {
        id,
        cover,
        pages,
        templateId:
          state.templateConfig.enabled &&
          state.templateConfig.selectedTemplateId
            ? state.templateConfig.selectedTemplateId
            : undefined,
      };

      const success = await storage.save(calendar);
      if (success) {
        const allCalendars = await storage.getAll();
        updateState({
          calendars: allCalendars,
          selectedId: id,
          isGenerated: true,
          generatingLoading: false,
        });
      } else {
        alert("保存失败，请重试");
        updateState({ generatingLoading: false });
      }
    } catch (error) {
      console.error("生成样机失败:", error);
      alert("生成样机失败，请重试");
      updateState({ generatingLoading: false });
    }
  }, [
    state.pictures,
    state.templateConfig,
    config.maxPages,
    storage,
    updateState,
  ]);

  // 选择日历
  const selectCalendar = useCallback(
    async (calendar: Calendar) => {
      updateState({ switchingLoading: true });
      try {
        updateState({
          selectedId: calendar.id,
          pictures: calendar.pages.map((url: string) => ({ url })),
          isGenerated: true,
          switchingLoading: false,
        });

        // 同步恢复所使用的模板
        if (state.templateConfig.enabled && calendar.templateId) {
          const newConfig = {
            ...state.templateConfig,
            selectedTemplateId: calendar.templateId,
          };
          await templateStorage.saveConfig(newConfig);
          updateState({ templateConfig: newConfig });
        }
      } catch (error) {
        console.error("切换日历失败:", error);
        alert("切换日历失败，请重试");
        updateState({ switchingLoading: false });
      }
    },
    [state.templateConfig, templateStorage, updateState]
  );

  // 删除日历
  const deleteCalendar = useCallback(
    async (id: string) => {
      try {
        await storage.delete(id);
        const allCalendars = await storage.getAll();
        updateState({ calendars: allCalendars });

        if (state.selectedId === id) {
          updateState({
            selectedId: null,
            pictures: [],
            isGenerated: false,
          });
        }
      } catch (error) {
        console.error("删除日历失败:", error);
      }
    },
    [state.selectedId, storage, updateState]
  );

  // 新建日历
  const createNewCalendar = useCallback(async () => {
    updateState({ switchingLoading: true });
    try {
      const newConfig = { ...state.templateConfig, selectedTemplateId: null };
      await templateStorage.saveConfig(newConfig);
      updateState({
        selectedId: null,
        pictures: [],
        isGenerated: false,
        templateConfig: newConfig,
        pageImages: [],
        switchingLoading: false,
      });
    } catch (error) {
      console.error("新建日历失败:", error);
      alert("新建日历失败，请重试");
      updateState({ switchingLoading: false });
    }
  }, [state.templateConfig, templateStorage, updateState]);

  // 更新图片（带防抖）
  const updatePictures = useCallback(
    async (newPictures: UserImage[]) => {
      updateState({ pictures: newPictures });

      if (state.selectedId && newPictures.length > 0) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
          try {
            const cover = newPictures[0].url;
            const pages = newPictures.map(img => img.url);
            const updatedCalendar: Calendar = {
              id: state.selectedId!,
              cover,
              pages,
            };

            const success = await storage.save(updatedCalendar);
            if (success) {
              const allCalendars = await storage.getAll();
              updateState({ calendars: allCalendars });
            } else {
              console.error("更新日历失败");
            }
          } catch (error) {
            console.error("更新日历失败:", error);
          }
        }, 300);
      }
    },
    [state.selectedId, storage, updateState]
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    generateCalendar,
    selectCalendar,
    deleteCalendar,
    createNewCalendar,
    updatePictures,
    updateState,
  };
};

// 模板管理hook
export const useTemplateManagement = (/* config: CalendarDemoConfig */) => {
  const [templateStorage] = useState(() => new TemplateStorage());

  // 选择模板
  const selectTemplate = useCallback(
    async (templateId: string | null, currentConfig: TemplateConfig) => {
      const newConfig = { ...currentConfig, selectedTemplateId: templateId };
      await templateStorage.saveConfig(newConfig);
      return newConfig;
    },
    [templateStorage]
  );

  // 创建模板
  const createTemplate = useCallback(
    async (pages: Template["pages"], templateName: string) => {
      const templateId = await templateStorage.createTemplate(
        templateName,
        pages
      );
      if (templateId) {
        const allTemplates = await templateStorage.getAll();
        return { templateId, templates: allTemplates };
      }
      return null;
    },
    [templateStorage]
  );

  // 更新模板
  const updateTemplate = useCallback(
    async (
      templateId: string,
      pages: Template["pages"],
      templateName: string
    ) => {
      const success = await templateStorage.updateTemplate(templateId, {
        pages,
        name: templateName,
      });
      if (success) {
        const allTemplates = await templateStorage.getAll();
        return allTemplates;
      }
      return null;
    },
    [templateStorage]
  );

  // 删除模板
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      const success = await templateStorage.deleteTemplate(templateId);
      if (success) {
        const allTemplates = await templateStorage.getAll();
        return allTemplates;
      }
      return null;
    },
    [templateStorage]
  );

  return {
    selectTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

// 模板图片生成hook
export const useTemplateImageGeneration = (config: CalendarDemoConfig) => {
  // 生成模板页面图片
  const generateTemplateImages = useCallback(
    async (
      templateConfig: TemplateConfig,
      selectedTemplateId: string | null,
      templates: Template[],
      pictures: UserImage[]
    ) => {
      if (templateConfig.enabled && selectedTemplateId && pictures.length > 0) {
        const selectedTemplate = templates.find(
          t => t.id === selectedTemplateId
        );
        if (selectedTemplate) {
          const pageImages = await createPageImages(
            selectedTemplate.pages,
            pictures.map(p => p.url),
            config.pageWidth,
            config.pageHeight
          );
          return pageImages;
        }
      }
      return [];
    },
    [config.pageWidth, config.pageHeight]
  );

  return { generateTemplateImages };
};

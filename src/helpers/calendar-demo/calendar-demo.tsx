import React, { useCallback, useEffect, useMemo } from "react";
import CalendarSelector from "./calendar-selector";
import PictureSelector from "./picture-selector";
import CalendarPoster from "./calendar-poster";
import TemplateSelector from "./template-selector";
import {
  useCalendarManagement,
  useTemplateManagement,
  useTemplateImageGeneration,
} from "./calendar-demo-hooks";
import type {
  CalendarDemoConfig,
  PageImage,
  Template,
  UserImage,
} from "./types";

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
  // 配置对象
  const config: CalendarDemoConfig = {
    maxPages,
    pageWidth,
    pageHeight,
    storeName,
  };

  // 使用自定义hooks管理状态和逻辑
  const {
    state,
    generateCalendar,
    selectCalendar,
    deleteCalendar,
    createNewCalendar,
    updatePictures,
    updateState,
  } = useCalendarManagement(config);

  // 修复：useTemplateManagement 和 useTemplateImageGeneration 不需要参数
  const { selectTemplate, createTemplate, updateTemplate, deleteTemplate } =
    useTemplateManagement();

  const { generateTemplateImages } = useTemplateImageGeneration(config);

  // 计算宽高比
  const aspectRatio = pageWidth / pageHeight;

  // 模板相关处理函数
  const handleTemplateSelect = useCallback(
    async (templateId: string | null) => {
      const newConfig = await selectTemplate(templateId, state.templateConfig);
      updateState({ templateConfig: newConfig });
    },
    [selectTemplate, state.templateConfig, updateState]
  );

  const handleTemplateCreate = useCallback(
    async (pages: Template["pages"], templateName: string) => {
      try {
        const result = await createTemplate(pages, templateName);
        if (result) {
          updateState({ templates: result.templates });
          await handleTemplateSelect(result.templateId);
        }
      } catch (error) {
        console.error("创建模板失败:", error);
        alert("创建模板失败，请重试");
      }
    },
    [createTemplate, updateState, handleTemplateSelect]
  );

  const handleTemplateUpdate = useCallback(
    async (
      templateId: string,
      pages: Template["pages"],
      templateName: string
    ) => {
      try {
        const templates = await updateTemplate(templateId, pages, templateName);
        if (templates) {
          updateState({ templates });
        } else {
          alert("更新模板失败，请重试");
        }
      } catch (error) {
        console.error("更新模板失败:", error);
        alert("更新模板失败，请重试");
      }
    },
    [updateTemplate, updateState]
  );

  const handleTemplateDelete = useCallback(
    async (templateId: string) => {
      try {
        const templates = await deleteTemplate(templateId);
        if (templates) {
          updateState({ templates });

          // 如果删除的是当前选中的模板，清除选择
          if (state.templateConfig.selectedTemplateId === templateId) {
            const newConfig = {
              ...state.templateConfig,
              selectedTemplateId: null,
            };
            await selectTemplate(null, state.templateConfig);
            updateState({ templateConfig: newConfig });
          }
        } else {
          alert("删除模板失败，请重试");
        }
      } catch (error) {
        console.error("删除模板失败:", error);
        alert("删除模板失败，请重试");
      }
    },
    [deleteTemplate, updateState, state.templateConfig, selectTemplate]
  );

  // 当模板或图片变化时，重新生成页面图片
  useEffect(() => {
    const generateImages = async () => {
      if (
        state.templateConfig.enabled &&
        state.templateConfig.selectedTemplateId &&
        state.pictures.length > 0
      ) {
        updateState({ isGeneratingTemplate: true });
        try {
          const pageImages = await generateTemplateImages(
            state.templateConfig,
            state.templateConfig.selectedTemplateId,
            state.templates,
            state.pictures
          );
          updateState({ pageImages });
        } finally {
          updateState({ isGeneratingTemplate: false });
        }
      } else {
        updateState({ pageImages: [], isGeneratingTemplate: false });
      }
    };

    generateImages();
  }, [
    state.templateConfig.enabled,
    state.templateConfig.selectedTemplateId,
    state.templates,
    state.pictures,
    generateTemplateImages,
    updateState,
  ]);

  // 计算最终要渲染的页面图片
  const finalPageImages = useMemo(() => {
    if (state.isGeneratingTemplate) {
      return [];
    }

    if (state.templateConfig.enabled && state.pageImages.length > 0) {
      return state.pageImages;
    } else {
      return state.pictures.map(picture => ({
        image: picture.url,
      }));
    }
  }, [
    state.templateConfig.enabled,
    state.pageImages,
    state.pictures,
    state.isGeneratingTemplate,
  ]);

  // 处理图片替换
  const handlePictureReplace = useCallback(
    async (newPictures: UserImage[]) => {
      await updatePictures(newPictures);
    },
    [updatePictures]
  );

  // 创建setPictures函数，适配PictureSelector的期望类型
  const setPictures = useCallback(
    (value: React.SetStateAction<UserImage[]>) => {
      if (typeof value === "function") {
        // 直接更新pictures，不触发其他逻辑
        const newPictures = value(state.pictures);
        updateState({ pictures: newPictures });
      } else {
        updateState({ pictures: value });
      }
    },
    [updateState, state.pictures]
  );

  if (state.loading) {
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
        calendars={state.calendars}
        selectedId={state.selectedId}
        aspectRatio={aspectRatio}
        onSelect={selectCalendar}
        onDelete={deleteCalendar}
        onCreateNew={createNewCalendar}
        onTemplateSync={handleTemplateSelect}
        loading={state.switchingLoading}
      />

      {/* 模板选择器 */}
      {state.templateConfig.enabled && (
        <TemplateSelector
          templates={state.templates}
          selectedTemplateId={state.templateConfig.selectedTemplateId}
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
        pictures={state.pictures}
        setPictures={setPictures}
        maxPages={maxPages}
        onPictureReplace={handlePictureReplace}
        aspectRatio={aspectRatio}
        templateMode={
          state.templateConfig.enabled &&
          state.templateConfig.selectedTemplateId !== null
        }
        templateAspectRatio={(() => {
          if (
            state.templateConfig.enabled &&
            state.templateConfig.selectedTemplateId
          ) {
            const template = state.templates.find(
              t => t.id === state.templateConfig.selectedTemplateId
            );
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
          onClick={generateCalendar}
          disabled={
            state.pictures.length < maxPages ||
            state.isGenerated ||
            state.generatingLoading
          }
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor:
              state.pictures.length < maxPages ||
              state.isGenerated ||
              state.generatingLoading
                ? "not-allowed"
                : "pointer",
            opacity:
              state.pictures.length < maxPages ||
              state.isGenerated ||
              state.generatingLoading
                ? 0.6
                : 1,
            backgroundColor:
              state.pictures.length < maxPages ||
              state.isGenerated ||
              state.generatingLoading
                ? "#ccc"
                : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {state.generatingLoading
            ? "生成中..."
            : state.pictures.length < maxPages
              ? `请选择${maxPages}张图片`
              : state.isGenerated
                ? "样机已生成"
                : "生成样机"}
        </button>
      </div>

      {/* 下：日历渲染 */}
      {state.isGenerated && (
        <CalendarPoster
          pageImages={finalPageImages}
          renderPoster={renderPoster}
        />
      )}
    </div>
  );
}

export default CalendarDemo;

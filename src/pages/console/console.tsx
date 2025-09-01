import React, { useState, useEffect } from "react";
import { TemplateStorage } from "../../helpers/calendar-demo/template-storage";
import type { TemplateConfig } from "../../helpers/calendar-demo/types";
import { DataManagement } from "./data-management";
import { TemplateManagement } from "./template-management";
import { SystemInfo } from "./system-info";
import { ProgressBar } from "./progress-bar";
import { TabNavigation } from "./tab-navigation";
import { consoleStyles } from "./styles";
import type { ProgressState, ConsoleTab } from "./types";

const Console: React.FC = () => {
  const [activeTab, setActiveTab] = useState("data-management");
  const [progress, setProgress] = useState<ProgressState>({
    isVisible: false,
    progress: 0,
    message: "",
  });
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    enabled: false,
    selectedTemplateId: null,
  });

  // 初始化模板配置
  useEffect(() => {
    const initTemplateConfig = async () => {
      try {
        const templateStorage = new TemplateStorage();
        const config = await templateStorage.getConfig();
        setTemplateConfig(config);
      } catch (error) {
        console.error("加载模板配置失败:", error);
      }
    };
    initTemplateConfig();
  }, []);

  // 更新进度
  const updateProgress = (progress: number, message: string) => {
    setProgress({
      isVisible: true,
      progress,
      message,
    });
  };

  // 隐藏进度条
  const hideProgress = () => {
    setProgress({
      isVisible: false,
      progress: 0,
      message: "",
    });
  };

  // 定义标签页
  const tabs: ConsoleTab[] = [
    {
      id: "data-management",
      name: "数据管理",
      component: (
        <DataManagement
          updateProgress={updateProgress}
          hideProgress={hideProgress}
        />
      ),
    },
    {
      id: "template-management",
      name: "模板管理",
      component: (
        <TemplateManagement
          templateConfig={templateConfig}
          setTemplateConfig={setTemplateConfig}
        />
      ),
    },
    {
      id: "system-info",
      name: "系统信息",
      component: <SystemInfo />,
    },
  ];

  return (
    <div style={consoleStyles.container}>
      <h1 style={consoleStyles.title}>系统控制台</h1>

      {/* 标签页导航 */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* 标签页内容 */}
      {tabs.find(tab => tab.id === activeTab)?.component}

      {/* 进度条 */}
      <ProgressBar
        isVisible={progress.isVisible}
        progress={progress.progress}
        message={progress.message}
      />
    </div>
  );
};

export default Console;

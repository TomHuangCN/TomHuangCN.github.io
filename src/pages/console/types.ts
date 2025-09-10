import React from "react";

export interface ProgressState {
  isVisible: boolean;
  progress: number;
  message: string;
}

export interface ConsoleTab {
  id: string;
  name: string;
  component: React.ReactNode;
}

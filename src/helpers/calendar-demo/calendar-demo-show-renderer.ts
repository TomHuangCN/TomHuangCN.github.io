import type { PageImage } from "./types";

export interface ICalendarDemoShowRenderer {
  renderCover(): Promise<HTMLCanvasElement>;
  renderPage(pageIndex: number): Promise<HTMLCanvasElement>;
  getPageCount(): number;
  getImages(): PageImage[];
}

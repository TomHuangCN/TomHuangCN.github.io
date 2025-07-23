import CalendarGen1 from './calendar-gen-1';

export interface Work {
  id: string;
  name: string;
  desc: string;
  content: React.ComponentType | string;
}

export const WORKS: Work[] = [
  {
    id: 'work1',
    name: '作品一',
    desc: '这是作品一的简介',
    content: CalendarGen1,
  },
  {
    id: 'work2',
    name: '作品二',
    desc: '这是作品二的简介',
    content: '这里是作品二的详细内容。',
  },
  {
    id: 'work3',
    name: '作品三',
    desc: '这是作品三的简介',
    content: '这里是作品三的详细内容。',
  },
]; 
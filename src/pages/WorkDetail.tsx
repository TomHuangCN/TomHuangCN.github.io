import React from 'react';
import { useParams } from 'react-router-dom';

const works = [
  { id: 'work1', name: '作品一', desc: '这是作品一的简介', content: '这里是作品一的详细内容。' },
  { id: 'work2', name: '作品二', desc: '这是作品二的简介', content: '这里是作品二的详细内容。' },
  { id: 'work3', name: '作品三', desc: '这是作品三的简介', content: '这里是作品三的详细内容。' },
];

const WorkDetail: React.FC = () => {
  const { id } = useParams();
  const work = works.find((w) => w.id === id);
  if (!work) return <div>未找到该作品</div>;
  return (
    <div>
      <h2>{work.name}</h2>
      <div style={{ color: '#888', marginBottom: 12 }}>{work.desc}</div>
      <div>{work.content}</div>
    </div>
  );
};

export default WorkDetail; 
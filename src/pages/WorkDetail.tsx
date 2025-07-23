import React from 'react';
import { useParams } from 'react-router-dom';
import { WORKS } from '../works/constants';

const WorkDetail: React.FC = () => {
  const { id } = useParams();
  const work = WORKS.find((w) => w.id === id);
  if (!work) return <div>未找到该作品</div>;
  return (
    <div>
      <h2>{work.name}</h2>
      <div style={{ color: '#888', marginBottom: 12 }}>{work.desc}</div>
      <div>
        {typeof work.content === 'string'
          ? work.content
          : React.createElement(work.content)}
      </div>
    </div>
  );
};

export default WorkDetail; 
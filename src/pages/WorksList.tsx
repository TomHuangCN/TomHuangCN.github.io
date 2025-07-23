import React from 'react';
import { Link } from 'react-router-dom';

const works = [
  { id: 'work1', name: '作品一', desc: '这是作品一的简介' },
  { id: 'work2', name: '作品二', desc: '这是作品二的简介' },
  { id: 'work3', name: '作品三', desc: '这是作品三的简介' },
];

const WorksList: React.FC = () => (
  <div>
    <h2>作品合集</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {works.map((work) => (
        <li key={work.id} style={{ marginBottom: 16 }}>
          <Link to={`/works/${work.id}`} style={{ fontSize: 18, fontWeight: 500 }}>
            {work.name}
          </Link>
          <div style={{ color: '#888', fontSize: 14 }}>{work.desc}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default WorksList; 
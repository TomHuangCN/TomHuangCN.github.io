import React from 'react';
import { Link } from 'react-router-dom';
import { WORKS } from '../works/constants';

const WorksList: React.FC = () => (
  <div>
    <h2>作品合集</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {WORKS.map((work) => (
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
import React from 'react';
import { Link } from 'react-router-dom';
import { useWorks } from '../works/constants';
import { useTranslation } from 'react-i18next';
// import { useContext } from 'react';
// import { SearchContext } from '../components/header';

const WorksList: React.FC = () => {
  const { t } = useTranslation();
  // const { keyword } = useContext(SearchContext);
  const WORKS = useWorks();
  
  const filteredWorks = WORKS.filter(_work => {
    // 这里可以添加过滤逻辑
    return true;
  });
  return (
    <div>
      <h2>{t('作品合集', '作品合集')}</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredWorks.map((work) => (
          <li key={work.id} style={{ marginBottom: 16 }}>
            <Link to={`/works/${work.id}`} style={{ fontSize: 18, fontWeight: 500 }}>
              {t(work.name)}
            </Link>
            <div style={{ color: '#888', fontSize: 14 }}>{t(work.desc)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorksList; 
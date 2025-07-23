import React from 'react';
import { useNavigate } from 'react-router-dom';

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 56,
  padding: '0 24px',
  background: '#f5f5f5',
  borderBottom: '1px solid #eee',
};
const leftStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', cursor: 'pointer' };
const centerStyle: React.CSSProperties = { flex: 1, display: 'flex', justifyContent: 'center' };
const rightStyle: React.CSSProperties = { display: 'flex', alignItems: 'center' };

const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header style={headerStyle}>
      <div style={leftStyle} onClick={() => navigate('/')}>MyLogo</div>
      <div style={centerStyle}>
        <input type="text" placeholder="搜索作品..." style={{ width: 240, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={rightStyle}>
        <button onClick={() => navigate('/cooperation')}>业务合作</button>
      </div>
    </header>
  );
};

export default Header; 
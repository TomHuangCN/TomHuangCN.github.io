import React from "react";
import { Link } from "react-router-dom";
import { useWorks } from "../works/constants";

const WorksList: React.FC = () => {
  const works = useWorks();

  // 目前未添加过滤逻辑，直接返回所有作品
  const filteredWorks = works;

  return (
    <div>
      <h2>作品合集</h2>
      <ul
        className="works-grid"
        style={{
          listStyle: "none",
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredWorks.map(work => (
          <li
            key={work.id}
            className="work-card"
            style={{
              marginBottom: 16,
              padding: "20px",
              border: "1px solid #eee",
              borderRadius: "8px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={`/works/${work.id}`}
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#1890ff",
                  textDecoration: "none",
                }}
              >
                {work.name}
              </Link>
            </div>
            <div
              style={{
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {work.desc}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorksList;

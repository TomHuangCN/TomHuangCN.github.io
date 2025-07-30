import React from "react";
import { Link } from "react-router-dom";
import { useWorks } from "../works/constants";
import Tooltip from "../components/tooltip";

const WorksList: React.FC = () => {
  const works = useWorks();

  // 目前未添加过滤逻辑，直接返回所有作品
  const filteredWorks = works;

  return (
    <div>
      <h2>作品合集</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredWorks.map(work => (
          <li key={work.id} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <Link
                to={`/works/${work.id}`}
                style={{ fontSize: 18, fontWeight: 500 }}
              >
                {work.name}
              </Link>
              {work.tips &&
                work.tips.map((tip, index) => (
                  <Tooltip key={index} content={tip.content} link={tip.link} />
                ))}
            </div>
            <div style={{ color: "#888", fontSize: 14 }}>{work.desc}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorksList;

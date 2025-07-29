import React, { useState } from "react";
import { useWorks } from "../works/constants";
import { useParams } from "react-router-dom";
import ImageModal from "../components/image-modal";

const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const WORKS = useWorks();
  const work = WORKS.find(w => w.id === id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!work) return <div>未找到该作品</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          marginBottom: 24,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* 左侧：标题和描述 */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: "0", marginBottom: 8 }}>{work.name}</h2>
          <div style={{ color: "#888", lineHeight: 1.6 }}>{work.desc}</div>
        </div>

        {/* 右侧：图解 */}
        {work.illustration && (
          <div
            style={{
              flexShrink: 0,
              width: 200,
              height: "auto",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <img
              src={work.illustration}
              alt={work.name}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        )}
      </div>

      <div>
        {typeof work.content === "string"
          ? work.content
          : React.createElement(work.content)}
      </div>

      {/* 图片模态框 */}
      {work.illustration && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageSrc={work.illustration}
          imageAlt={work.name}
        />
      )}
    </div>
  );
};

export default WorkDetail;

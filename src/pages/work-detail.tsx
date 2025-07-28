import React from "react";
import { useWorks } from "../works/constants";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const WORKS = useWorks();
  const work = WORKS.find(w => w.id === id);
  const { t } = useTranslation();
  if (!work) return <div>{t("未找到该作品", "未找到该作品")}</div>;
  return (
    <div>
      <h2>{t(work.name)}</h2>
      <div style={{ color: "#888", marginBottom: 12 }}>{t(work.desc)}</div>
      <div>
        {typeof work.content === "string"
          ? work.content
          : React.createElement(work.content)}
      </div>
    </div>
  );
};

export default WorkDetail;

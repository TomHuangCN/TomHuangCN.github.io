import React from "react";
import { useTranslation } from "react-i18next";

const Cooperation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t("业务合作")}</h2>
      <p>{t("请通过邮箱 huangtong.ht@qq.com 联系我。")}</p>
    </div>
  );
};

export default Cooperation;

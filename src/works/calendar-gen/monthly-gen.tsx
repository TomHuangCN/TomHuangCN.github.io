import CalendarGen from "./calendar-gen";
import { useTranslation } from "react-i18next";
import type { CalendarImage } from "./calendar-gen";

function renderPage(img: CalendarImage, idx: number) {
  const { t } = useTranslation();

  return (
    <div>
      <img src={img.url} alt="" style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "20%",
          background: "rgba(255,255,255,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        {idx === 0 ? t("封面") : t("{{num}}月", { num: idx })}
      </div>
    </div>
  );
}

export default function MonthlyGen() {
  return <CalendarGen maxImages={13} renderPage={renderPage} />;
}

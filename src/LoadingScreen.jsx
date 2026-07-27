import { useProgress } from "@react-three/drei";
import usePerformanceStore from "./utils/store/performanceDetectorStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const LoadingScreen = ({ started, onStarted }) => {
  const { progress } = useProgress();
  const level = usePerformanceStore(state => state.level);
  const { t } = useTranslation();
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress(prev => Math.max(prev, progress));
  }, [progress]);

  const canStart = displayProgress >= 100 && !!level;

  return (
    <div className={`loadingScreen ${started ? "loadingScreen--started" : ""}`}>
      <div className="loadingScreen__progress">
        <div
          className="loadingScreen__progress__value"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      <div className="loadingScreen__board">
        <div className="loadingScreen__logo">R≈</div>
        <button
          className="loadingScreen__button"
          disabled={!canStart}
          onClick={onStarted}
        >
          {canStart ? "Start" : `${Math.floor(displayProgress)}%`}
        </button>
        <p className="link-site">{t("loadingLikeSite")}</p>
        <p className="credit">{t("credit")}</p>
      </div>
    </div>
  );
};

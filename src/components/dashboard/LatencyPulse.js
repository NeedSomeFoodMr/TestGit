import React, { useState, useEffect, useMemo } from "react";

export const LatencyPulse = React.memo(({ isDark, height = 60 }) => {
  const [data, setData] = useState(Array(40).fill(20));
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newVal =
          Math.random() > 0.9
            ? Math.floor(Math.random() * 50) + 30
            : Math.floor(Math.random() * 20) + 10;
        return [...prev.slice(1), newVal];
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);
  const pathData = useMemo(() => {
    const width = 100;
    const step = width / (data.length - 1);
    return data
      .map(
        (val, i) =>
          `${i === 0 ? "M" : "L"} ${i * step} ${height - (val / 100) * height}`
      )
      .join(" ");
  }, [data, height]);
  const color = isDark ? "#4ade80" : "#059669";
  return (
    <div
      className="w-full overflow-hidden relative"
      style={{ height: `${height}px` }}
    >
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="pulseGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L 100 ${height} L 0 ${height} Z`}
          fill="url(#pulseGradient)"
        />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
});

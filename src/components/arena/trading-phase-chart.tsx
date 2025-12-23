import type { ArenaRound } from "@/types";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  ColorType,
  LineStyle,
  AreaSeries,
  type UTCTimestamp,
} from "lightweight-charts";

interface TradingPhaseChartProps {
  round: ArenaRound;
}

type TimeInterval = "1M" | "5M" | "15M";

// Mock price data for demonstration
function generateMockData(interval: TimeInterval) {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds =
    interval === "1M" ? 60 : interval === "5M" ? 300 : 900;
  const dataPoints = 50;
  const data: { time: UTCTimestamp; value: number }[] = [];

  let price = 0.001;

  for (let i = dataPoints; i >= 0; i--) {
    const time = (now - i * intervalSeconds) as UTCTimestamp;

    // Generate smooth upward trending price with some variation
    price = price + (Math.random() - 0.4) * 0.0002;
    price = Math.max(0.0005, price);
    data.push({
      time,
      value: price,
    });
  }

  return data;
}

export function TradingPhaseChart({ round }: TradingPhaseChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("5M");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#666666",
      },
      grid: {
        vertLines: {
          color: "rgba(0, 255, 136, 0.05)",
          style: LineStyle.Dotted,
        },
        horzLines: {
          color: "rgba(0, 255, 136, 0.05)",
          style: LineStyle.Dotted,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderColor: "rgba(0, 255, 136, 0.2)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(0, 255, 136, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "rgba(0, 255, 136, 0.3)",
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: "rgba(0, 255, 136, 0.3)",
          width: 1,
          style: LineStyle.Dashed,
        },
      },
    });

    // Create area series with gradient (v5 API)
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#00ff88",
      lineWidth: 2,
      topColor: "rgba(0, 255, 136, 0.4)",
      bottomColor: "rgba(0, 255, 136, 0.0)",
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: "#00ff88",
      crosshairMarkerBackgroundColor: "#0a0a0a",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Set initial data
    series.setData(generateMockData(selectedInterval));

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update data when interval changes
  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(generateMockData(selectedInterval));
    }
  }, [selectedInterval]);

  const intervals: TimeInterval[] = ["1M", "5M", "15M"];

  return (
    <div className="relative">
      {/* Main card with subtle border */}
      <div className="relative border border-eva-border/60 overflow-hidden">
        {/* Corner decorations */}
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* EVA logo icon */}
              <div className="w-6 h-6 flex items-center justify-center">
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="#a855f7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="#a855f7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="#a855f7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="font-mono text-sm text-white/60 tracking-wider">
                EVA/SOL
              </span>
              <span className="font-mono text-lg text-eva-primary font-semibold">
                {round.tokenPrice.toFixed(6)}
              </span>
            </div>

            {/* Time interval selector */}
            <div className="flex gap-1">
              {intervals.map((interval) => (
                <button
                  key={interval}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
                    selectedInterval === interval
                      ? "bg-eva-secondary text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                  }`}
                  onClick={() => setSelectedInterval(interval)}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          {/* Chart container */}
          <div className="px-4 pb-4">
            <div ref={chartContainerRef} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Corner decoration component
interface CornerDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

function CornerDecoration({ position }: CornerDecorationProps) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} w-8 h-8 pointer-events-none z-20`}
    >
      <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
        <path d="M0 0 L32 0 L32 2 L2 2 L2 32 L0 32 Z" fill="#00ff88" />
      </svg>
    </div>
  );
}

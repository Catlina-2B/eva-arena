import type { ArenaRound } from "@/types";
import type { PriceUpdateEventDto } from "@/types/websocket";
import type { UTCTimestamp } from "lightweight-charts";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  ColorType,
  LineStyle,
  AreaSeries,
} from "lightweight-charts";

import { usePriceCurve, useTrenchSocket } from "@/hooks";

interface TradingPhaseChartProps {
  round: ArenaRound;
}

type TimeInterval = "1M" | "5M" | "15M";

export function TradingPhaseChart({ round }: TradingPhaseChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("5M");
  const [realtimePrices, setRealtimePrices] = useState<
    { time: UTCTimestamp; value: number }[]
  >([]);

  // Use database primary key ID for API calls
  const trenchId = round.trenchDbId;

  // Fetch price curve data from API
  const { data: priceCurveData, isLoading } = usePriceCurve(trenchId, "SOL");

  // Subscribe to WebSocket for real-time price updates
  const handlePriceUpdate = useCallback((data: PriceUpdateEventDto) => {
    const newPoint = {
      time: Math.floor(data.timestamp / 1000) as UTCTimestamp,
      value: parseFloat(data.priceSol),
    };

    setRealtimePrices((prev) => {
      // Avoid duplicates
      const lastPoint = prev[prev.length - 1];
      if (lastPoint && lastPoint.time === newPoint.time) {
        return prev;
      }
      return [...prev, newPoint];
    });
  }, []);

  const { isConnected } = useTrenchSocket(trenchId, {
    onPriceUpdate: handlePriceUpdate,
    autoInvalidate: false, // We handle updates manually
  });

  // Convert API data to chart format
  const apiChartData = useMemo(() => {
    if (!priceCurveData?.pricePoints) return [];

    return priceCurveData.pricePoints.map((point) => ({
      time: Math.floor(point.timestamp / 1000) as UTCTimestamp,
      value: parseFloat(point.price),
    }));
  }, [priceCurveData]);

  // Merge API data with real-time updates
  const chartData = useMemo(() => {
    if (apiChartData.length === 0 && realtimePrices.length === 0) {
      return [];
    }

    // Combine and deduplicate
    const allPoints = [...apiChartData, ...realtimePrices];
    const uniquePoints = new Map<number, { time: UTCTimestamp; value: number }>();

    for (const point of allPoints) {
      uniquePoints.set(point.time, point);
    }

    // Sort by time
    return Array.from(uniquePoints.values()).sort((a, b) => a.time - b.time);
  }, [apiChartData, realtimePrices]);

  // Filter data based on selected interval
  const filteredData = useMemo(() => {
    if (chartData.length === 0) return [];

    const now = Math.floor(Date.now() / 1000);
    const intervalSeconds =
      selectedInterval === "1M"
        ? 60
        : selectedInterval === "5M"
          ? 300
          : 900;

    // Show last N minutes of data
    const displayMinutes =
      selectedInterval === "1M" ? 60 : selectedInterval === "5M" ? 30 : 60;
    const cutoffTime = now - displayMinutes * 60;

    // Filter and resample data
    const filtered = chartData.filter((point) => point.time >= cutoffTime);

    // Resample to interval
    if (filtered.length <= 1) return filtered;

    const resampled: { time: UTCTimestamp; value: number }[] = [];
    let currentBucket = Math.floor(filtered[0].time / intervalSeconds) * intervalSeconds;

    for (const point of filtered) {
      const bucket = Math.floor(point.time / intervalSeconds) * intervalSeconds;
      if (bucket !== currentBucket || resampled.length === 0) {
        resampled.push({
          time: bucket as UTCTimestamp,
          value: point.value,
        });
        currentBucket = bucket;
      } else {
        // Update last point with latest value in bucket
        resampled[resampled.length - 1].value = point.value;
      }
    }

    return resampled;
  }, [chartData, selectedInterval]);

  // Initialize chart
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

  // Update chart data when filteredData changes
  useEffect(() => {
    if (seriesRef.current && filteredData.length > 0) {
      seriesRef.current.setData(filteredData);
    }
  }, [filteredData]);

  // Get current price from latest data point or round
  const currentPrice = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].value;
    }
    return round.tokenPrice;
  }, [chartData, round.tokenPrice]);

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
                {currentPrice.toFixed(6)}
              </span>
              {/* Connection status indicator */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-eva-primary animate-pulse" : "bg-eva-danger"
                  }`}
                />
                <span className="text-xs text-white/30 font-mono">
                  {isConnected ? "LIVE" : "OFFLINE"}
                </span>
              </div>
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
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-eva-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-white/40 font-mono">
                    LOADING CHART...
                  </span>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-sm text-white/40 font-mono">
                    NO PRICE DATA YET
                  </span>
                  <p className="text-xs text-white/20 mt-1">
                    Waiting for trading activity...
                  </p>
                </div>
              </div>
            ) : (
              <div ref={chartContainerRef} className="w-full" />
            )}
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

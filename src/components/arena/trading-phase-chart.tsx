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
  LineType,
  AreaSeries,
} from "lightweight-charts";

import { usePriceCurve, useTrenchSocket } from "@/hooks";
import { formatPrice, formatSmallNumber } from "@/lib/trench-utils";

interface TradingPhaseChartProps {
  round: ArenaRound;
}

export function TradingPhaseChart({ round }: TradingPhaseChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [realtimePrices, setRealtimePrices] = useState<
    { time: UTCTimestamp; value: number }[]
  >([]);

  // Use database primary key ID for API calls
  const trenchDbId = round.trenchDbId;
  // Use on-chain trench ID for WebSocket subscription
  const onChainTrenchId = round.id;

  // Fetch price curve data from API
  const { data: priceCurveData, isLoading } = usePriceCurve(trenchDbId, "SOL");

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

  const { isConnected } = useTrenchSocket(onChainTrenchId, {
    onPriceUpdate: handlePriceUpdate,
    autoInvalidate: false, // We handle updates manually
    dbTrenchId: trenchDbId,
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

  // Use chart data directly without resampling
  // Just display all available data points as-is
  const filteredData = chartData;

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
      localization: {
        priceFormatter: (price: number) => formatSmallNumber(price, 4, 4, true),
        timeFormatter: (timestamp: number) => {
          const date = new Date(timestamp * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
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

    // Create area series with smooth curve and gradient shadow (v5 API)
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#00ff88",
      lineWidth: 2,
      lineType: LineType.Curved, // Smooth curved line
      topColor: "rgba(0, 255, 136, 0.5)", // Stronger gradient at top
      bottomColor: "rgba(0, 255, 136, 0.0)", // Fade to transparent
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
                {formatPrice(currentPrice)}
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
          </div>

          {/* Chart container */}
          <div className="px-4 pb-4">
            <div className="relative">
              {/* Always render chart container for proper initialization */}
              <div 
                ref={chartContainerRef} 
                className="w-full"
                style={{ height: 300, visibility: (isLoading || filteredData.length === 0) ? 'hidden' : 'visible' }}
              />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 w-full h-[300px] flex items-center justify-center bg-eva-dark">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-eva-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-white/40 font-mono">
                      LOADING CHART...
                    </span>
                  </div>
                </div>
              )}
              
              {/* Empty data overlay */}
              {!isLoading && filteredData.length === 0 && (
                <div className="absolute inset-0 w-full h-[300px] flex items-center justify-center bg-eva-dark">
                  <div className="text-center">
                    <span className="text-sm text-white/40 font-mono">
                      NO PRICE DATA YET
                    </span>
                    <p className="text-xs text-white/20 mt-1">
                      Waiting for trading activity...
                    </p>
                  </div>
                </div>
              )}
            </div>
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

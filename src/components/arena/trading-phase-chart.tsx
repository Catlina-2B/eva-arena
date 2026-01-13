import type { ArenaRound } from "@/types";
import type { TransactionDto } from "@/types/api";
import type { PriceUpdateEventDto } from "@/types/websocket";
import type { UTCTimestamp, SeriesMarker, Time } from "lightweight-charts";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  ColorType,
  LineStyle,
  LineType,
  AreaSeries,
} from "lightweight-charts";

import { usePriceCurve, useTrenchSocket } from "@/hooks";
import { formatPrice, formatSmallNumber } from "@/lib/trench-utils";

// User trade marker data for tooltip display
export interface UserTradeMarker {
  time: UTCTimestamp;
  price: number;
  type: "buy" | "sell";
  tokenAmount: number;
  solAmount: number;
  signature: string;
}

interface TradingPhaseChartProps {
  round: ArenaRound;
  /** User's buy/sell transactions to display as markers on the chart */
  userTransactions?: TransactionDto[];
}

export function TradingPhaseChart({ round, userTransactions }: TradingPhaseChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const [realtimePrices, setRealtimePrices] = useState<
    { time: UTCTimestamp; value: number }[]
  >([]);
  
  // Tooltip state for user trade markers
  const [hoveredMarker, setHoveredMarker] = useState<UserTradeMarker | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Use database primary key ID for API calls
  const trenchDbId = round.trenchDbId;
  // Use on-chain trench ID for WebSocket subscription
  // round.id is in format "eva-916", but WebSocket expects just the number
  const onChainTrenchId = parseInt(round.id.replace(/^eva-/, ""), 10);

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

  // Convert user transactions to trade markers
  const userTradeMarkers = useMemo((): UserTradeMarker[] => {
    if (!userTransactions || userTransactions.length === 0 || chartData.length === 0) {
      return [];
    }

    // Filter only BUY and SELL transactions
    const buySellTxs = userTransactions.filter(
      (tx) => tx.txType === "BUY" || tx.txType === "SELL"
    );

    // Create a map of timestamps to prices for quick lookup
    const priceMap = new Map<number, number>();
    for (const point of chartData) {
      priceMap.set(point.time, point.value);
    }

    return buySellTxs.map((tx): UserTradeMarker => {
      // Get timestamp from blockTime or createdAt
      const timestamp = tx.blockTime
        ? tx.blockTime
        : Math.floor(new Date(tx.createdAt).getTime() / 1000);

      // Find the closest price point to this transaction time
      let price = 0;
      let closestTimeDiff = Infinity;
      for (const [time, value] of priceMap.entries()) {
        const timeDiff = Math.abs(time - timestamp);
        if (timeDiff < closestTimeDiff) {
          closestTimeDiff = timeDiff;
          price = value;
        }
      }

      return {
        time: timestamp as UTCTimestamp,
        price,
        type: tx.txType === "BUY" ? "buy" as const : "sell" as const,
        tokenAmount: tx.tokenAmount ? parseFloat(tx.tokenAmount) / 1e6 : 0,
        solAmount: tx.solAmount ? parseFloat(tx.solAmount) / 1e9 : 0,
        signature: tx.signature,
      };
    }).sort((a, b) => a.time - b.time);
  }, [userTransactions, chartData]);

  // Convert trade markers to lightweight-charts markers format
  const chartMarkers = useMemo((): SeriesMarker<Time>[] => {
    return userTradeMarkers.map((marker) => ({
      time: marker.time as Time,
      position: marker.type === "buy" ? "belowBar" : "aboveBar",
      color: marker.type === "buy" ? "#34d399" : "#f87171",
      shape: "circle",
      size: 1.5,
    }));
  }, [userTradeMarkers]);

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
    
    // Create series markers plugin
    const seriesMarkers = createSeriesMarkers(series, []);
    markersRef.current = seriesMarkers;

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

  // Update markers when chartMarkers changes
  useEffect(() => {
    if (markersRef.current) {
      markersRef.current.setMarkers(chartMarkers);
    }
  }, [chartMarkers]);

  // Handle crosshair move for tooltip display
  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current || userTradeMarkers.length === 0) {
      return;
    }

    const chart = chartRef.current;
    const container = chartContainerRef.current;

    const handleCrosshairMove = (param: { time?: Time; point?: { x: number; y: number } }) => {
      if (!param.time || !param.point) {
        setHoveredMarker(null);
        setTooltipPosition(null);
        return;
      }

      // Find if there's a marker at this time (within a small tolerance)
      const hoveredTime = param.time as number;
      const tolerance = 60; // 60 seconds tolerance

      const marker = userTradeMarkers.find(
        (m) => Math.abs(m.time - hoveredTime) < tolerance
      );

      if (marker) {
        setHoveredMarker(marker);
        setTooltipPosition({ x: param.point.x, y: param.point.y });
      } else {
        setHoveredMarker(null);
        setTooltipPosition(null);
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [userTradeMarkers]);

  // Get current price from latest data point or round
  const currentPrice = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].value;
    }
    return round.tokenPrice;
  }, [chartData, round.tokenPrice]);

  return (
    <div className="relative">
      {/* Main card with subtle border and bracket hover effect */}
      <div className="relative border border-eva-border/60 overflow-hidden bracket-container">
        {/* Corner decorations */}
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Background grid pattern with animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated grid */}
          <div
            className="absolute inset-0 cyber-grid-anim"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 136, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 136, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "30px 30px",
            }}
          />
          {/* Scanning beam effect */}
          <div className="cyber-scan-line" />
        </div>

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
              
              {/* User Trade Tooltip */}
              {hoveredMarker && tooltipPosition && (
                <TradeTooltip
                  marker={hoveredMarker}
                  position={tooltipPosition}
                  containerRef={chartContainerRef}
                />
              )}
              
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

// Trade Tooltip component - matches Figma design
interface TradeTooltipProps {
  marker: UserTradeMarker;
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function TradeTooltip({ marker, position, containerRef }: TradeTooltipProps) {
  const isBuy = marker.type === "buy";
  const tooltipWidth = 150;
  const tooltipHeight = 90;
  
  // Calculate position to keep tooltip within chart bounds
  let left = position.x;
  let top = position.y - tooltipHeight - 20; // Above the point
  
  // Ensure tooltip doesn't go off the right edge
  if (containerRef.current) {
    const containerWidth = containerRef.current.clientWidth;
    if (left + tooltipWidth / 2 > containerWidth) {
      left = containerWidth - tooltipWidth / 2 - 10;
    }
    if (left - tooltipWidth / 2 < 0) {
      left = tooltipWidth / 2 + 10;
    }
  }
  
  // If tooltip would be above the chart, show below the point
  if (top < 0) {
    top = position.y + 20;
  }
  
  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };
  
  // Format token amount with K/M suffix
  const formatTokenAmount = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    return amount.toFixed(0);
  };

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: left,
        top: top,
        transform: "translateX(-50%)",
      }}
    >
      <div className="backdrop-blur-md bg-[rgba(12,14,18,0.95)] border border-white/10 rounded-md shadow-2xl overflow-hidden min-w-[150px]">
        {/* Header */}
        <div className="border-b border-white/5 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Status dot with glow */}
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isBuy ? "bg-emerald-400" : "bg-red-400"
              }`}
              style={{
                boxShadow: isBuy
                  ? "0 0 5px rgba(52, 211, 153, 0.5)"
                  : "0 0 5px rgba(248, 113, 113, 0.5)",
              }}
            />
            {/* Label */}
            <span
              className={`font-mono text-[10px] uppercase tracking-widest font-normal ${
                isBuy ? "text-emerald-400" : "text-red-400"
              }`}
            >
              My {isBuy ? "Buy" : "Sell"}
            </span>
          </div>
          {/* Time */}
          <span className="font-mono text-[9px] text-zinc-500">
            {formatTime(marker.time)}
          </span>
        </div>
        
        {/* Content */}
        <div className="px-3 py-2 space-y-1">
          {/* Amount row */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-400 font-medium">
              Amount
            </span>
            <span className="font-mono text-[10px] text-white font-bold">
              {formatTokenAmount(marker.tokenAmount)} EVA
            </span>
          </div>
          {/* Value row */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-400 font-medium">
              Value
            </span>
            <span className="font-mono text-[10px] text-zinc-300 font-bold">
              {marker.solAmount.toFixed(2)} SOL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

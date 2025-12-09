import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
    symbol?: string;
    interval?: string;
}

// Mock K-line data generator
const generateMockKlineData = (count: number = 100) => {
    const data = [];
    let basePrice = 1.0;
    const now = Date.now();

    for (let i = count; i > 0; i--) {
        const timestamp = now - (i * 60 * 1000); // 1 minute intervals
        const change = (Math.random() - 0.5) * 0.1;
        basePrice = Math.max(0.1, basePrice + change);

        const open = basePrice;
        const close = basePrice + (Math.random() - 0.5) * 0.05;
        const high = Math.max(open, close) + Math.random() * 0.03;
        const low = Math.min(open, close) - Math.random() * 0.03;
        const volume = Math.random() * 1000 + 500;

        data.push({
            time: Math.floor(timestamp / 1000),
            open: Number(open.toFixed(4)),
            high: Number(high.toFixed(4)),
            low: Number(low.toFixed(4)),
            close: Number(close.toFixed(4)),
            volume: Number(volume.toFixed(2))
        });
    }

    return data;
};

export function TradingViewChart({ symbol = 'TOKEN/SOL', interval = '1' }: TradingViewChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Check if TradingView library is loaded
        if (!(window as any).TradingView) {
            console.error('TradingView library not loaded');
            return;
        }

        const mockData = generateMockKlineData();

        try {
            // Create TradingView widget
            const widget = new (window as any).TradingView.widget({
                container: chartContainerRef.current,
                library_path: '/charting_library/',
                locale: 'en',
                symbol: symbol,
                interval: interval,
                fullscreen: false,
                autosize: true,
                theme: 'dark',
                style: '1', // Candle style
                toolbar_bg: 'rgba(18, 20, 26, 0.8)',
                enable_publishing: false,
                hide_side_toolbar: true,
                allow_symbol_change: false,
                save_image: false,
                studies_overrides: {},
                overrides: {
                    'paneProperties.background': '#12141a',
                    'paneProperties.backgroundType': 'solid',
                    'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.06)',
                    'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.06)',
                    'symbolWatermarkProperties.transparency': 90,
                    'scalesProperties.textColor': '#AAA',
                    'mainSeriesProperties.candleStyle.upColor': '#26a69a',
                    'mainSeriesProperties.candleStyle.downColor': '#ef5350',
                    'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
                    'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
                    'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
                    'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
                },
                disabled_features: [
                    'use_localstorage_for_settings',
                    'volume_force_overlay',
                    'header_symbol_search',
                    'header_compare',
                    'display_market_status',
                    'header_screenshot',
                    'header_undo_redo',
                ],
                enabled_features: ['hide_left_toolbar_by_default'],
                custom_css_url: '/tradingview-custom.css',
                datafeed: {
                    onReady: (callback: any) => {
                        setTimeout(() => callback({
                            supported_resolutions: ['1', '5', '15', '30', '60', '1D'],
                            supports_marks: false,
                            supports_timescale_marks: false,
                        }), 0);
                    },
                    searchSymbols: () => { },
                    resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any) => {
                        setTimeout(() => onSymbolResolvedCallback({
                            name: symbolName,
                            ticker: symbolName,
                            description: 'AMM Pool Token',
                            type: 'crypto',
                            session: '24x7',
                            timezone: 'Etc/UTC',
                            exchange: 'EVA',
                            minmov: 1,
                            pricescale: 10000,
                            has_intraday: true,
                            has_no_volume: false,
                            supported_resolutions: ['1', '5', '15', '30', '60', '1D'],
                            volume_precision: 2,
                            data_status: 'streaming',
                        }), 0);
                    },
                    getBars: (_symbolInfo: any, _resolution: string, _periodParams: any, onHistoryCallback: any) => {
                        setTimeout(() => {
                            onHistoryCallback(mockData, { noData: false });
                        }, 0);
                    },
                    subscribeBars: () => { },
                    unsubscribeBars: () => { },
                },
            });

            chartRef.current = widget;
        } catch (error) {
            console.error('Error creating TradingView chart:', error);
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [symbol, interval]);

    return (
        <div className="w-full h-full min-h-[400px] glass-card rounded-lg overflow-hidden">
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
}

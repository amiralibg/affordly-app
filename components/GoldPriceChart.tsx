import { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useGoldPriceHistory } from '@/lib/hooks/useGoldPriceHistory';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { TEXT, formatNumber as formatNumberUtil, formatDateShort } from '@/constants/text';
import { englishToPersian } from '@/utils/numbers';
import { BlurView } from 'expo-blur';

interface GoldPriceChartProps {
  days?: number; // Number of days to show (default 30)
}

const { width: screenWidth } = Dimensions.get('window');

export default function GoldPriceChart({ days = 30 }: GoldPriceChartProps) {
  const { theme, isDark } = useTheme();

  const { data, isLoading, error } = useGoldPriceHistory({ days });

  // Memoized styles
  const statBoxRightAlignStyle = useMemo(() => ({ alignItems: 'flex-end' as const }), []);

  const yAxisTextStyle = useMemo(
    () => ({
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontFamily: 'Vazirmatn_400Regular',
    }),
    [theme.colors.textSecondary]
  );

  const xAxisLabelTextStyle = useMemo(
    () => ({
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontFamily: 'Vazirmatn_400Regular',
    }),
    [theme.colors.textSecondary]
  );

  const formatNumber = (num: number) => {
    return formatNumberUtil(num);
  };

  const dynamicStyles = StyleSheet.create({
    changeBox: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 4,
    },
    changeText: {
      fontFamily: 'Vazirmatn_700Bold',
      fontSize: 14,
    },
    chartWrapper: {
      alignItems: 'center',
      marginTop: 8,
    },
    container: {
      borderRadius: 24,
      marginTop: 24,
      overflow: 'hidden',
    },
    contentContainer: {
        padding: 20,
    },
    errorText: {
      color: theme.colors.error,
      paddingVertical: 20,
      textAlign: 'center',
    },
    header: {
      marginBottom: 16,
    },
    loading: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      color: theme.colors.textSecondary,
      marginTop: 12,
    },
    statBox: {
      alignItems: 'flex-start',
      flex: 1,
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontFamily: 'Vazirmatn_400Regular',
      fontSize: 12,
      marginBottom: 4,
      textAlign: 'right',
    },
    statValue: {
      color: theme.colors.text,
      fontFamily: 'Vazirmatn_700Bold',
      fontSize: 16,
      textAlign: 'right',
    },
    statsRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.colors.text,
      fontFamily: 'Vazirmatn_700Bold',
      fontSize: 18,
      marginBottom: 8,
      textAlign: 'right',
    },
  });

  if (isLoading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={dynamicStyles.loadingText}>{TEXT.charts.loading}</Text>
        </View>
      </View>
    );
  }

  if (error || !data || data.history.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.errorText}>{TEXT.charts.noData}</Text>
      </View>
    );
  }

  // Calculate statistics
  const prices = data.history.map((p) => p.price);
  const currentPrice = prices[prices.length - 1];
  const oldestPrice = prices[0];
  const _minPrice = Math.min(...prices);
  const _maxPrice = Math.max(...prices);
  const priceChange = currentPrice - oldestPrice;
  const priceChangePercent = (priceChange / oldestPrice) * 100;
  const isPositive = priceChange >= 0;

  // Prepare chart data
  const labelInterval = Math.max(1, Math.floor(data.history.length / 4));

  const chartData = data.history.map((point, index) => ({
    value: point.price,
    label: index % labelInterval === 0 ? formatDateShort(point.date) : '',
    dataPointText: '',
  }));

  const maxXAxisLabels = Math.min(6, data.history.length);
  const xAxisStep = Math.max(1, Math.floor(data.history.length / (maxXAxisLabels - 1 || 1)));
  const xAxisLabels = data.history.map((point, index) =>
    index % xAxisStep === 0 || index === data.history.length - 1 ? formatDateShort(point.date) : ''
  );

  return (
    <View style={dynamicStyles.container}>
       <BlurView
        intensity={isDark ? 30 : 50}
        tint={isDark ? 'dark' : 'light'}
        style={dynamicStyles.contentContainer}
      >
        {/* Header with stats */}
        <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>{TEXT.charts.priceHistory}</Text>
            <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statBox}>
                <Text style={dynamicStyles.statLabel}>{TEXT.charts.currentPrice}</Text>
                <Text style={dynamicStyles.statValue}>{formatNumber(currentPrice)}</Text>
            </View>
            <View style={[dynamicStyles.statBox, statBoxRightAlignStyle]}>
                <Text style={dynamicStyles.statLabel}>{TEXT.charts.change(days)}</Text>
                <View style={dynamicStyles.changeBox}>
                {isPositive ? (
                    <TrendingUp size={16} color={theme.colors.success} strokeWidth={2.5} />
                ) : (
                    <TrendingDown size={16} color={theme.colors.error} strokeWidth={2.5} />
                )}
                <Text
                    style={[
                    dynamicStyles.changeText,
                    {
                        color: isPositive ? theme.colors.success : theme.colors.error,
                    },
                    ]}
                >
                    {isPositive ? '+' : ''}
                    {englishToPersian(priceChangePercent.toFixed(1))}٪
                </Text>
                </View>
            </View>
            </View>
        </View>

        {/* Chart */}
        <View style={dynamicStyles.chartWrapper}>
            <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={180}
            spacing={Math.max(20, (screenWidth - 80) / chartData.length)}
            thickness={3}
            color={theme.colors.primary}
            startFillColor={theme.colors.primary}
            endFillColor={theme.colors.primary}
            startOpacity={0.3}
            endOpacity={0.05}
            initialSpacing={10}
            endSpacing={10}
            noOfSections={4}
            yAxisColor="transparent"
            xAxisColor={theme.colors.border}
            yAxisTextStyle={yAxisTextStyle}
            xAxisLabelTextStyle={xAxisLabelTextStyle}
            xAxisLabelTexts={xAxisLabels}
            xAxisLabelsHeight={24}
            formatYLabel={(label) => formatNumber(parseFloat(label))}
            hideDataPoints={chartData.length > 30}
            dataPointsColor={theme.colors.primary}
            dataPointsRadius={4}
            curved
            areaChart
            hideRules
            />
        </View>
      </BlurView>
    </View>
  );
}

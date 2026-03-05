import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useExpenses } from '@/context/expenses-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function StatsScreen() {
  const { expenses, monthlyBudget } = useExpenses();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  const categoryStats = useMemo(() => {
    const spending = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(spending).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const dateStats = useMemo(() => {
    const spending = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.date] = (acc[expense.date] ?? 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(spending)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7);
  }, [expenses]);

  const maxCategoryValue = categoryStats[0]?.[1] ?? 0;
  const maxDateValue = Math.max(1, ...dateStats.map((entry) => entry[1]));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Statistical Analysis</ThemedText>
      <ThemedText>Visualize where your money goes with quick charts and trend signals.</ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Spend by category</ThemedText>
        {categoryStats.length === 0 ? (
          <ThemedText style={styles.emptyText}>Add expenses to see category analysis.</ThemedText>
        ) : (
          categoryStats.map(([category, amount]) => {
            const width = maxCategoryValue > 0 ? (amount / maxCategoryValue) * 100 : 0;
            return (
              <View key={category} style={styles.row}>
                <View style={styles.rowLabel}>
                  <ThemedText type="defaultSemiBold">{category}</ThemedText>
                  <ThemedText>{currencyFormatter.format(amount)}</ThemedText>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${width}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">7-day trend</ThemedText>
        {dateStats.length === 0 ? (
          <ThemedText style={styles.emptyText}>Add expenses to generate trend charts.</ThemedText>
        ) : (
          <View style={styles.chart}>
            {dateStats.map(([date, amount]) => {
              const height = Math.max(8, (amount / maxDateValue) * 110);
              return (
                <View key={date} style={styles.column}>
                  <View style={[styles.trendBar, { height }]} />
                  <ThemedText style={styles.smallText}>{date.slice(5)}</ThemedText>
                </View>
              );
            })}
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Insights</ThemedText>
        <ThemedText>- Total expenses: {expenses.length}</ThemedText>
        <ThemedText>- Total spent: {currencyFormatter.format(total)}</ThemedText>
        <ThemedText>
          - Budget utilization:{' '}
          {monthlyBudget > 0 ? `${Math.round((total / monthlyBudget) * 100)}%` : 'No budget set'}
        </ThemedText>
        <ThemedText>
          - Largest category: {categoryStats[0]?.[0] ?? 'N/A'}{' '}
          {categoryStats[0] ? `(${currencyFormatter.format(categoryStats[0][1])})` : ''}
        </ThemedText>
      </ThemedView>

      <ThemedText style={{ color: palette.icon }}>
        Tip: add expenses daily for clearer trend and budget forecasting.
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 42,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#7f7f7f50',
  },
  emptyText: {
    opacity: 0.8,
  },
  row: {
    gap: 6,
  },
  rowLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#7f7f7f35',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 99,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 130,
    paddingVertical: 6,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  trendBar: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
  },
  smallText: {
    fontSize: 12,
  },
});

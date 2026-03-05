import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useExpenses } from '@/context/expenses-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function DashboardScreen() {
  const { expenses, monthlyBudget, setMonthlyBudget, removeExpense } = useExpenses();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const totalSpent = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses]
  );
  const budgetLeft = monthlyBudget - totalSpent;
  const usage = monthlyBudget > 0 ? Math.min(1, totalSpent / monthlyBudget) : 0;
  const averageSpend = expenses.length === 0 ? 0 : totalSpent / expenses.length;

  const topCategory = useMemo(() => {
    const spendingByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None yet';
  }, [expenses]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Finance Dashboard</ThemedText>
      <ThemedText>Track spending, keep your budget healthy, and review recent activity.</ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Overview</ThemedText>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <ThemedText>Total spent</ThemedText>
            <ThemedText type="subtitle">{currencyFormatter.format(totalSpent)}</ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText>Expenses</ThemedText>
            <ThemedText type="subtitle">{expenses.length}</ThemedText>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <ThemedText>Avg expense</ThemedText>
            <ThemedText type="defaultSemiBold">{currencyFormatter.format(averageSpend)}</ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText>Top category</ThemedText>
            <ThemedText type="defaultSemiBold">{topCategory}</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Monthly budget</ThemedText>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${usage * 100}%`, backgroundColor: usage > 0.9 ? '#D9463B' : '#0a7ea4' },
            ]}
          />
        </View>
        <View style={styles.budgetRow}>
          <ThemedText>{currencyFormatter.format(totalSpent)} spent</ThemedText>
          <ThemedText>{currencyFormatter.format(monthlyBudget)} budget</ThemedText>
        </View>
        <ThemedText style={{ color: budgetLeft >= 0 ? palette.text : '#D9463B' }}>
          {budgetLeft >= 0
            ? `${currencyFormatter.format(budgetLeft)} remaining`
            : `${currencyFormatter.format(Math.abs(budgetLeft))} over budget`}
        </ThemedText>

        <View style={styles.quickBudgetRow}>
          {[1000, 1500, 2000].map((value) => (
            <Pressable
              key={value}
              style={[
                styles.chip,
                {
                  borderColor: palette.icon,
                  backgroundColor: monthlyBudget === value ? '#0a7ea420' : 'transparent',
                },
              ]}
              onPress={() => setMonthlyBudget(value)}>
              <ThemedText type="defaultSemiBold">{currencyFormatter.format(value)}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Recent expenses</ThemedText>
        {expenses.length === 0 ? (
          <ThemedText style={styles.emptyText}>No expenses yet. Add one from the Add tab.</ThemedText>
        ) : (
          expenses.slice(0, 6).map((expense) => (
            <View key={expense.id} style={[styles.expenseRow, { borderBottomColor: palette.icon }]}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{expense.title}</ThemedText>
                <ThemedText>
                  {expense.category} - {expense.date}
                </ThemedText>
              </View>
              <View style={styles.rightAction}>
                <ThemedText type="defaultSemiBold">
                  {currencyFormatter.format(expense.amount)}
                </ThemedText>
                <Pressable onPress={() => removeExpense(expense.id)}>
                  <ThemedText style={{ color: '#D9463B' }}>Delete</ThemedText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ThemedView>
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
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    gap: 3,
  },
  progressTrack: {
    height: 10,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: '#7f7f7f35',
  },
  progressFill: {
    height: '100%',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBudgetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyText: {
    opacity: 0.8,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rightAction: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 82,
  },
});

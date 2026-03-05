import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useExpenses } from '@/context/expenses-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function AddExpenseScreen() {
  const { addExpense, categories, addCategory } = useExpenses();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? 'Other');
  const [newCategory, setNewCategory] = useState('');

  const parsedAmount = useMemo(() => Number.parseFloat(amount), [amount]);

  function onCreateCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setSelectedCategory(trimmed);
    setNewCategory('');
  }

  function onSubmit() {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please provide a short expense title.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive number for amount.');
      return;
    }

    addExpense({
      title: title.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmount('');
    setNotes('');
    Alert.alert('Expense added', 'Your expense has been added to the dashboard.');
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Add Expense</ThemedText>
      <ThemedText>Capture spending quickly and keep categories organized.</ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Expense details</ThemedText>
        <TextInput
          placeholder="Title (e.g. Lunch)"
          placeholderTextColor={palette.icon}
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { borderColor: palette.icon, color: palette.text }]}
        />
        <TextInput
          placeholder="Amount"
          placeholderTextColor={palette.icon}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={[styles.input, { borderColor: palette.icon, color: palette.text }]}
        />
        <TextInput
          placeholder="Notes (optional)"
          placeholderTextColor={palette.icon}
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { borderColor: palette.icon, color: palette.text }]}
        />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Pick a category</ThemedText>
        <View style={styles.categoryWrap}>
          {categories.map((category) => {
            const active = category === selectedCategory;
            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    borderColor: palette.icon,
                    backgroundColor: active ? '#0a7ea420' : 'transparent',
                  },
                ]}
                onPress={() => setSelectedCategory(category)}>
                <ThemedText type={active ? 'defaultSemiBold' : 'default'}>{category}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Create category</ThemedText>
        <View style={styles.row}>
          <TextInput
            placeholder="New category"
            placeholderTextColor={palette.icon}
            value={newCategory}
            onChangeText={setNewCategory}
            style={[styles.input, styles.flexInput, { borderColor: palette.icon, color: palette.text }]}
          />
          <Pressable style={styles.addButton} onPress={onCreateCategory}>
            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
              Add
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText>
          Preview: {Number.isFinite(parsedAmount) ? currencyFormatter.format(parsedAmount) : '$0.00'} in{' '}
          {selectedCategory}
        </ThemedText>
        <Pressable style={styles.submitButton} onPress={onSubmit}>
          <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
            Save expense
          </ThemedText>
        </Pressable>
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  flexInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  submitButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});

import { useMemo, useState } from "react";
import {
  PlatformColor,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const items = [
  { title: "Barcode lookup", detail: "Scan or search products by SKU" },
  { title: "Batch history", detail: "View traceability for a product batch" },
  { title: "Supplier records", detail: "Find vendors and contact info" },
  { title: "Quality alerts", detail: "Surface issues by status and priority" },
];

const ios = {
  background: PlatformColor("systemGroupedBackground"),
  card: PlatformColor("secondarySystemGroupedBackground"),
  fill: PlatformColor("systemGray6"),
  label: PlatformColor("label"),
  secondaryLabel: PlatformColor("secondaryLabel"),
  separator: PlatformColor("separator"),
  systemBlue: PlatformColor("systemBlue"),
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) =>
      `${item.title} ${item.detail}`.toLowerCase().includes(value),
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Search</Text>
          <Text style={styles.title}>Find anything fast</Text>
          <Text style={styles.subtitle}>
            Search products, batches, alerts, and suppliers.
          </Text>
        </View>

        <View style={styles.searchShell}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={PlatformColor("placeholderText")}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.listCard}>
          {results.map((item, index) => (
            <View key={item.title}>
              <View style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
              {index < results.length - 1 ? (
                <View style={styles.separator} />
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ios.background,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: ios.background,
  },
  hero: {
    gap: 6,
  },
  eyebrow: {
    color: ios.systemBlue,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: ios.label,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: ios.secondaryLabel,
    fontSize: 15,
    lineHeight: 21,
  },
  searchShell: {
    borderRadius: 14,
    backgroundColor: ios.fill,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: "center",
  },
  searchInput: {
    color: ios.label,
    fontSize: 17,
    paddingVertical: 10,
  },
  listCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: ios.card,
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCopy: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    color: ios.label,
    fontSize: 16,
    fontWeight: "600",
  },
  rowDetail: {
    color: ios.secondaryLabel,
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    color: ios.secondaryLabel,
    fontSize: 24,
    marginTop: -2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
    backgroundColor: PlatformColor("separator"),
  },
});

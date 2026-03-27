import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

// ── Placeholder conversation data ─────────────────────────────────────────────
const MOCK_CHATS: { id: string; title: string; preview: string; ts: string }[] = [];

// ── Compose button ─────────────────────────────────────────────────────────────
function ComposeButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.composeBtn, pressed && { opacity: 0.7 }]}>
      <SymbolView
        name="square.and.pencil"
        style={styles.composeBtnIcon}
        tintColor={ios26Colors.accent}
        type="hierarchical"
      />
    </Pressable>
  );
}

// ── Chat row ───────────────────────────────────────────────────────────────────
function ChatRow({
  item,
  last,
}: {
  item: (typeof MOCK_CHATS)[number];
  last: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chatRow,
        !last && styles.chatRowBorder,
        pressed && styles.chatRowPressed,
      ]}>
      <View style={styles.chatAvatar}>
        <SymbolView
          name="sparkle"
          style={styles.chatAvatarIcon}
          tintColor="#fff"
          type="hierarchical"
        />
      </View>
      <View style={styles.chatBody}>
        <View style={styles.chatMeta}>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.chatTs}>{item.ts}</Text>
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.preview}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? MOCK_CHATS.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.preview.toLowerCase().includes(query.toLowerCase()),
      )
    : MOCK_CHATS;

  return (
    <View style={styles.root}>
      {/* Title bar */}
      <SafeAreaView edges={["top"]}>
        <View style={[styles.titleBar, { paddingTop: 8 }]}>
          <Text style={styles.screenTitle}>Chats</Text>
          <ComposeButton onPress={() => {}} />
        </View>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <SymbolView
            name="magnifyingglass"
            style={styles.searchIcon}
            tintColor={ios26Colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={ios26Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconShell}>
              <SymbolView
                name="sparkle"
                style={styles.emptyIcon}
                tintColor={ios26Colors.accent}
                type="hierarchical"
              />
            </View>
            <Text style={styles.emptyTitle}>Ask anything</Text>
            <Text style={styles.emptySub}>
              Open any product and tap the AI button to start a conversation about
              ingredients, nutrition, allergens, and more.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.newChatBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => {}}>
              <SymbolView
                name="plus"
                style={styles.newChatBtnIcon}
                tintColor="#fff"
              />
              <Text style={styles.newChatBtnText}>New chat</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((item, index) => (
              <ChatRow key={item.id} item={item} last={index === filtered.length - 1} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  // ── Title bar ──────────────────────────────────────────────────────────────
  titleBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  composeBtn: {
    paddingBottom: 4,
  },
  composeBtnIcon: {
    width: 26,
    height: 26,
  },

  // ── Search bar ─────────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: ios26Colors.surfaceElevated,
    gap: 8,
  },
  searchIcon: {
    width: 16,
    height: 16,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 0,
  },

  // ── Scroll content ─────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
  },

  // ── List ───────────────────────────────────────────────────────────────────
  list: {
    marginHorizontal: 16,
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    overflow: "hidden",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 13,
  },
  chatRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  chatRowPressed: {
    backgroundColor: ios26Colors.surfaceElevated,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatarIcon: {
    width: 20,
    height: 20,
  },
  chatBody: {
    flex: 1,
    gap: 3,
  },
  chatMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  chatTs: {
    fontSize: 12,
    color: ios26Colors.textMuted,
    marginLeft: 8,
  },
  chatPreview: {
    fontSize: 13,
    color: ios26Colors.textMuted,
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 36,
    gap: 12,
  },
  emptyIconShell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(10,132,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyIcon: {
    width: 36,
    height: 36,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 15,
    color: ios26Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  newChatBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: ios26Radii.pill,
    backgroundColor: ios26Colors.accent,
  },
  newChatBtnIcon: {
    width: 16,
    height: 16,
  },
  newChatBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

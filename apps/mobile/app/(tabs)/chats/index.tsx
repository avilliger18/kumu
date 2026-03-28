import { api } from "@kumu/backend/convex/_generated/api";
import { router } from "expo-router";
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
import { useMutation, useQuery } from "convex/react";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ChatRow({ session, last }: { session: any; last: boolean }) {
  return (
    <Pressable
      onPress={() => router.push(`/chat?id=${session._id}`)}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && styles.rowPressed,
      ]}>
      <View style={styles.rowAvatar}>
        <SymbolView
          name="sparkle"
          style={styles.rowAvatarIcon}
          tintColor="#fff"
          type="hierarchical"
        />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowMeta}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {session.title}
          </Text>
          <Text style={styles.rowTs}>{timeAgo(session.updatedAt)}</Text>
        </View>
        <Text style={styles.rowPreview} numberOfLines={1}>
          {session.lastMessageText || "No messages yet"}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const sessions = useQuery(api.chats.getUserSessions) ?? [];
  const createSession = useMutation(api.chats.createSession);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? sessions.filter(
        (s: any) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.lastMessageText?.toLowerCase().includes(query.toLowerCase()),
      )
    : sessions;

  const startNewChat = async () => {
    const id = await createSession({ title: "New Chat" });
    router.push(`/chat?id=${id}`);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]}>
        {/* Title bar */}
        <View style={[styles.titleBar, { paddingTop: 8 }]}>
          <Text style={styles.screenTitle}>Chats</Text>
          <Pressable
            onPress={startNewChat}
            hitSlop={12}
            style={({ pressed }) => [styles.composeBtn, pressed && { opacity: 0.65 }]}>
            <SymbolView
              name="square.and.pencil"
              style={styles.composeBtnIcon}
              tintColor={ios26Colors.accent}
              type="hierarchical"
            />
          </Pressable>
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

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
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
              {query
                ? "No chats match your search."
                : "Open a product and tap the AI button, or start a new chat with the compose button above."}
            </Text>
            {!query ? (
              <Pressable
                onPress={startNewChat}
                style={({ pressed }) => [styles.newChatBtn, pressed && { opacity: 0.8 }]}>
                <SymbolView name="plus" style={styles.newChatBtnIcon} tintColor="#fff" />
                <Text style={styles.newChatBtnText}>New chat</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((session: any, index: number) => (
              <ChatRow
                key={session._id}
                session={session}
                last={index === filtered.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ios26Colors.bg },

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
    color: ios26Colors.textPrimary,
    letterSpacing: -0.5,
  },
  composeBtn: { paddingBottom: 4 },
  composeBtnIcon: { width: 26, height: 26 },

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
  searchIcon: { width: 16, height: 16 },
  searchInput: { flex: 1, color: ios26Colors.textPrimary, fontSize: 15, paddingVertical: 0 },

  scrollContent: { flexGrow: 1 },

  list: {
    marginHorizontal: 16,
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  rowPressed: { backgroundColor: ios26Colors.surfaceElevated },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowAvatarIcon: { width: 20, height: 20 },
  rowBody: { flex: 1, gap: 3 },
  rowMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: ios26Colors.textPrimary, flex: 1 },
  rowTs: { fontSize: 12, color: ios26Colors.textMuted, marginLeft: 8 },
  rowPreview: { fontSize: 13, color: ios26Colors.textMuted },

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
    backgroundColor: "rgba(21,46,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyIcon: { width: 36, height: 36 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: ios26Colors.textPrimary, letterSpacing: -0.3 },
  emptySub: { fontSize: 15, color: ios26Colors.textMuted, textAlign: "center", lineHeight: 22 },
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
  newChatBtnIcon: { width: 16, height: 16 },
  newChatBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

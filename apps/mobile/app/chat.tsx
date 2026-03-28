import { api } from "@kumu/backend/convex/_generated/api";
import type { Id } from "@kumu/backend/convex/_generated/dataModel";
import { Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

const SUGGESTIONS = [
  "What are the main ingredients?",
  "Is this product healthy?",
  "Does it contain allergens?",
  "How processed is it?",
];

function AiMessage({ text }: { text: string }) {
  return (
    <View style={s.aiRow}>
      <View style={s.aiAvatar}>
        <SymbolView name="sparkle" style={s.aiAvatarIcon} tintColor="#fff" type="hierarchical" />
      </View>
      <View style={s.aiBubble}>
        <Text style={s.aiBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <View style={s.userRow}>
      <View style={s.userBubble}>
        <Text style={s.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const sessionId = id as Id<"chatSessions">;
  const session = useQuery(api.chats.getSession, sessionId ? { sessionId } : "skip");
  const addMessage = useMutation(api.chats.addMessage);

  const messages = session?.messages ?? [];

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionId) return;

    setShowSuggestions(false);
    setInput("");

    await addMessage({ sessionId, role: "user", text: trimmed });

    // Placeholder AI reply
    setTimeout(async () => {
      await addMessage({
        sessionId,
        role: "ai",
        text: "AI responses coming soon — stay tuned!",
      });
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 600);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: session?.title ?? "Chat",
          headerStyle: { backgroundColor: ios26Colors.surface },
          headerTintColor: "#fff",
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <KeyboardAvoidingView
        style={s.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={88}>
        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messages.map((m) =>
            m.role === "ai" ? (
              <AiMessage key={m._id} text={m.text} />
            ) : (
              <UserMessage key={m._id} text={m.text} />
            ),
          )}

          {showSuggestions && session?.productBarcode ? (
            <View style={s.suggestions}>
              {SUGGESTIONS.map((sug) => (
                <Pressable
                  key={sug}
                  onPress={() => send(sug)}
                  style={({ pressed }) => [s.chip, pressed && s.chipPressed]}>
                  <Text style={s.chipText}>{sug}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={[s.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TextInput
            style={s.input}
            placeholder="Ask about this product…"
            placeholderTextColor={ios26Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim()}
            style={({ pressed }) => [
              s.sendBtn,
              !input.trim() && s.sendBtnDisabled,
              pressed && input.trim() ? { opacity: 0.75 } : null,
            ]}>
            <SymbolView name="arrow.up" style={s.sendBtnIcon} tintColor="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: ios26Colors.surface },
  messages: { flex: 1 },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },

  aiRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  aiAvatarIcon: { width: 16, height: 16 },
  aiBubble: {
    flex: 1,
    backgroundColor: ios26Colors.surfaceElevated,
    borderRadius: ios26Radii.md,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  aiBubbleText: { color: ios26Colors.textPrimary, fontSize: 15, lineHeight: 22 },

  userRow: { alignItems: "flex-end" },
  userBubble: {
    maxWidth: "78%",
    backgroundColor: ios26Colors.accent,
    borderRadius: ios26Radii.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },

  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    paddingLeft: 42,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: ios26Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.surfaceHigh,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  chipPressed: { opacity: 0.7 },
  chipText: { color: ios26Colors.textPrimary, fontSize: 13, fontWeight: "500" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ios26Colors.separator,
    backgroundColor: ios26Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: ios26Colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: "#fff",
    fontSize: 15,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendBtnDisabled: { backgroundColor: ios26Colors.surfaceHigh },
  sendBtnIcon: { width: 16, height: 16 },
});

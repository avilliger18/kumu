import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

                                                                                  
async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.tokenIdentifier as string;
}

                                                                                  
                                                                  
export const createSession = mutation({
  args: {
    title: v.string(),
    productBarcode: v.optional(v.string()),
  },
  handler: async (ctx, { title, productBarcode }) => {
    const userTokenIdentifier = await requireUser(ctx);
    const now = Date.now();

    const sessionId = await ctx.db.insert("chatSessions", {
      userTokenIdentifier,
      title,
      productBarcode,
      createdAt: now,
      updatedAt: now,
    });

    const greeting = productBarcode
      ? `How can I assist you today? I can answer questions about ${title} — ingredients, nutrition, allergens, and more.`
      : "Hi! Ask me anything about food, nutrition, or product ingredients.";

    await ctx.db.insert("chatMessages", {
      sessionId,
      role: "ai",
      text: greeting,
      createdAt: now,
    });

    return sessionId;
  },
});

// ── addMessage ─────────────────────────────────────────────────────────────────
export const addMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("ai")),
    text: v.string(),
  },
  handler: async (ctx, { sessionId, role, text }) => {
    const userTokenIdentifier = await requireUser(ctx);

    const session = await ctx.db.get(sessionId);
    if (!session || session.userTokenIdentifier !== userTokenIdentifier) {
      throw new Error("Session not found");
    }

    const now = Date.now();
    await ctx.db.insert("chatMessages", { sessionId, role, text, createdAt: now });
    await ctx.db.patch(sessionId, { updatedAt: now });
  },
});

// ── getUserSessions ────────────────────────────────────────────────────────────
// Returns all sessions for the current user, newest first, with last message preview.
export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const userTokenIdentifier = await requireUser(ctx);

    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user_updatedAt", (q) => q.eq("userTokenIdentifier", userTokenIdentifier))
      .order("desc")
      .take(50);

    return await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await ctx.db
          .query("chatMessages")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .order("desc")
          .first();

        return {
          ...session,
          lastMessageText: lastMessage?.text ?? "",
          lastMessageRole: lastMessage?.role ?? "ai",
        };
      }),
    );
  },
});

// ── getSession ─────────────────────────────────────────────────────────────────
// Returns a single session with all its messages.
export const getSession = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, { sessionId }) => {
    const userTokenIdentifier = await requireUser(ctx);

    const session = await ctx.db.get(sessionId);
    if (!session || session.userTokenIdentifier !== userTokenIdentifier) return null;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();

    return { ...session, messages };
  },
});

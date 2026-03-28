import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { splitName } from "./utils";

type AuthCtx = {
  auth: {
    getUserIdentity: () => Promise<any>;
  };
  db: any;
};

async function getCurrentIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }
  return identity;
}

export const syncCurrentProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentIdentity(ctx as AuthCtx);
    const tokenIdentifier = identity.tokenIdentifier;
    const now = Date.now();
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier),
      )
      .unique();

    if (existing) {
      const names = splitName(identity);
      const shouldBackfillNames = !existing.firstName || !existing.lastName;
      if (existing.email !== identity.email) {
        await ctx.db.patch(existing._id, {
          ...(shouldBackfillNames
            ? {
                firstName: names.firstName,
                lastName: names.lastName,
                name: names.name,
              }
            : {}),
          email: identity.email,
          updatedAt: now,
        });
      } else if (shouldBackfillNames) {
        await ctx.db.patch(existing._id, {
          firstName: names.firstName,
          lastName: names.lastName,
          name: names.name,
          updatedAt: now,
        });
      }
      return existing._id;
    }

    const names = splitName(identity);
    return await ctx.db.insert("profiles", {
      tokenIdentifier,
      firstName: names.firstName,
      lastName: names.lastName,
      name: names.name,
      email: identity.email,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const currentProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("profiles")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});

export const updateCurrentProfileName = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getCurrentIdentity(ctx as AuthCtx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!profile) {
      const providedName = args.name?.trim();
      const firstName =
        args.firstName?.trim() || providedName?.split(/\s+/)[0] || "";
      const lastName =
        args.lastName?.trim() ||
        providedName?.split(/\s+/).slice(1).join(" ") ||
        "";
      const names = splitName({
        name: [firstName, lastName].filter(Boolean).join(" "),
        email: identity.email,
      });
      await ctx.db.insert("profiles", {
        tokenIdentifier: identity.tokenIdentifier,
        firstName: names.firstName,
        lastName: names.lastName,
        name: names.name,
        email: identity.email,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }

    const nextFirst = (
      args.firstName?.trim() ||
      args.name?.trim()?.split(/\s+/)[0] ||
      ""
    ).trim();
    const nextLast = (
      args.lastName?.trim() ||
      args.name?.trim()?.split(/\s+/).slice(1).join(" ") ||
      ""
    ).trim();
    if (!nextFirst) {
      throw new Error("First name cannot be empty");
    }

    await ctx.db.patch(profile._id, {
      firstName: nextFirst.slice(0, 40),
      lastName: nextLast.slice(0, 40),
      name: [nextFirst, nextLast].filter(Boolean).join(" ").trim(),
      updatedAt: Date.now(),
    });
  },
});

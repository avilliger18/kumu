import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";

export const getAffectedUsers = internalQuery({
  args: {
    productId: v.id("products"),
    chargeNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("productScans")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const chargeNorm = args.chargeNumber
      ? args.chargeNumber.trim().toUpperCase()
      : undefined;

    const seen = new Set<string>();
    const result: { userTokenIdentifier: string; productTitle?: string }[] = [];

    for (const scan of scans) {
      if (!scan.userTokenIdentifier) continue;
      if (chargeNorm && scan.batchCodeNormalized !== chargeNorm) continue;
      if (seen.has(scan.userTokenIdentifier)) continue;
      seen.add(scan.userTokenIdentifier);
      result.push({
        userTokenIdentifier: scan.userTokenIdentifier,
        productTitle: scan.productTitle,
      });
    }

    return result;
  },
});

export const getUserEmail = internalQuery({
  args: { userTokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.userTokenIdentifier),
      )
      .first();
    return profile?.email ?? null;
  },
});

export const insertNotification = internalMutation({
  args: {
    userTokenIdentifier: v.string(),
    alertId: v.id("productAlerts"),
    productId: v.id("products"),
    productTitle: v.optional(v.string()),
    faultDescription: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    chargeNumber: v.optional(v.string()),
    emailSent: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("userNotifications", {
      userTokenIdentifier: args.userTokenIdentifier,
      alertId: args.alertId,
      productId: args.productId,
      productTitle: args.productTitle,
      faultDescription: args.faultDescription,
      severity: args.severity,
      chargeNumber: args.chargeNumber,
      emailSent: args.emailSent,
      createdAt: Date.now(),
    });
  },
});

export const fanOutAlertEmails = internalAction({
  args: {
    alertId: v.id("productAlerts"),
    productId: v.id("products"),
    faultDescription: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    chargeNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    const affectedUsers = await ctx.runQuery(
      internal.notifications.getAffectedUsers,
      { productId: args.productId, chargeNumber: args.chargeNumber },
    );

    if (affectedUsers.length === 0) return;

    const severityLabel =
      args.severity === "high"
        ? "HIGH"
        : args.severity === "medium"
          ? "MEDIUM"
          : "LOW";

    const chargeInfo = args.chargeNumber
      ? ` (Charge/Lot: ${args.chargeNumber})`
      : "";

    for (const user of affectedUsers) {
      // Get the user's email
      const email = await ctx.runQuery(internal.notifications.getUserEmail, {
        userTokenIdentifier: user.userTokenIdentifier,
      });

      // Record the notification regardless of whether email was sent
      let emailSent = false;

      if (email && resendApiKey) {
        const productName = user.productTitle ?? "a product you scanned";
        const html = buildEmailHtml({
          productName,
          severity: args.severity,
          severityLabel,
          faultDescription: args.faultDescription,
          chargeInfo,
        });

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Kumu Alerts <alerts@modulbaukasten.tie-international.com>",
              to: [email],
              subject: `[${severityLabel}] Product Alert${chargeInfo}`,
              html,
            }),
          });
          emailSent = res.ok;
        } catch {
          // swallow — we still record the notification
        }
      }

      await ctx.runMutation(internal.notifications.insertNotification, {
        userTokenIdentifier: user.userTokenIdentifier,
        alertId: args.alertId,
        productId: args.productId,
        productTitle: user.productTitle,
        faultDescription: args.faultDescription,
        severity: args.severity,
        chargeNumber: args.chargeNumber,
        emailSent,
      });
    }
  },
});

function buildEmailHtml(opts: {
  productName: string;
  severity: "low" | "medium" | "high";
  severityLabel: string;
  faultDescription: string;
  chargeInfo: string;
}) {
  const color =
    opts.severity === "high"
      ? "#dc2626"
      : opts.severity === "medium"
        ? "#d97706"
        : "#16a34a";

  return `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f9fafb; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: ${color}; padding: 20px 24px;">
      <p style="margin: 0; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        ${opts.severityLabel} SEVERITY ALERT
      </p>
      <h1 style="margin: 8px 0 0; color: #fff; font-size: 20px;">Product Alert</h1>
    </div>
    <div style="padding: 24px;">
      <p style="margin: 0 0 8px; color: #374151; font-size: 15px;">
        A quality alert has been issued for <strong>${opts.productName}</strong>${opts.chargeInfo}.
      </p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #111827; font-size: 15px; line-height: 1.5;">
          ${opts.faultDescription}
        </p>
      </div>
      <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">
        You are receiving this because you previously scanned this product.
        Open the Kumu app for more details.
      </p>
    </div>
  </div>
</body>
</html>`;
}

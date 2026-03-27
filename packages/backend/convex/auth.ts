import { convexAuth } from "@convex-dev/auth/server";
import { ConsoleOTP } from "./OTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ConsoleOTP],
});

import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in", "/verify"]);

export default convexAuthNextjsMiddleware(async (request) => {
  if (!isPublicRoute(request) && !(await isAuthenticatedNextjs())) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (isPublicRoute(request) && (await isAuthenticatedNextjs())) {
    return NextResponse.redirect(new URL("/", request.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

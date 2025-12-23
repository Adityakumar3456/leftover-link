import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // 1. MAKE THESE ROUTES PUBLIC (So users don't get blocked)
  publicRoutes: ["/", "/api/uploadthing"], 

  // 2. IGNORE THESE ROUTES (To prevent loops on static files)
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\\.[\\w]+$)", "/_next"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
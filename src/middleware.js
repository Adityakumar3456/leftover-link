import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// We ONLY protect these specific routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/my-food(.*)',
  '/api/uploadthing'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
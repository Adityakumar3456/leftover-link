import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// We ONLY lock these specific routes.
// The Home Page ("/") is NOT in this list, so it will be Public.
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
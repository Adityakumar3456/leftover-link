import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define which routes are PROTECTED (require login)
// Everything else (like Home "/") is automatically Public.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',  // Lock Dashboard
  '/my-food(.*)',    // Lock My Orders
  '/api/uploadthing' // Lock Uploads
]);

export default clerkMiddleware((auth, req) => {
  // 2. Only protect the specific routes we defined above
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
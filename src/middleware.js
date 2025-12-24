import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Simple matcher for Protected Routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/my-food(.*)',
  '/api/uploadthing'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Standard Next.js matcher
    '/((?!.*\\..*|_next).*)', 
    '/', 
    '/(api|trpc)(.*)'
  ],
};
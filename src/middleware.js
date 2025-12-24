import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define which pages need protection
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/my-food(.*)',
  '/api/uploadthing'
]);

// 2. Run the check
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// 3. Configuration to avoid static files
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
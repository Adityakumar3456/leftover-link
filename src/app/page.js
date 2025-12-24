import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/Footer"; 
import FoodFeed from "@/components/FoodFeed"; 

export const dynamic = "force-dynamic";

export default async function Home() {
  // Sync user to DB, but DO NOT Redirect
  await checkUser();

  // Fetch all food for the Feed
  const freeItems = await db.foodItem.findMany({
    where: { status: "available", price: 0 },
    orderBy: { createdAt: "desc" },
  });

  const discountItems = await db.foodItem.findMany({
    where: { status: "available", price: { gt: 0 } },
    orderBy: { createdAt: "desc" },
  });

  const allItems = [...discountItems, ...freeItems];

  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      
      {/* HEADER */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-indigo-700 flex items-center gap-2 cursor-pointer">
              🥘 <span className="hidden md:inline">LeftoverLink</span><span className="md:hidden">Leftover</span>
            </h1>
          </Link>
          
          <div className="flex gap-2 items-center">
            <SignedOut>
              <SignInButton><Button size="sm" className="bg-indigo-600">Login</Button></SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="bg-indigo-600 h-9">Post +</Button>
              </Link>
              <Link href="/my-food">
                <Button variant="ghost" size="sm" className="h-9">Orders</Button>
              </Link>
              {/* This UserButton is how you Logout! */}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* LANDING PAGE (Logged OUT) */}
      <SignedOut>
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Don't Waste. <span className="text-indigo-600">Share It.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-lg">
            Share food, save money, and help your community.
          </p>
          <SignInButton>
            <Button size="lg" className="bg-indigo-600 text-lg px-8 py-6 rounded-full">Start Sharing Now</Button>
          </SignInButton>
        </main>
      </SignedOut>

      {/* APP FEED (Logged IN) */}
      <SignedIn>
        <main className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🍽️ Live Food Feed</h2>
            <p className="text-gray-500">Find free meals and hot deals near you.</p>
          </div>
          <FoodFeed initialItems={allItems} />
        </main>
      </SignedIn>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
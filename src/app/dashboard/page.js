import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  // 1. Run the sync check (if logged in)
  await checkUser();

  // 2. Fetch all food items (Newest first)
  const items = await db.foodItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-8 font-sans max-w-6xl mx-auto">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">LeftoverLink 🥘</h1>
        
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton>
              <Button>Sign In to Post</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline">Post Food +</Button>
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* FOOD FEED */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {items.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No food available yet.</p>
            <p className="text-sm text-gray-400">Be the first to share!</p>
          </div>
        )}

        {items.map((item) => (
          <Card key={item.id} className="w-full shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                ⏰ Pickup: {item.pickupTime}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Claim This Item</Button>
            </CardFooter>
          </Card>
        ))}

      </main>
    </div>
  );
}
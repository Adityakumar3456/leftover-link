import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { claimFoodItem } from "@/actions/claim"; // Make sure this path is correct for your folder!
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();

  // Fetch only AVAILABLE food
  const items = await db.foodItem.findMany({
    where: { 
      status: "available",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-8 font-sans max-w-6xl mx-auto">
      
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">LeftoverLink 🥘</h1>
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton><Button>Sign In to Post</Button></SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard"><Button variant="outline">Post Food +</Button></Link>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No food available right now.</p>
          </div>
        )}

        {items.map((item) => {
          // --- TIMER LOGIC ---
          const now = new Date();
          // If no deadline is set, assume it's valid for 24 hours (fallback)
          const deadline = item.deadline ? new Date(item.deadline) : new Date(now.getTime() + 24*60*60*1000);
          
          const timeDiff = deadline - now; 
          const minutesLeft = Math.floor(timeDiff / 1000 / 60);
          
          // If time is up, don't show the card at all
          if (timeDiff < 0) return null;

          // Urgent if less than 60 mins left
          const isUrgent = minutesLeft > 0 && minutesLeft <= 60;

          return (
            <Card key={item.id} className={`w-full shadow-md transition ${isUrgent ? 'border-2 border-red-500 bg-red-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  {isUrgent && (
                     <span className="bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                       HURRY! {minutesLeft}m left
                     </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="text-sm font-semibold text-gray-700">
                  ⏰ Pickup: {item.pickupTime}
                </div>
              </CardContent>
              
              <CardFooter>
                 <form action={claimFoodItem} className="w-full">
                    <input type="hidden" name="id" value={item.id} />
                    <Button className={`w-full ${isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                      {isUrgent ? "Claim Fast!" : "Claim This Item"}
                    </Button>
                  </form>
              </CardFooter>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
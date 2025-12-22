import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { claimFoodItem } from "@/actions/claim"; 

import Link from "next/link";

// Force the page to refresh data every time you visit
export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();

  // 1. FETCH ONLY ACTIVE FOOD
  // "gt" means "Greater Than" -> Deadline must be in the future
  const items = await db.foodItem.findMany({
    where: { 
      status: "available",
      deadline: {
        gt: new Date() // Only fetch items that haven't expired yet
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-8 font-sans max-w-6xl mx-auto">
      {/* ... (Keep your Header code here) ... */}

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ... (Keep your "No food available" check here) ... */}

        {items.map((item) => {
          // CALCULATE TIME REMAINING
          const now = new Date();
          const deadline = new Date(item.deadline);
          const timeDiff = deadline - now; // Difference in milliseconds
          const minutesLeft = Math.floor(timeDiff / 1000 / 60);
          
          // Logic: Is it less than 30 mins?
          const isUrgent = minutesLeft > 0 && minutesLeft <= 30;

          return (
            <Card key={item.id} className={`w-full shadow-md transition ${isUrgent ? 'border-2 border-red-500 bg-red-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  
                  {/* URGENCY BADGE */}
                  {isUrgent && (
                     <span className="bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                       HURRY! Ends in {minutesLeft} mins
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
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/Footer";

export default async function MyFoodPage() {
  const user = await currentUser();
  if (!user) return redirect("/");

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return redirect("/");

  // --- THE FIX ---
  // Fetch from the 'Claim' table, not 'FoodItem'
  const myClaims = await db.claim.findMany({
    where: {
      userId: dbUser.id, // Find claims made by ME
    },
    include: {
      foodItem: true, // Get the food details for each claim
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold mb-8 text-indigo-900">📦 My Orders</h1>

        {myClaims.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
            <p className="text-gray-400 text-lg mb-4">You haven't claimed any food yet.</p>
            <Link href="/">
              <Button>Browse Food</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {myClaims.map((claim) => {
              const item = claim.foodItem;
              return (
                <Card key={claim.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-sm hover:shadow-md transition">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                    <p className="text-gray-500 text-sm mb-2">
                      Claimed on: {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📍 {item.address || "Ask Owner"}
                      </span>
                      <span className="flex items-center gap-1">
                        📞 {item.contactPhone || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Confirmed ✅
                    </span>
                    <p className="text-xs text-gray-400">
                      Show this screen to pickup
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
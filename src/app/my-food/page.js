import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function MyFoodPage() {
  const user = await currentUser();
  if (!user) return redirect("/");

  // Fetch items where "claimedByUserId" matches the logged-in user
  const myClaims = await db.foodItem.findMany({
    where: { 
      claimedByUserId: user.id 
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-indigo-900">😋 My Food Claims</h1>

      {myClaims.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-gray-500 text-lg">You haven't claimed any food yet.</p>
          <p className="text-sm text-gray-400 mt-2">Go to the home page to find something tasty!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {myClaims.map((item) => (
            <Card key={item.id} className="border-l-4 border-green-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="font-bold text-green-800 text-sm">✅ CLAIM CONFIRMED</p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Pickup Time:</strong> {item.pickupTime}
                  </p>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                  Remember to show this screen when you pick it up.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
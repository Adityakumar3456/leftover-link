import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer"; 

async function createFoodItem(formData) {
  "use server";
  const user = await currentUser();
  if (!user) return;
  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  
  const deadlineDate = formData.get("deadline") ? new Date(formData.get("deadline")) : null;
  const price = parseFloat(formData.get("price")) || 0;
  const originalPrice = parseFloat(formData.get("originalPrice")) || 0;

  await db.foodItem.create({
    data: {
      title: formData.get("title"),
      description: formData.get("description"),
      pickupTime: formData.get("pickupTime"),
      contactPhone: formData.get("contactPhone"),
      address: formData.get("address"),
      price: price,
      originalPrice: originalPrice,
      foodType: formData.get("foodType"),
      deadline: deadlineDate,
      userId: dbUser.id,
      status: "available",
    },
  });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) return redirect("/");

  // Fetch the Database User
  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/");

  // FETCH POSTS WITH CLAIMER DETAILS
  const myListings = await db.foodItem.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      claimedBy: true, // <--- THIS FETCHES THE CLAIMER'S DETAILS
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 flex-grow w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: POST NEW FOOD */}
        <div>
          <h1 className="text-3xl font-bold mb-6 text-indigo-800">📢 Post New Food</h1>
          <Card className="p-8 shadow-xl border-t-4 border-indigo-600 bg-white">
            <form action={createFoodItem} className="space-y-5">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Food Title</Label>
                  <Input name="title" placeholder="e.g. 3 Chicken Burgers" required />
                </div>
                <div className="space-y-2">
                  <Label>Food Type</Label>
                  <select name="foodType" className="flex h-10 w-full rounded-md border border-input bg-background px-3" required>
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="non-veg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" placeholder="Details..." required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input name="address" placeholder="e.g. Shop 4, Main Market" required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="contactPhone" placeholder="+91..." required />
                </div>
              </div>

              {/* PRICING */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-yellow-800 text-sm mb-2">💰 Pricing (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" step="0.01" name="price" placeholder="0 = Free" />
                  </div>
                  <div className="space-y-2">
                    <Label>Original Price (₹)</Label>
                    <Input type="number" step="0.01" name="originalPrice" placeholder="e.g. 200" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Pickup Time</Label>
                  <Input name="pickupTime" placeholder="e.g. Before 9 PM" required />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="datetime-local" name="deadline" required />
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6">
                🚀 Publish Listing
              </Button>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: MANAGE ORDERS */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Your Listings & Orders</h2>
          
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {myListings.length === 0 && (
               <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
                 You haven't posted anything yet.
               </div>
            )}

            {myListings.map((item) => (
              <Card key={item.id} className="p-5 shadow-sm hover:shadow-md transition bg-white border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    item.status === 'claimed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-4">
                  Posted: {new Date(item.createdAt).toLocaleDateString()}
                </p>

                {/* THE CLAIMER REVEAL SECTION */}
                {item.status === 'claimed' ? (
                   <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                     <p className="font-bold text-green-800 mb-1">✅ Claimed By:</p>
                     
                     {item.claimedBy ? (
                       <div className="text-sm text-gray-800 space-y-1">
                         <p><strong>Email:</strong> {item.claimedBy.email}</p>
                         <p className="text-xs text-gray-500">User ID: {item.claimedBy.id.substring(0,8)}...</p>
                         <div className="mt-2 text-xs text-green-700">
                            Give the food to this person only.
                         </div>
                       </div>
                     ) : (
                       <p className="text-sm text-gray-500">User details not found.</p>
                     )}
                   </div>
                ) : (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    Waiting for someone to claim...
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
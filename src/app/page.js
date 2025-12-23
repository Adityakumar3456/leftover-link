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
  
  // CAPTURE QUANTITY
  const quantity = parseInt(formData.get("quantity")) || 1; 

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
      quantity: quantity, // <--- SAVE QUANTITY
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
  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/");

  // FETCH POSTS WITH THE LIST OF CLAIMS
  const myListings = await db.foodItem.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      claims: { include: { user: true } }, // <--- Fetch list of claimers
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 flex-grow w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* POST FORM */}
        <div>
          <h1 className="text-3xl font-bold mb-6 text-indigo-800">📢 Post New Food</h1>
          <Card className="p-8 shadow-xl border-t-4 border-indigo-600 bg-white">
            <form action={createFoodItem} className="space-y-5">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Food Title</Label>
                  <Input name="title" placeholder="e.g. Chicken Burgers" required />
                </div>
                {/* QUANTITY INPUT */}
                <div className="space-y-2">
                  <Label>Quantity Available</Label>
                  <Input type="number" name="quantity" min="1" defaultValue="1" required />
                </div>
              </div>

              {/* ... (Keep the rest of your inputs: Description, Address, Price, etc.) ... */}
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" required /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Address</Label><Input name="address" required /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="contactPhone" required /></div>
              </div>
              <div className="space-y-2"><Label>Food Type</Label><select name="foodType" className="flex h-10 w-full rounded-md border bg-background px-3"><option value="veg">🟢 Veg</option><option value="non-veg">🔴 Non-Veg</option></select></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price</Label><Input name="price" placeholder="0" /></div>
                <div className="space-y-2"><Label>Original Price</Label><Input name="originalPrice" /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Pickup Time</Label><Input name="pickupTime" required /></div>
                 <div className="space-y-2"><Label>Expiry</Label><Input type="datetime-local" name="deadline" required /></div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6">🚀 Publish</Button>
            </form>
          </Card>
        </div>

        {/* ORDER MANAGEMENT */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Your Listings & Claims</h2>
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {myListings.map((item) => (
              <Card key={item.id} className="p-5 shadow-sm bg-white border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">Remaining Qty: <span className="font-bold text-black">{item.quantity}</span></p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'claimed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {item.status}
                  </span>
                </div>

                {/* LIST OF CLAIMERS */}
                <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-2">Claimed By ({item.claims.length} people):</p>
                   {item.claims.length === 0 ? (
                     <p className="text-sm text-gray-400 italic">No claims yet.</p>
                   ) : (
                     <ul className="space-y-2">
                       {item.claims.map((claim) => (
                         <li key={claim.id} className="text-sm border-b pb-1 last:border-0 flex justify-between">
                           <span>📧 {claim.user.email}</span>
                           <span className="text-xs text-gray-400">{new Date(claim.createdAt).toLocaleTimeString()}</span>
                         </li>
                       ))}
                     </ul>
                   )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
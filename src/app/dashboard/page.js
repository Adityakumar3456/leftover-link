import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer"; // Import Footer

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
      foodType: formData.get("foodType"), // <--- SAVE THE TYPE
      deadline: deadlineDate,
      userId: dbUser.id,
      status: "available",
    },
  });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export default async function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto p-8 flex-grow w-full">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">📢 Post Food / Offers</h1>
        
        <Card className="p-8 shadow-xl border-t-4 border-indigo-600">
          <form action={createFoodItem} className="space-y-6">
            
            {/* TITLE & DESC */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Food Title</Label>
                <Input name="title" placeholder="e.g. 5 Veggie Burgers" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Pickup Address</Label>
                <Input name="address" placeholder="e.g. 12 Main St, Near Station" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foodType">Food Type</Label>
              <select 
                name="foodType" 
                id="foodType" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="veg">🟢 Vegetarian</option>
                <option value="non-veg">🔴 Non-Vegetarian</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" placeholder="Freshly made..." required />
            </div>

            {/* PRICING SECTION (New) */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-yellow-800 mb-2">💰 Is this a Discounted Offer?</h3>
              <p className="text-xs text-yellow-600 mb-3">Leave blank if FREE. Fill in if selling at discount.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Selling Price (₹)</Label>
                  <Input type="number" step="0.01" name="price" placeholder="0 for Free" />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (₹)</Label>
                  <Input type="number" step="0.01" name="originalPrice" placeholder="e.g. 500" />
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input name="contactPhone" placeholder="+91..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Input name="pickupTime" placeholder="Before 10 PM" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Offer Expires At</Label>
              <Input type="datetime-local" name="deadline" required />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6">
              🚀 Publish Listing
            </Button>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
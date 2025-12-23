import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

async function createFoodItem(formData) {
  "use server";
  const user = await currentUser();
  if (!user) return;
  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return;

  const deadlineString = formData.get("deadline");
  const deadlineDate = deadlineString ? new Date(deadlineString) : null;

  await db.foodItem.create({
    data: {
      title: formData.get("title"),
      description: formData.get("description"),
      pickupTime: formData.get("pickupTime"),
      deadline: deadlineDate,
      userId: dbUser.id,
      status: "available",
    },
  });
  revalidatePath("/");
  revalidatePath("/dashboard"); // Refresh this page too
}

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) return redirect("/");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/");

  // FETCH USER'S POSTS (To fill the empty space)
  const myPosts = await db.foodItem.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      
      {/* LEFT COLUMN: THE FORM */}
      <div>
        <h1 className="text-3xl font-bold mb-6">📢 Post Leftover Food</h1>
        <Card className="p-6 shadow-lg border-2 border-indigo-50">
          <form action={createFoodItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Food Title</Label>
              <Input name="title" placeholder="e.g. 10 Veggie Sandwiches" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" placeholder="Ingredients, quantity, etc." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-red-600 font-bold">Expiry Date</Label>
              <Input type="datetime-local" name="deadline" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Pickup Notes</Label>
              <Input name="pickupTime" placeholder="e.g. Back door, ask for Sam" required />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">🚀 Publish Post</Button>
          </form>
        </Card>
      </div>

      {/* RIGHT COLUMN: HISTORY (Fills the empty space) */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-700">📋 Your Active Listings</h2>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {myPosts.length === 0 && (
            <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-400 border-dashed border-2">
              You haven't posted anything yet.
            </div>
          )}

          {myPosts.map((post) => (
            <Card key={post.id} className="p-4 bg-white shadow-sm border hover:border-indigo-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">Pickup: {post.pickupTime}</p>
                  
                  {/* Status Badge */}
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    post.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {post.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 text-right">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
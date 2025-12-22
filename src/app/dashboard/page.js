import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

async function createFoodItem(formData) {
  "use server";
  
  const user = await currentUser();
  if (!user) return;

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return;

  // Convert the input string to a real Date
  const deadlineString = formData.get("deadline"); 
  const deadlineDate = deadlineString ? new Date(deadlineString) : null;

  await db.foodItem.create({
    data: {
      title: formData.get("title"),
      description: formData.get("description"),
      pickupTime: formData.get("pickupTime"),
      deadline: deadlineDate, // <--- SAVING THE DEADLINE
      userId: dbUser.id,
      status: "available",
    },
  });

  revalidatePath("/");
  redirect("/");
}

export default async function Dashboard() {
  return (
    <div className="max-w-2xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Post Leftover Food</h1>
      
      <form action={createFoodItem} className="space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="title">Food Title</Label>
          <Input name="title" id="title" placeholder="e.g. 5 Spicy Chicken Burgers" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea name="description" id="description" placeholder="Freshly made..." required />
        </div>

        {/* NEW: Time Picker */}
        <div className="space-y-2">
          <Label htmlFor="deadline" className="text-red-600 font-bold">Offer Expires At (Required for Timer)</Label>
          <Input type="datetime-local" name="deadline" id="deadline" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pickupTime">Pickup Notes</Label>
          <Input name="pickupTime" id="pickupTime" placeholder="e.g. Ask for Raj at the counter" required />
        </div>

        <Button type="submit" className="w-full">Post Food</Button>
      </form>
    </div>
  );
}
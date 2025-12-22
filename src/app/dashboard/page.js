import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // <--- 1. NEW IMPORT HERE
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

  // Convert the input string to a real Date object
  const deadlineString = formData.get("deadline"); 
  const deadlineDate = deadlineString ? new Date(deadlineString) : null;

  await db.foodItem.create({
    data: {
      title: formData.get("title"),
      description: formData.get("description"),
      pickupTime: formData.get("pickupTime"),
      
      // SAVE THE EXACT DATE
      deadline: deadlineDate,
      
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
          <Textarea name="description" id="description" placeholder="Freshly made, packed in boxes..." required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pickupTime">Pickup Time</Label>
          <Input name="pickupTime" id="pickupTime" placeholder="e.g. Before 10 PM Tonight" required />
        </div>

        <Button type="submit" className="w-full">Post Food</Button>
      </form>
    </div>
  );
}
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function claimFoodItem(formData) {
  // 1. LOG START
  console.log("-----------------------------------");
  console.log("CLAIM ACTION STARTED");

  try {
    const foodId = formData.get("id");
    const user = await currentUser(); // Get the logged-in user

    if (!user) {
      console.log("Error: Must be logged in to claim");
      return;
    }

    if (!foodId) {
      console.log("ERROR: No ID found!");
      return;
    }

    console.log(`User ${user.id} is claiming food ${foodId}`);

    // 2. RUN UPDATE (Mark as claimed AND save who took it)
    await db.foodItem.update({
      where: { id: foodId },
      data: { 
        status: "claimed",
        claimedByUserId: user.id // <--- CRITICAL: Saves the user ID
      },
    });

    console.log("SUCCESS: Item claimed successfully.");

    // 3. REFRESH PAGES
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/my-food"); // We are about to build this!

  } catch (error) {
    console.error("CRITICAL ERROR in claim action:", error);
  }
}
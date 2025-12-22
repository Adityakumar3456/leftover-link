"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function claimFoodItem(formData) {
  // 1. LOG START
  console.log("-----------------------------------");
  console.log("CLAIM ACTION STARTED");
  
  try {
    const foodId = formData.get("id");
    console.log("Trying to claim Food ID:", foodId);

    if (!foodId) {
      console.log("ERROR: No ID found!");
      return;
    }

    // 2. RUN UPDATE
    const updated = await db.foodItem.update({
      where: { id: foodId },
      data: { status: "claimed" },
    });

    console.log("SUCCESS: Item updated:", updated);

    // 3. REFRESH
    revalidatePath("/");
    console.log("Page Refreshed");

  } catch (error) {
    console.error("CRITICAL ERROR in claim action:", error);
  }
}
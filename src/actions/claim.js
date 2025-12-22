"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function claimFoodItem(formData) {
  const foodId = formData.get("id");

  // Update the status to 'claimed'
  await db.foodItem.update({
    where: { id: foodId },
    data: { status: "claimed" },
  });

  // Refresh the home page to remove the item from the list
  revalidatePath("/");
}
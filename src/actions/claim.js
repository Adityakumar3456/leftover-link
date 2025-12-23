"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function claimFoodItem(formData) {
  const foodId = formData.get("id");
  const user = await currentUser();

  if (!user || !foodId) return;

  // 1. Get the item to check quantity
  const item = await db.foodItem.findUnique({ where: { id: foodId } });

  if (!item || item.quantity <= 0) {
    console.log("Item already fully claimed!");
    return;
  }

  // 2. Run the Transaction (Create Claim + Lower Quantity)
  await db.$transaction(async (tx) => {
    // Create the record of WHO took it
    await tx.claim.create({
      data: {
        userId: user.id,
        foodItemId: foodId,
      },
    });

    // Update the food item (Decrement quantity)
    const newQuantity = item.quantity - 1;
    await tx.foodItem.update({
      where: { id: foodId },
      data: { 
        quantity: newQuantity,
        // If quantity hits 0, mark as 'claimed' (vanishes from list)
        status: newQuantity === 0 ? "claimed" : "available"
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/my-food");
}
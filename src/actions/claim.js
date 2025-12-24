"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function claimFoodItem(formData) {
  const foodId = formData.get("id");
  const user = await currentUser();

  if (!user || !foodId) return;

  const item = await db.foodItem.findUnique({ where: { id: foodId } });

  if (!item || item.quantity <= 0) {
    return;
  }

  // Use a transaction to safely update everything at once
  await db.$transaction(async (tx) => {
    // 1. Record who claimed it
    await tx.claim.create({
      data: {
        userId: user.id,
        foodItemId: foodId,
      },
    });

    // 2. Reduce quantity
    const newQuantity = item.quantity - 1;
    await tx.foodItem.update({
      where: { id: foodId },
      data: { 
        quantity: newQuantity,
        status: newQuantity === 0 ? "claimed" : "available"
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/my-food");
}
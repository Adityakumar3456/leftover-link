"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function claimFoodItem(formData) {
  const foodId = formData.get("id");
  const user = await currentUser();

  if (!user || !foodId) return;

  // 1. FETCH THE REAL DATABASE USER (The missing step!)
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    console.error("User not found in database");
    return;
  }

  // 2. Get the item to check quantity
  const item = await db.foodItem.findUnique({ where: { id: foodId } });

  if (!item || item.quantity <= 0) {
    return;
  }

  // 3. Run the Transaction
  await db.$transaction(async (tx) => {
    // Create the record using the DATABASE ID (dbUser.id), not the Clerk ID
    await tx.claim.create({
      data: {
        userId: dbUser.id, // <--- FIXED HERE
        foodItemId: foodId,
      },
    });

    // Reduce quantity
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
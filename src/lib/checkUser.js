import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
  const user = await currentUser();

  // 1. If user is NOT logged in, just return null. 
  // DO NOT REDIRECT here. Let the page handle it.
  if (!user) {
    return null;
  }

  // 2. Check if user exists in DB
  const loggedInUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  // 3. If found, return user
  if (loggedInUser) {
    return loggedInUser;
  }

  // 4. If not found, create new user
  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  return newUser;
};
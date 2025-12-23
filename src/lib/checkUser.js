import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
  const user = await currentUser();

  // 1. If not logged in, just return. DO NOT REDIRECT.
  if (!user) {
    return null;
  }

  // 2. Check if user is already in database
  const loggedInUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  // 3. If user exists, return them.
  if (loggedInUser) {
    return loggedInUser;
  }

  // 4. If new user, create them.
  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      // You can add name or image here if you want
    },
  });

  return newUser;
};
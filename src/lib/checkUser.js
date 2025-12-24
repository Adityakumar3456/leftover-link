import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
  const user = await currentUser();

  // If user is not logged in, DO NOTHING. Return null.
  if (!user) {
    return null;
  }

  // Check if user is already in our database
  const loggedInUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  // If found, return them
  if (loggedInUser) {
    return loggedInUser;
  }

  // If not found, create them
  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  return newUser;
};
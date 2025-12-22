import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export const checkUser = async () => {
  const user = await currentUser();

  // 1. If not logged in, return null
  if (!user) {
    return null;
  }

  // 2. Check if user is already in OUR database
  const loggedInUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  // 3. If they exist, return them
  if (loggedInUser) {
    return loggedInUser;
  }

  // 4. If not, create them!
  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  return newUser;
};
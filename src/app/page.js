import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default async function Home() {
  // This runs on the server and syncs the user!
  const user = await checkUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 space-y-4">
      <h1 className="text-4xl font-bold">LeftoverLink</h1>
      
      <SignedOut>
        <p>Please sign in to continue.</p>
        <SignInButton>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign In</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <p className="text-xl text-green-600 font-bold">
            Database Sync Successful!
        </p>
        {/* If user exists, show their email from OUR database */}
        {user ? (
            <p>User Saved in DB: {user.email}</p>
        ) : (
            <p>Loading...</p>
        )}
        <UserButton />
      </SignedIn>
    </div>
  );
}
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { claimFoodItem } from "@/actions/claim"; 
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();
  const user = await currentUser();

  // --- LOGIC FOR LOGGED-IN USERS (The Feed) ---
  const items = await db.foodItem.findMany({
    where: { status: "available" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen font-sans">
      
      {/* --- HEADER (Visible to Everyone) --- */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-700">LeftoverLink 🥘</h1>
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton><Button className="bg-indigo-600">Get Started</Button></SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard"><Button variant="outline">Post Food +</Button></Link>
            <Link href="/my-food"><Button variant="ghost">My Orders 📦</Button></Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* --- SCENARIO 1: LOGGED OUT (LANDING PAGE) --- */}
      <SignedOut>
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Hero Section */}
          <section className="py-20 text-center">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
              Don't Waste Food. <span className="text-indigo-600">Share It.</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with local restaurants, mess halls, and neighbors to share leftover food instantly. 
              Save money, save the planet.
            </p>
            <SignInButton>
              <Button size="lg" className="bg-indigo-600 text-lg px-8 py-6">Start Sharing Now</Button>
            </SignInButton>
          </section>

          {/* About / Features Section */}
          <section className="grid md:grid-cols-3 gap-8 py-16 border-t">
            <div className="p-6 bg-indigo-50 rounded-xl text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Instant Posting</h3>
              <p className="text-gray-600">Post leftovers in under 30 seconds. Real-time updates for everyone.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Zero Waste</h3>
              <p className="text-gray-600">Help reduce the 40% of food that goes to waste every single year.</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Community First</h3>
              <p className="text-gray-600">Help students and neighbors find free, high-quality meals nearby.</p>
            </div>
          </section>

          {/* Footer with Contact/Feedback */}
          <footer className="py-10 border-t mt-10 text-center text-gray-500">
            <div className="flex justify-center gap-6 mb-4">
              <Link href="#" className="hover:text-indigo-600">About Us</Link>
              <Link href="#" className="hover:text-indigo-600">Contact Support</Link>
              <Link href="#" className="hover:text-indigo-600">Give Feedback</Link>
            </div>
            <p>© 2024 LeftoverLink. Built for a better future.</p>
          </footer>
        </div>
      </SignedOut>


      {/* --- SCENARIO 2: LOGGED IN (THE FEED) --- */}
      <SignedIn>
        <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No food available right now.</p>
            </div>
          )}

          {items.map((item) => {
            const now = new Date();
            const deadline = item.deadline ? new Date(item.deadline) : new Date(now.getTime() + 24*60*60*1000);
            const timeDiff = deadline - now; 
            const minutesLeft = Math.floor(timeDiff / 1000 / 60);
            if (timeDiff < 0) return null;
            const isUrgent = minutesLeft > 0 && minutesLeft <= 60;

            // WhatsApp Share Link
            const shareText = `Check out this free food: ${item.title} on LeftoverLink!`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

            return (
              <Card key={item.id} className={`w-full shadow-md transition flex flex-col ${isUrgent ? 'border-2 border-red-500 bg-red-50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    {isUrgent && (
                       <span className="bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                         HURRY! {minutesLeft}m
                       </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>⏰</span> <strong>Pickup:</strong> {item.pickupTime}
                    </div>
                    {item.contactPhone && (
                      <div className="flex items-center gap-2 text-indigo-700">
                         <span>📞</span> <strong>Call:</strong> {item.contactPhone}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-3">
                   <form action={claimFoodItem} className="w-full">
                      <input type="hidden" name="id" value={item.id} />
                      <Button className={`w-full ${isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {isUrgent ? "Claim Fast!" : "Claim This Item"}
                      </Button>
                    </form>

                    {/* SOCIAL SHARE BUTTON */}
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50">
                        Share on WhatsApp 💬
                      </Button>
                    </a>
                </CardFooter>
              </Card>
            );
          })}
        </main>
      </SignedIn>

    </div>
  );
}
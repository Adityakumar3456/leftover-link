import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { claimFoodItem } from "@/actions/claim"; 
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/Footer"; 

export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();

  // Fetch Data safely
  const freeItems = await db.foodItem.findMany({
    where: { status: "available", price: 0 },
    orderBy: { createdAt: "desc" },
  });

  const discountItems = await db.foodItem.findMany({
    where: { status: "available", price: { gt: 0 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      
      {/* --- HEADER --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-indigo-700 flex items-center gap-2">
            🥘 <span className="hidden md:inline">LeftoverLink</span><span className="md:hidden">Leftover</span>
          </h1>
          
          <div className="flex gap-2 items-center">
            <SignedOut>
              <SignInButton><Button size="sm" className="bg-indigo-600 text-xs md:text-sm">Login</Button></SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="bg-indigo-600 text-xs md:text-sm h-9">
                  Post +
                </Button>
              </Link>
              <Link href="/my-food">
                <Button variant="ghost" size="sm" className="text-xs md:text-sm h-9">
                  Orders
                </Button>
              </Link>
              <div className="scale-75 md:scale-100">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* --- LANDING PAGE (Logged OUT) --- */}
      <SignedOut>
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 md:py-20">
          <div className="max-w-3xl space-y-6 md:space-y-8">
            <h1 className="text-4xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Don't Waste. <br/>
              <span className="text-indigo-600">Share It.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto">
              Get high-quality meals for free or 80% off. Connect with neighbors and save the planet.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 w-full md:w-auto">
              <SignInButton>
                <Button size="lg" className="bg-indigo-600 text-lg w-full md:w-auto py-6 rounded-full shadow-xl">
                  Start Sharing Now
                </Button>
              </SignInButton>
            </div>
          </div>
        </main>
      </SignedOut>

      {/* --- APP FEED (Logged IN) --- */}
      <SignedIn>
        <main className="flex-grow max-w-7xl mx-auto px-4 py-6 md:py-10 w-full space-y-10">
          
          {/* DISCOUNT SECTION */}
          {discountItems.length > 0 && (
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">🔥 Hot Deals</h2>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold">80% Off</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {discountItems.map((item) => <FoodCard key={item.id} item={item} isDiscount={true} />)}
              </div>
            </section>
          )}

          {/* FREE FOOD SECTION */}
          <section>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">💚 Free Food</h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold">Community</span>
            </div>

            {freeItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mx-auto max-w-md">
                <p className="text-lg text-gray-400 font-medium">No free food right now.</p>
                <Link href="/dashboard">
                  <Button className="mt-4" variant="outline">Post Leftovers</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {freeItems.map((item) => <FoodCard key={item.id} item={item} isDiscount={false} />)}
              </div>
            )}
          </section>
        </main>
      </SignedIn>

      {/* --- FOOTER --- */}
      <div className="mt-auto">
        <Footer />
      </div>

    </div>
  );
}

// --- SUB-COMPONENT FOR CARDS ---
function FoodCard({ item, isDiscount }) {
  const expiryDate = item.deadline ? new Date(item.deadline) : null;
  const formattedExpiry = expiryDate 
    ? expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : "Midnight";

  const siteLink = "https://leftover-link.vercel.app"; 
  const whatsappMessage = `
*Hello! I saw this food on LeftoverLink* 🥘

*Item:* ${item.title}
*Pickup Time:* ${item.pickupTime}
*Expires At:* ${formattedExpiry}
*Address:* ${item.address || "Ask owner"}
*Contact:* ${item.contactPhone || "N/A"}

Link: ${siteLink}
  `.trim();

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const discountPercent = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
    : 0;

  return (
    <Card className="w-full shadow-sm hover:shadow-lg transition border-0 flex flex-col overflow-hidden h-full">
      <div className={`h-2 w-full ${isDiscount ? 'bg-orange-500' : 'bg-green-500'}`} />
      
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg md:text-xl font-bold leading-tight">{item.title}</CardTitle>
          {isDiscount && discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[10px] md:text-xs px-2 py-1 rounded font-bold shrink-0">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-1">
          📍 {item.address || "Location on Request"}
        </p>
      </CardHeader>

      <CardContent className="flex-grow pt-2 px-4">
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
        
        {isDiscount && (
          <div className="flex items-end gap-2 mb-3">
             <span className="text-xl md:text-2xl font-bold text-gray-900">₹{item.price}</span>
             {item.originalPrice && <span className="text-sm text-gray-400 line-through mb-1">₹{item.originalPrice}</span>}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg text-xs md:text-sm space-y-2 border border-gray-100">
          <div className="flex items-center gap-2">
            <span>⏰</span> <span className="font-semibold text-gray-700">Pickup:</span> {item.pickupTime}
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <span>⏳</span> <span className="font-semibold">Expires:</span> {formattedExpiry}
          </div>
          {item.contactPhone && (
            <div className="flex items-center gap-2 text-indigo-600">
              <span>📞</span> <span className="font-semibold">Ph:</span> {item.contactPhone}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-4 pb-6 pt-0 mt-4">
        <form action={claimFoodItem} className="w-full">
          <input type="hidden" name="id" value={item.id} />
          <Button className={`w-full font-bold shadow-sm ${isDiscount ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {isDiscount ? "Claim Deal ⚡" : "Claim Free 🎁"}
          </Button>
        </form>
        
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="outline" className="w-full text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors">
            Share on WhatsApp 💬
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
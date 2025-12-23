import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { claimFoodItem } from "@/actions/claim"; 
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/Footer"; // Import the new Footer

export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();

  // 1. Fetch FREE Food
  const freeItems = await db.foodItem.findMany({
    where: { status: "available", price: 0 },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch DISCOUNTED Food (Price > 0)
  const discountItems = await db.foodItem.findMany({
    where: { status: "available", price: { gt: 0 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      
      {/* --- HEADER --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-700 flex items-center gap-2">
            🥘 LeftoverLink
          </h1>
          <div className="flex gap-4 items-center">
            <SignedOut>
              <SignInButton><Button className="bg-indigo-600">Login / Sign Up</Button></SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard"><Button variant="default" className="bg-indigo-600">Post Food +</Button></Link>
              <Link href="/my-food"><Button variant="ghost">My Orders</Button></Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full space-y-16">
        
        {/* SECTION 1: DISCOUNTED OFFERS (Hotels/Restaurants) */}
        {discountItems.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">🔥 Hot Deals (80% Off)</h2>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">Save Money</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discountItems.map((item) => (
                <FoodCard key={item.id} item={item} isDiscount={true} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: FREE COMMUNITY FOOD */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold text-gray-800">💚 Free Community Food</h2>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Zero Waste</span>
          </div>

          {freeItems.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed">
              <p className="text-gray-500">No free food listed right now. Be the first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeItems.map((item) => (
                <FoodCard key={item.id} item={item} isDiscount={false} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* --- FOOTER (Visible Everyone) --- */}
      <Footer />

    </div>
  );
}

// --- SUB-COMPONENT FOR CARDS ---
function FoodCard({ item, isDiscount }) {
  const whatsappUrl = `https://wa.me/?text=Check out this: ${item.title} on LeftoverLink!`;
  
  // Calculate Discount %
  const discountPercent = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
    : 0;

  return (
    <Card className="w-full shadow-md hover:shadow-xl transition border-0 flex flex-col overflow-hidden">
      {/* Card Top Strip */}
      <div className={`h-2 w-full ${isDiscount ? 'bg-orange-500' : 'bg-green-500'}`} />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
          {isDiscount && discountPercent > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 font-mono">📍 {item.address || "Location on Request"}</p>
      </CardHeader>

      <CardContent className="flex-grow pt-2">
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
        
        {isDiscount && (
          <div className="flex items-end gap-2 mb-3">
             <span className="text-2xl font-bold text-gray-900">₹{item.price}</span>
             {item.originalPrice && (
               <span className="text-sm text-gray-400 line-through mb-1">₹{item.originalPrice}</span>
             )}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
          <div className="flex items-center gap-2">⏰ <strong>Time:</strong> {item.pickupTime}</div>
          {item.contactPhone && (
            <div className="flex items-center gap-2 text-indigo-700">📞 <strong>Call:</strong> {item.contactPhone}</div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0 pb-6">
        <form action={claimFoodItem} className="w-full">
          <input type="hidden" name="id" value={item.id} />
          <Button className={`w-full font-bold ${isDiscount ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {isDiscount ? "Claim Deal ⚡" : "Claim Free 🎁"}
          </Button>
        </form>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="outline" className="w-full text-gray-600 border-gray-300 hover:bg-gray-100">
            Share on WhatsApp 💬
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
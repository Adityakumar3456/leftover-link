"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { claimFoodItem } from "@/actions/claim";

export default function FoodFeed({ initialItems }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'veg', 'non-veg'

  // FILTER LOGIC
  const filteredItems = initialItems.filter((item) => {
    // 1. Check Text Search (Title or Description)
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Check Type Filter
    const matchesType = filterType === "all" || item.foodType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* SEARCH BAR & FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4 md:space-y-0 md:flex md:gap-4 items-center">
        <div className="flex-grow">
          <Input 
            placeholder="Search for pizza, rice, burger..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "bg-indigo-600" : ""}
          >
            All
          </Button>
          <Button 
            variant={filterType === "veg" ? "default" : "outline"} 
            onClick={() => setFilterType("veg")}
            className={filterType === "veg" ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-200"}
          >
            🟢 Veg
          </Button>
          <Button 
            variant={filterType === "non-veg" ? "default" : "outline"} 
            onClick={() => setFilterType("non-veg")}
            className={filterType === "non-veg" ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-200"}
          >
            🔴 Non-Veg
          </Button>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            No food matches your search.
          </div>
        ) : (
          filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

// REUSABLE CARD COMPONENT (Moved inside here for easier state access)
function FoodCard({ item }) {
  const isDiscount = item.price > 0;
  
  // Expiry Logic
  const expiryDate = item.deadline ? new Date(item.deadline) : null;
  const formattedExpiry = expiryDate 
    ? expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : "Midnight";

  const discountPercent = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
    : 0;
    
  const whatsappUrl = `https://wa.me/?text=Check out ${item.title} on LeftoverLink!`;

  return (
    <Card className="w-full shadow-sm hover:shadow-lg transition border-0 flex flex-col overflow-hidden h-full bg-white">
      <div className={`h-2 w-full ${item.foodType === 'non-veg' ? 'bg-red-500' : 'bg-green-500'}`} />
      
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold leading-tight">{item.title}</CardTitle>
          <div className="flex gap-1">
             {/* VEG / NON-VEG BADGE */}
             <span className={`text-[10px] px-2 py-1 rounded font-bold border ${item.foodType === 'non-veg' ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50'}`}>
               {item.foodType === 'non-veg' ? 'NON-VEG' : 'VEG'}
             </span>
             {isDiscount && discountPercent > 0 && (
                <span className="bg-orange-600 text-white text-[10px] px-2 py-1 rounded font-bold">
                  {discountPercent}% OFF
                </span>
             )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-2 px-4">
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
        
        {isDiscount && (
          <div className="flex items-end gap-2 mb-3">
             <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
             {item.originalPrice && <span className="text-sm text-gray-400 line-through mb-1">₹{item.originalPrice}</span>}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-2 border border-gray-100">
          <div className="flex items-center gap-2">
            <span>⏰</span> <span className="font-semibold text-gray-700">Pickup:</span> {item.pickupTime}
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <span>⏳</span> <span className="font-semibold">Expires:</span> {formattedExpiry}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-4 pb-6 pt-0 mt-4">
         {/* NOTICE: We removed the <form> claim button here because Server Actions inside Client Components need special handling. 
             For now, we keep the button visual but focusing on Search. 
             Ideally, we pass the claimAction as a prop or use an API route. 
             Let's use a simple WhatsApp button for now to keep it bug-free for this step. */}
        
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            Contact to Claim 💬
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
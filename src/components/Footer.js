import Link from "next/link";
import { Star } from "lucide-react"; // Make sure to install lucide-react if needed, or use simple emojis

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
        
        {/* COL 1: MISSION & FOUNDERS */}
        <div>
          <h3 className="text-2xl font-bold text-indigo-400 mb-4">LeftoverLink 🥘</h3>
          <p className="text-gray-400 mb-6">
            Building a bridge between abundance and need. We ensure every individual gets access to high-quality food while saving the planet.
          </p>
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="text-sm text-gray-300 font-semibold">Founders:</p>
            <p className="text-white text-lg">Aditya Pal & Anurag Nikumbh</p>
            <p className="text-xs text-gray-500">Built for the well-being of society.</p>
          </div>
        </div>

        {/* COL 2: QUICK LINKS */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Post Food</Link></li>
            <li><Link href="/my-food" className="hover:text-white">My Orders</Link></li>
            <li><Link href="#" className="hover:text-white">Hotel Partnerships</Link></li>
          </ul>
        </div>

        {/* COL 3: REVIEWS */}
        <div>
          <h3 className="text-xl font-bold mb-4">Community Love ❤️</h3>
          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded-lg text-sm">
              <div className="flex text-yellow-400 mb-1">★★★★★</div>
              "Saved me so much money as a student. The food from the Taj Hotel offer was incredible!"
              <div className="text-gray-500 text-xs mt-1">- Rohan, Student</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-sm">
              <div className="flex text-yellow-400 mb-1">★★★★★</div>
              "Listing our leftovers is so easy. Glad it's going to people who need it."
              <div className="text-gray-500 text-xs mt-1">- Green Leaf Restaurant</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-600 border-t border-gray-800 pt-8 text-sm">
        <p>© 2025 LeftoverLink. All rights reserved. Address: Mumbai, India.</p>
      </div>
    </footer>
  );
}
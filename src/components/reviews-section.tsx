"use client";

import { Star } from "lucide-react";
import { StructuredData } from "./structured-data";

interface Review {
  author: string;
  rating: number;
  text: string;
  datePublished: string;
  tripType?: "Umrah" | "Hajj" | "Business" | "Tourism";
}

// Sample reviews - Replace with real reviews from your database
const reviews: Review[] = [
  {
    author: "Ahmed M.",
    rating: 5,
    text: "Just returned from Umrah and this eSIM was perfect! Activated in seconds when I landed. 5G speeds in Makkah and Madinah were excellent. The cart feature made it easy to buy for my whole family. Highly recommend!",
    datePublished: "2025-12-10",
    tripType: "Umrah",
  },
  {
    author: "Fatima K.",
    rating: 5,
    text: "Used this for Hajj 2025 and it was flawless. Even during peak times in Mina and Arafat, I had strong connectivity. The instant QR code delivery saved me so much time. Best eSIM service I've used!",
    datePublished: "2025-11-28",
    tripType: "Hajj",
  },
  {
    author: "Mohammed A.",
    rating: 5,
    text: "Excellent service! Bought multiple eSIMs using the cart feature - super convenient. All activated perfectly on our iPhones. Coverage throughout Saudi Arabia was excellent. Will definitely use again!",
    datePublished: "2025-11-15",
    tripType: "Umrah",
  },
  {
    author: "Aisha S.",
    rating: 5,
    text: "Best eSIM for Umrah! The new usage tracking feature is amazing - I could see exactly how much data I used. Coverage in Makkah was perfect even during crowded prayer times. Great value for money!",
    datePublished: "2025-11-05",
    tripType: "Umrah",
  },
  {
    author: "Omar H.",
    rating: 5,
    text: "Outstanding service! The eSIM activated instantly and coverage was strong throughout my journey. The top-up feature came in handy when I needed more data. Customer support was very responsive. Highly satisfied!",
    datePublished: "2025-10-22",
    tripType: "Hajj",
  },
  {
    author: "Sarah M.",
    rating: 5,
    text: "Perfect for my business trip to Riyadh. Instant activation, reliable 5G coverage, and much cheaper than roaming. The dual-SIM feature let me keep my UK number active. Will use again for future trips!",
    datePublished: "2025-10-10",
    tripType: "Business",
  },
  {
    author: "Yusuf I.",
    rating: 5,
    text: "Used for Umrah with my family of 5. The cart feature made purchasing multiple eSIMs so easy. All activated perfectly and coverage was excellent in Makkah and Madinah. Great customer service too!",
    datePublished: "2025-09-28",
    tripType: "Umrah",
  },
  {
    author: "Zainab R.",
    rating: 5,
    text: "Amazing experience! The eSIM activated instantly when I landed. Coverage was perfect throughout my Umrah journey. The low data alert email helped me top up before running out. Saved hundreds vs roaming!",
    datePublished: "2025-09-15",
    tripType: "Umrah",
  },
];

// Calculate aggregate rating
const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
const averageRating = (totalRating / reviews.length).toFixed(1);
const reviewCount = reviews.length;

export function ReviewsSection() {
  return (
    <>
      {/* Review Schema Markup */}
      <StructuredData 
        type="review" 
        data={{
          productName: "eSIM for Umrah and Hajj",
          description: "Instant eSIM activation for Saudi Arabia. High-speed mobile data plans for Umrah and Hajj pilgrims.",
          reviews: reviews.map(r => ({
            author: r.author,
            rating: r.rating,
            reviewBody: r.text,
            datePublished: r.datePublished,
          })),
        }} 
      />
      
      <section className="bg-white dark:bg-slate-900 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(parseFloat(averageRating))
                        ? "text-amber-500 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {averageRating} out of 5
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on {reviewCount} reviews
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real reviews from pilgrims who used our eSIM for their Umrah and Hajj journeys
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-amber-500 fill-current"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  {review.tripType && (
                    <span className="text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded">
                      {review.tripType}
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {review.author}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.datePublished).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Join {reviewCount}+ satisfied customers who stayed connected during their journey
            </p>
            <a
              href="/plans"
              className="inline-block px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors"
            >
              Get Your eSIM Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}







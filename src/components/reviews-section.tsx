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
    text: "Perfect eSIM for my Umrah trip! Activated instantly when I arrived in Jeddah. Coverage was excellent in Makkah and Madinah. Saved me so much money compared to roaming. Highly recommend!",
    datePublished: "2024-12-15",
    tripType: "Umrah",
  },
  {
    author: "Fatima K.",
    rating: 5,
    text: "Used this eSIM for Hajj and it worked flawlessly. Even during peak times in Mina, I had connectivity. The instant activation was a lifesaver - no need to find a store. Great service!",
    datePublished: "2024-12-10",
    tripType: "Hajj",
  },
  {
    author: "Mohammed A.",
    rating: 5,
    text: "Excellent service! QR code arrived immediately after purchase. Easy activation on my iPhone. Coverage throughout Saudi Arabia was perfect. Will definitely use again for my next trip.",
    datePublished: "2024-12-08",
    tripType: "Umrah",
  },
  {
    author: "Aisha S.",
    rating: 5,
    text: "Best eSIM service I've used. The support team helped me activate it quickly when I had a question. Coverage in Makkah was excellent, even during crowded prayer times. Very affordable too!",
    datePublished: "2024-12-05",
    tripType: "Umrah",
  },
  {
    author: "Omar H.",
    rating: 4,
    text: "Great eSIM for Saudi Arabia travel. Easy to set up, good coverage in major cities. Only minor issue was slower speeds during peak Hajj times, but that's expected. Overall very satisfied.",
    datePublished: "2024-12-01",
    tripType: "Hajj",
  },
  {
    author: "Sarah M.",
    rating: 5,
    text: "Perfect for my business trip to Riyadh. Instant activation, reliable coverage, and much cheaper than roaming. The dual-SIM feature let me keep my UK number active. Highly recommend!",
    datePublished: "2024-11-28",
    tripType: "Business",
  },
  {
    author: "Yusuf I.",
    rating: 5,
    text: "Used for Umrah with my family. Purchased 4 eSIMs and all activated perfectly. Great coverage in Makkah and Madinah. Customer support was very helpful when we had questions. Excellent service!",
    datePublished: "2024-11-25",
    tripType: "Umrah",
  },
  {
    author: "Zainab R.",
    rating: 5,
    text: "Amazing experience! The eSIM activated instantly when I landed in Jeddah. Coverage was perfect throughout my Umrah journey. Saved hundreds compared to my carrier's roaming charges. Thank you!",
    datePublished: "2024-11-20",
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







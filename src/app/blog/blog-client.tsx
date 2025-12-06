"use client";

import { useState } from "react";
import Link from "next/link";

interface BlogPost {
  title: string;
  href: string;
  description: string;
  category: "All Posts" | "Guides" | "Travel Tips" | "Tutorials" | "Best Practices";
}

const blogPosts: BlogPost[] = [
  {
    title: "Why Your eSIM Might Not Be Working",
    href: "/blog/why-esim-not-working",
    description: "Discover the most common reasons why eSIMs fail to work and how to fix them. Learn about device compatibility, network issues, and activation problems.",
    category: "Tutorials",
  },
  {
    title: "eSIM Setup Guide",
    href: "/blog/esim-setup-guide",
    description: "Step-by-step instructions for installing and activating your eSIM for Umrah travel.",
    category: "Guides",
  },
  {
    title: "Staying Connected in Saudi Arabia",
    href: "/blog/staying-connected-saudi-arabia",
    description: "Tips for reliable mobile data and connectivity during your pilgrimage.",
    category: "Travel Tips",
  },
  {
    title: "Troubleshooting eSIM Issues",
    href: "/blog/troubleshooting-esim",
    description: "Common problems and solutions for eSIM activation and usage.",
    category: "Tutorials",
  },
  {
    title: "Best Practices for Using eSIM During Umrah",
    href: "/blog/best-practices-umrah-esim",
    description: "Essential tips for maximizing your eSIM experience during your spiritual journey.",
    category: "Best Practices",
  },
];

const categories = ["All Posts", "Guides", "Travel Tips", "Tutorials", "Best Practices"];

export function BlogClient() {
  const [activeCategory, setActiveCategory] = useState<string>("All Posts");

  const filteredPosts =
    activeCategory === "All Posts"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  return (
    <>
      {/* Categories */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all border ${
                activeCategory === cat
                  ? "bg-sky-600 text-white border-sky-600 hover:bg-sky-700 shadow-md scale-105"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-sky-300 dark:hover:border-sky-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-5xl mx-auto">
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all group"
              >
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-sky-700 dark:text-sky-400 group-hover:underline mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {post.description}
                </p>
                <span className="text-sm text-sky-600 dark:text-sky-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read More
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No posts found in this category.
            </p>
          </div>
        )}
      </div>
    </>
  );
}


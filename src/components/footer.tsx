"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LINKS = [
  {
    title: "Company",
    items: [
      { title: "About Us", href: "#" },
      { title: "Plans", href: "/" },
      { title: "Support", href: "#support" },
      { title: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "My Orders", href: "/orders" },
      { title: "Activation", href: "/activation" },
      { title: "How It Works", href: "#" },
      { title: "FAQ", href: "#" },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
      { title: "Refund Policy", href: "#" },
      { title: "About Us", href: "#" },
    ],
  },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah Esim";
  
  return (
    <footer className="pt-16 pb-8 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 justify-between gap-10 md:grid-cols-2">
          <div className="grid grid-cols-3 justify-between gap-x-6 gap-y-4">
            {LINKS.map(({ title, items }) => (
              <ul key={title}>
                <p className="mb-2 font-semibold text-gray-900 dark:text-white">{title}</p>
                {items.map(({ title, href }) => (
                  <li key={title} className="mb-1">
                    <a
                      href={href}
                      className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="lg:ml-auto">
            <p className="mb-2 font-semibold text-gray-900 dark:text-white">Subscribe</p>
            <p className="text-gray-600 dark:text-gray-300 max-w-sm text-balance">
              Get access to subscriber exclusive deals and be the first who gets
              informed about fresh sales.
            </p>
            <div className="mt-4 flex w-full max-w-sm items-end gap-2">
              <div className="w-full">
                <Label
                  htmlFor="email"
                  className="mb-2 inline-block text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Your Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="someone@example.com"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
              <Button className="shrink-0 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600">Subscribe</Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Checkbox id="checkbox-link" />
              <Label
                htmlFor="checkbox-link"
                className="text-gray-600 dark:text-gray-300 flex gap-1 select-none"
              >
                I agree with the
                <a href="#" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                  terms and conditions
                </a>
              </Label>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-10 text-center">
          &copy; {YEAR} {brandName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

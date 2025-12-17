"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSiteConfig } from "./site-config-provider"

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { brandName, supportEmail } = useSiteConfig()

  const LINKS = [
    {
      title: "Company",
      items: [
        { title: "About Us", href: "/learn-more" },
        { title: "Plans", href: "/plans" },
        { title: "Support", href: `mailto:${supportEmail}` },
        { title: "Contact", href: `mailto:${supportEmail}` },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "My Orders", href: "/orders" },
        { title: "Activation", href: "/activation" },
        { title: "How It Works", href: "/learn-more" },
        { title: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      items: [
        { title: "Terms", href: "/terms" },
        { title: "Privacy", href: "/privacy" },
        { title: "Refund Policy", href: "/terms" },
        { title: "About Us", href: "/learn-more" },
      ],
    },
  ]
  
  return (
    <footer className="pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Logo Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/myumrahesim-logo.svg"
              alt={brandName}
              width={150}
              height={50}
              className="h-8 sm:h-10 w-auto object-contain dark:brightness-0 dark:invert transition-opacity group-hover:opacity-80"
            />
            <span className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors hidden sm:inline">
              {brandName}
            </span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 justify-between gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 justify-between gap-6 sm:gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-8">
            {LINKS.map(({ title, items }) => (
              <ul key={title}>
                <p className="mb-3 sm:mb-4 font-semibold text-gray-900 dark:text-white text-base lg:text-lg">{title}</p>
                {items.map(({ title, href }) => (
                  <li key={title} className="mb-2 lg:mb-3">
                    <a
                      href={href}
                      className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-sm lg:text-base py-1 inline-block"
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="lg:ml-auto w-full max-w-md lg:max-w-sm">
            <p className="mb-2 sm:mb-3 font-semibold text-gray-900 dark:text-white text-base">Subscribe</p>
            <p className="text-gray-600 dark:text-gray-300 text-balance text-sm sm:text-base">
              Get access to subscriber exclusive deals and be the first who gets
              informed about fresh sales.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row w-full items-stretch sm:items-end gap-3 sm:gap-2">
              <div className="w-full flex-1">
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
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white h-12 text-base"
                />
              </div>
              <Button className="shrink-0 h-12 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 w-full sm:w-auto px-6">Subscribe</Button>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Checkbox id="checkbox-link" className="mt-1" />
              <Label
                htmlFor="checkbox-link"
                className="text-gray-600 dark:text-gray-300 flex flex-wrap gap-1 select-none text-sm leading-relaxed"
              >
                I agree with the
                <a href="/terms" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline">
                  terms and conditions
                </a>
              </Label>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-8 sm:mt-10 text-center text-sm sm:text-base pb-safe">
          &copy; {YEAR} {brandName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

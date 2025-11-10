"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const POSTS = [
  {
    img: "/icons/icon-512.png",
    tag: "Guide",
    title: "Complete eSIM Setup Guide",
    desc: "Everything you need to know about setting up your eSIM for your Umrah journey. Step-by-step instructions to get connected instantly.",
    date: "Posted on 10 Nov",
    author: {
      img: "/icons/icon-192.png",
      name: "Umrah eSIM Team",
    },
  },
  {
    img: "/icons/icon-512.png",
    tag: "Travel Tips",
    title: "Staying Connected in Saudi Arabia",
    desc: "Essential tips for maintaining reliable connectivity during your pilgrimage in Makkah and Madinah. Make the most of your mobile data.",
    date: "Posted on 08 Nov",
    author: {
      img: "/icons/icon-192.png",
      name: "Travel Expert",
    },
  },
  {
    img: "/icons/icon-512.png",
    tag: "Tutorial",
    title: "Troubleshooting eSIM Issues",
    desc: "Common eSIM activation problems and how to solve them quickly. Get your connection working in minutes with these solutions.",
    date: "Posted on 05 Nov",
    author: {
      img: "/icons/icon-192.png",
      name: "Support Team",
    },
  },
]

export default function SimpleBlogContent01() {
  return (
    <section className="py-16">
      <div className="container mx-auto grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {POSTS.map(({ img, tag, title, desc, date, author }) => (
          <Card key={title} className="overflow-hidden py-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-4 pb-0">
              <div className="relative h-60 w-full overflow-hidden rounded-lg bg-linear-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-sky-600 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <Badge variant="secondary" className="mb-2">
                {tag}
              </Badge>
              <CardTitle className="mb-2 text-xl hover:text-sky-600 transition-colors cursor-pointer">{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardContent>
            <CardFooter className="flex items-center gap-3 p-6 pt-0">
              <Avatar>
                <AvatarImage src={author.img} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">{author.name}</p>
                <p className="text-muted-foreground text-xs text-gray-500">{date}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

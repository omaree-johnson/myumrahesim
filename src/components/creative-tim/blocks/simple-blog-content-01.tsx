"use client"

import Image from "next/image"
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
    img: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop",
    tag: "Guide",
    title: "Complete eSIM Setup Guide",
    desc: "Everything you need to know about setting up your eSIM for your Umrah journey. Step-by-step instructions to get connected instantly.",
    date: "Posted on 10 Nov",
    link: "/blog/esim-setup-guide",
    author: {
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&auto=format&fit=crop",
      name: "Umrah eSIM Team",
    },
  },
  {
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop",
    tag: "Travel Tips",
    title: "Staying Connected in Saudi Arabia",
    desc: "Essential tips for maintaining reliable connectivity during your pilgrimage in Makkah and Madinah. Make the most of your mobile data.",
    date: "Posted on 08 Nov",
    link: "/blog/staying-connected-saudi-arabia",
    author: {
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&auto=format&fit=crop",
      name: "Travel Expert",
    },
  },
  {
    img: "https://images.unsplash.com/photo-1551817958-20c93da370c6?w=800&auto=format&fit=crop",
    tag: "Tutorial",
    title: "Troubleshooting eSIM Issues",
    desc: "Common eSIM activation problems and how to solve them quickly. Get your connection working in minutes with these solutions.",
    date: "Posted on 05 Nov",
    link: "/blog/troubleshooting-esim",
    author: {
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop",
      name: "Support Team",
    },
  },
]

export default function SimpleBlogContent01() {
  return (
    <section className="py-16">
      <div className="container mx-auto grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {POSTS.map(({ img, tag, title, desc, date, link, author }) => (
          <a key={title} href={link} className="block">
            <Card className="overflow-hidden py-0 hover:shadow-xl transition-shadow duration-300 h-full">
              <CardHeader className="p-4 pb-0">
                <div className="relative h-60 w-full overflow-hidden rounded-lg">
                  <img
                    src={img}
                    alt={title}
                    className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <Badge variant="secondary" className="mb-2">
                  {tag}
                </Badge>
                <CardTitle className="mb-2 text-xl hover:text-sky-600 transition-colors">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardContent>
              <CardFooter className="flex items-center gap-3 p-6 pt-0">
                <Avatar>
                  <AvatarImage src={author.img} alt={author.name} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{author.name}</p>
                  <p className="text-muted-foreground text-xs">{date}</p>
                </div>
              </CardFooter>
            </Card>
          </a>
        ))}
      </div>
    </section>
  )
}

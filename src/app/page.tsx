import { HeroSection } from "@/components/hero-section";
import Footer from "@/components/footer";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "My Umrah eSIM - Instant Mobile Data for Saudi Arabia | Stay Connected",
  description: "Get instant eSIM activation for your Umrah journey in Saudi Arabia. High-speed 5G mobile data plans for Makkah and Madinah. No physical SIM card needed. Affordable prepaid data starting from £17.39. Activate in seconds.",
  openGraph: {
    title: "My Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. High-speed 5G data for Makkah and Madinah. No physical SIM needed.",
    type: "website",
    images: [
      {
        url: '/public/kaaba-hero.jpg',
        width: 512,
        height: 512,
        alt: 'Umrah eSIM Logo',
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <Footer />
    </>
  );
}

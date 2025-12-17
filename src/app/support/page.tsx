import type { Metadata } from 'next';
import { SupportPageClient } from '@/components/support-page-client';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'Support - Get Help with Your eSIM | My Umrah eSIM',
  description: 'Get 24/7 support for your eSIM. Contact us via email, WhatsApp, or browse our FAQ. We\'re here to help with activation, troubleshooting, and any questions about your Umrah eSIM.',
  keywords: [
    'eSIM support',
    'Umrah eSIM help',
    'eSIM customer service',
    'eSIM troubleshooting',
    'contact eSIM support',
    'WhatsApp support',
    'eSIM activation help',
  ],
  openGraph: {
    title: 'Support - Get Help with Your eSIM',
    description: 'Get 24/7 support for your eSIM. Contact us via email, WhatsApp, or browse our FAQ.',
    type: 'website',
    url: '/support',
  },
};

export default function SupportPage() {
  return (
    <>
      <SupportPageClient />
    </>
  );
}

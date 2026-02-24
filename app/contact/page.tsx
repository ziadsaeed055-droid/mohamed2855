import type { Metadata } from "next"
import { ContactPageContent } from "@/components/contact-page-content"

export const metadata: Metadata = {
  title: "تواصل معنا - Seven Blue | Contact Us",
  description:
    "تواصل مع فريق Seven Blue. نحن هنا للإجابة على استفساراتك وخدمتك. Contact Seven Blue team for any inquiries or support.",
  openGraph: {
    title: "تواصل معنا - Seven Blue",
    description: "تواصل مع فريق Seven Blue للاستفسارات والدعم",
    images: [
      {
        url: "/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Seven Blue Logo",
      },
    ],
  },
}

export default function ContactPage() {
  return <ContactPageContent />
}

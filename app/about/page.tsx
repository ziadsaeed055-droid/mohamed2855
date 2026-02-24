import type { Metadata } from "next"
import { AboutPageContent } from "@/components/about-page-content"

export const metadata: Metadata = {
  title: "من نحن - Seven Blue | About Us",
  description:
    "تعرف على قصة Seven Blue، رؤيتنا، قيمنا، وفريقنا. Discover Seven Blue's story, vision, values, and team.",
}

export default function AboutPage() {
  return <AboutPageContent />
}

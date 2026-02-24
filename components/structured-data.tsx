import React from "react"
import type { Product } from "@/lib/types"

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Seven Blue",
    url: "https://sevenblue.store",
    logo: "https://sevenblue.store/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png",
    description:
      "Seven Blue - متجر متخصص في الملابس الراقية والفاخرة للرجال والنساء والأطفال. تشكيلات عصرية وتقليدية بأسعار منافسة.",
    sameAs: [
      "https://www.facebook.com/sevenblue",
      "https://www.instagram.com/sevenblue",
      "https://www.twitter.com/sevenblue",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+20-XXX-XXX-XXXX",
      contactType: "Customer Service",
      areaServed: "EG",
      availableLanguage: ["ar", "en"],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Seven Blue",
    url: "https://sevenblue.store",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sevenblue.store/shop?search={search_term_string}",
      },
      query_input: "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn || product.nameAr,
    description: product.descriptionEn || product.descriptionAr,
    image: product.mainImage,
    brand: {
      "@type": "Brand",
      name: "Seven Blue",
    },
    offers: {
      "@type": "Offer",
      url: `https://sevenblue.store/product/${product.id}`,
      priceCurrency: "EGP",
      price: String(product.discount > 0 ? product.discountedPrice : product.salePrice),
      availability: product.quantity > 0 ? "InStock" : "OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Seven Blue",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100",
    },
    sku: product.id,
    productId: product.id,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function StoreSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Seven Blue",
    image: "https://sevenblue.store/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png",
    description:
      "متجر ملابس متخصص في الأزياء الفاخرة والراقية. تسوق أون لاين أفضل التشكيلات العصرية والتقليدية.",
    url: "https://sevenblue.store",
    telephone: "+20-XXX-XXX-XXXX",
    areaServed: {
      "@type": "Country",
      name: "Egypt",
    },
    priceRange: "EGP 100-5000",
    knowsAbout: [
      "ملابس رجالية",
      "ملابس نسائية",
      "ملابس أطفال",
      "أزياء فاخرة",
      "ملابس تقليدية",
      "جلاليب",
      "عبايات",
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Seven Blue",
    image: "https://sevenblue.store/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png",
    description:
      "Seven Blue - Wearing for you. متجر ملابس متخصص في الأزياء الفاخرة والراقية للرجال والنساء والأطفال.",
    url: "https://sevenblue.store",
    telephone: "+20-XXX-XXX-XXXX",
    email: "support@sevenblue.store",
    sameAs: [
      "https://www.facebook.com/sevenblue",
      "https://www.instagram.com/sevenblue",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Cairo, Egypt",
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    priceRange: "EGP 100-5000",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "22:00",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function FAQSchema({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

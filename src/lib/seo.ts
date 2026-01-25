/**
 * SEO utility functions for generating meta tags and structured data
 */

export const SITE_CONFIG = {
  name: "Hack@Davidson",
  description: "Davidson College's premier hackathon. Join us for 48 hours of innovation, collaboration, and creativity.",
  url: "https://hackatdavidson.com",
  ogImage: "/og-image.svg",
  twitterHandle: "@HackDavidson",
  locale: "en_US",
};

export function getCanonicalUrl(path: string = ""): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : SITE_CONFIG.url;
  return `${baseUrl}${path}`;
}

export function getEventStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Hack@Davidson",
    description: "Davidson College's premier hackathon. Join us for 48 hours of innovation, collaboration, and creativity.",
    startDate: "2026-02-20T00:00:00-05:00",
    endDate: "2026-02-22T23:59:59-05:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Davidson College",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Davidson",
        addressRegion: "NC",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Hack@Davidson",
      url: SITE_CONFIG.url,
    },
    image: getCanonicalUrl(SITE_CONFIG.ogImage),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: getCanonicalUrl("/"),
    },
  };
}

export function getOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hack@Davidson",
    url: SITE_CONFIG.url,
    logo: getCanonicalUrl("/logo.png"),
    description: SITE_CONFIG.description,
    sameAs: [
      // Add social media links if available
    ],
  };
}

export function getBlogPostingStructuredData(blog: {
  title: string;
  content: string;
  created_at: string;
  id: string;
  profile?: { firstname: string; lastname: string } | null;
}) {
  const authorName = blog.profile
    ? `${blog.profile.firstname} ${blog.profile.lastname}`.trim()
    : "Hack@Davidson Team";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    datePublished: blog.created_at,
    dateModified: blog.created_at,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Hack@Davidson",
      logo: {
        "@type": "ImageObject",
        url: getCanonicalUrl("/logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getCanonicalUrl(`/blog/${blog.id}`),
    },
  };
}

export function getBlogStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Hack@Davidson Blog",
    description: "Stories and updates from the Hack@Davidson team",
    url: getCanonicalUrl("/blog"),
    publisher: {
      "@type": "Organization",
      name: "Hack@Davidson",
      logo: {
        "@type": "ImageObject",
        url: getCanonicalUrl("/logo.png"),
      },
    },
  };
}

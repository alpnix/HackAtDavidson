import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import ProjectsSection from "@/components/ProjectsSection";
import TeamSection from "@/components/TeamSection";
import FAQSection from "@/components/FAQSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";
import { SITE_CONFIG, getCanonicalUrl, getEventStructuredData, getOrganizationStructuredData } from "@/lib/seo";

const Index = () => {
  const canonicalUrl = getCanonicalUrl("/");
  const ogImage = getCanonicalUrl(SITE_CONFIG.ogImage);
  const eventData = getEventStructuredData();
  const orgData = getOrganizationStructuredData();
  const location = useLocation();

  // Handle hash scrolling when page loads or hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1); // Remove the #
      // Small delay to ensure all content is rendered
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{SITE_CONFIG.name} - Davidson's Premier Hackathon</title>
        <meta name="title" content={`${SITE_CONFIG.name} - Davidson's Premier Hackathon`} />
        <meta name="description" content={SITE_CONFIG.description} />
        <meta name="keywords" content="hackathon, Davidson College, coding, programming, innovation, technology, student hackathon, North Carolina, MLH" />
        <meta name="author" content={SITE_CONFIG.name} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${SITE_CONFIG.name} - Davidson's Premier Hackathon`} />
        <meta property="og:description" content={SITE_CONFIG.description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta property="og:locale" content={SITE_CONFIG.locale} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
        <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`${SITE_CONFIG.name} - Davidson's Premier Hackathon`} />
        <meta name="twitter:description" content="Join us for 48 hours of innovation at Davidson College, February 20-22, 2026." />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="Hack@Davidson 2026 event preview card" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(eventData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(orgData)}
        </script>
      </Helmet>
      <a
        id="mlh-trust-badge"
        href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=yellow"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-yellow.svg"
          alt="Major League Hacking 2026 Hackathon Season"
        />
      </a>
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ScheduleSection />
        <ProjectsSection />
        <TeamSection />
        <FAQSection />
        <SponsorsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

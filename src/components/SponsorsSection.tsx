import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import precisely from "@/assets/sponsors/precisely.png";
import forest from "@/assets/sponsors/forest.png";
import p2 from "@/assets/sponsors/p2.png";
import stellar from "@/assets/sponsors/stellar.png";
import hurtHub from "@/assets/sponsors/hurt-hub.png";
import clt from "@/assets/sponsors/clt.png";
import summitCoffee from "@/assets/sponsors/summit-coffee.png";
import fidelity from "@/assets/sponsors/fidelity.png";
import starknet from "@/assets/sponsors/starknet.png";
import godaddy from "@/assets/sponsors/godaddy.png";
import kintone from "@/assets/sponsors/kintone.png";
import pureButtons from "@/assets/sponsors/pure-buttons.png";
import mlh from "@/assets/sponsors/mlh.png";
import davidsonCollege from "@/assets/sponsors/davidson-college.png";
import nord from "@/assets/sponsors/nord.png";
import cloudflare from "@/assets/sponsors/cloudflare.png";
import elevenlabs from "@/assets/sponsors/elevenlabs.svg";
import mobbin from "@/assets/sponsors/mobbin.png";
import pcbway from "@/assets/sponsors/pcbway.png";
import vercel from "@/assets/sponsors/vercel.png";

const sponsors = [
  { name: "Precisely", logo: precisely },
  { name: "Vercel", logo: vercel },
  { name: "ElevenLabs", logo: elevenlabs },
  { name: "Fidelity Investments", logo: fidelity },
  { name: "The Hurt Hub @ Davidson", logo: hurtHub },
  { name: "Starknet", logo: starknet },
  { name: "Stellar", logo: stellar },
  { name: "Forest", logo: forest },
  { name: "P2 Corporate Finance", logo: p2 },
  { name: "CLT", logo: clt },
  { name: "Summit Coffee", logo: summitCoffee },
  { name: "GoDaddy Registry", logo: godaddy },
  { name: "Kintone", logo: kintone },
  { name: "Pure Buttons", logo: pureButtons },
  { name: "Major League Hacking", logo: mlh },
  { name: "Mobbin", logo: mobbin },
  { name: "PCBWay", logo: pcbway },
  { name: "Davidson College", logo: davidsonCollege },
  { name: "Nord", logo: nord },
  { name: "Cloudflare", logo: cloudflare },
];

const SponsorsSection = () => {
  return (
    <section id="sponsors" className="py-16 sm:py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 sm:mb-6 px-4">Our Sponsors</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-12 px-4">
            Made possible by our amazing partners
          </p>

          {/* All Sponsors */}
          <div className="mb-12 sm:mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 items-center">
              {sponsors.map((sponsor) => (
                <div 
                  key={sponsor.name}
                  className="aspect-[2/1] rounded-md sm:rounded-lg bg-card border border-border flex items-center justify-center p-3 sm:p-4 hover:border-primary transition-all hover:scale-105 duration-200 hover:shadow-lg hover:shadow-primary/20"
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Become a Sponsor CTA */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-primary-foreground relative overflow-hidden">
            <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 border-4 border-primary-foreground/10 rotate-45" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Interested in Sponsoring?</h3>
              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 opacity-90">
                Help us create an amazing experience for students while connecting with top talent
              </p>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Sponsor Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;

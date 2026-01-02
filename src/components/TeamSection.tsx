import { Linkedin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import murtazaNikzadImg from "@/assets/team/murtaza-nikzad.jpg";
import abdulRafaeKamranImg from "@/assets/team/abdul-rafae-kamran.jpg";
import alpNiksarliImg from "@/assets/team/alp-niksarli.jpeg";
import hakanYavuzkaraImg from "@/assets/team/hakan-yavuzkara.jpg";
import juliaHoltImg from "@/assets/team/julia-holt.jpg";
import pacisNkubitoImg from "@/assets/team/pacis-nkubito.jpeg";
import tanakaMakoniImg from "@/assets/team/tanaka-makoni.jpeg";
import tenzingDorjiImg from "@/assets/team/tenzing-dorji.jpeg";
import tonyMallenNtiadorImg from "@/assets/team/tony-mallen-ntiador.jpeg";
import yurdanurYolcuImg from "@/assets/team/yurdanur-yolcu.jpeg";
import gopeshBahetiImg from "@/assets/team/gopesh-baheti.jpg"

const TeamSection = () => {
  const team = [
    {
      name: "Murtaza Nikzad",
      role: "President",
      initials: "MN",
      linkedin: "https://www.linkedin.com/in/murtaza-nikzad-877722158/",
      color: "bg-primary/20",
      image: murtazaNikzadImg,
    },
    {
      name: "Pacis Nkubito",
      role: "Vice President",
      initials: "PN",
      linkedin: "https://linkedin.com",
      color: "bg-accent/20",
      image: pacisNkubitoImg,
    },
    {
      name: "Tanaka Makoni",
      role: "Finance",
      initials: "TM",
      linkedin: "https://linkedin.com",
      color: "bg-primary/30",
      image: tanakaMakoniImg,
    },
    {
      name: "Abdul Rafae Kamran",
      role: "Finance",
      initials: "AK",
      linkedin: "https://linkedin.com",
      color: "bg-accent/30",
      image: abdulRafaeKamranImg,
    },
    {
      name: "Tenzing Dhendup Dorji",
      role: "Logistics",
      initials: "TD",
      linkedin: "https://linkedin.com",
      color: "bg-primary/25",
      image: tenzingDorjiImg,
    },
    {
      name: "Hakan Bora Yavuzkara",
      role: "Logistics",
      initials: "HY",
      linkedin: "https://linkedin.com",
      color: "bg-accent/25",
      image: hakanYavuzkaraImg,
    },
    {
      name: "Tony Mallen-Ntiador",
      role: "Logistics",
      initials: "TN",
      linkedin: "https://linkedin.com",
      color: "bg-primary/35",
      image: tonyMallenNtiadorImg,
    },
    {
      name: "Julia Holt",
      role: "Outreach",
      initials: "JH",
      linkedin: "https://linkedin.com",
      color: "bg-accent/35",
      image: juliaHoltImg,
    },
    {
      name: "Yurdanur Yolcu",
      role: "Social Media",
      initials: "YY",
      linkedin: "https://linkedin.com",
      color: "bg-primary/28",
      image: yurdanurYolcuImg,
    },
    {
      name: "Alp Niksarli",
      role: "Advisor",
      initials: "AN",
      linkedin: "https://linkedin.com",
      color: "bg-accent/28",
      image: alpNiksarliImg,
    },
    {
      name: "Gopesh Baheti",
      role: "Advisor",
      initials: "GB",
      linkedin: "https://linkedin.com",
      color: "bg-primary/32",
      image: gopeshBahetiImg,
    },
  ];

  return (
    <section id="team" className="py-16 sm:py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 sm:mb-6 px-4">Meet The Team</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              The passionate individuals making Hack@Davidson possible
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {team.map((member, index) => (
              <div key={index} className="group relative">
                <div className="text-center space-y-4">
                  {/* Avatar */}
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 border-4 border-border group-hover:border-primary transition-all duration-300 mx-auto">
                      {member.image && <AvatarImage src={member.image} alt={member.name} />}
                      <AvatarFallback className={`text-3xl font-bold ${member.color} text-primary`}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* LinkedIn Link */}
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 transform translate-x-2 translate-y-2 shadow-lg hover:scale-110"
                      aria-label={`${member.name}'s LinkedIn profile`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

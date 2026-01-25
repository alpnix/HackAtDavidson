import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-16 sm:py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Decorative Elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-20 right-10 w-64 h-64 border-4 border-primary/10 rotate-45" />
      <div className="hidden sm:block absolute bottom-20 left-10 w-48 h-48 border-4 border-accent/10" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 sm:mb-6 px-4">
            Last Year's Projects
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            Check out the amazing projects from Hack@Davidson 2025
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/80 mb-10 sm:mb-12 px-4">
            From AI-powered solutions to innovative web apps, our hackers built incredible projects in just 48 hours.
          </p>

          {/* CTA to Devpost */}
          <div className="bg-card border-2 border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
            <div className="space-y-4 sm:space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <ExternalLink className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground px-4">
                Explore All Projects on Devpost
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">
                Browse through submissions, read about their tech stacks, and see what our talented hackers created.
              </p>
              <Button
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                asChild
              >
                <a
                  href="https://hack-davidson-2025.devpost.com/project-gallery"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project Gallery
                  <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;

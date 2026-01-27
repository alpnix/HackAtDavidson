import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs: { question: string; answer: React.ReactNode }[] = [
    {
      question: "Who can participate?",
      answer: "Hack@Davidson is open to everyone! Whether you're a seasoned hacker or writing your first line of code, you're welcome here. We encourage students from all majors and backgrounds to join. Please note that participants younger than 18 years old must be accompanied by a parent or guardian.",
    },
    {
      question: "Is there a code of conduct?",
      answer: (
        <span>
          Absolutely — we follow MLH&#39;s Code of Conduct. You can read it
          here:{" "}
          <a
            href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-primary"
          >
            MLH Code of Conduct
          </a>
          .
        </span>
      ),
    },
    {
      question: "Do I need a team?",
      answer: "Nope! You can come solo and find a team at the event, or bring your own team of up to 3 people. We'll have team formation sessions to help everyone find their perfect match.",
    },
    {
      question: "What should I bring?",
      answer: "Bring your laptop, charger, and enthusiasm! We'll provide food, drinks, swag, and everything else you need for an amazing weekend. Don't forget a sleeping bag if you plan to rest.",
    },
    {
      question: "How much does it cost?",
      answer: "Hack@Davidson is completely FREE! Thanks to our amazing sponsors, we can provide meals, snacks, swag, and prizes at no cost to you. We believe cost shouldn't be a barrier to innovation.",
    },
    {
      question: "What can I build?",
      answer: "Anything you want! Mobile apps, websites, hardware projects, games, AI/ML projects – if you can dream it, you can build it. We'll have various tracks and challenges to inspire you.",
    },
    {
      question: "Will there be workshops?",
      answer: "Yes! We'll have workshops throughout the event covering topics like web development, AI/ML, mobile development, and more. Perfect for learning new skills or brushing up on existing ones.",
    },
    {
      question: "What about prizes?",
      answer: "We have awesome prizes for various categories including Best Overall, Best Design, Most Creative Use of Technology, and more. Plus, all participants receive swag!",
    },
    {
      question: "Do you provide travel reimbursement?",
      answer: "We offer limited travel reimbursements for students coming from outside the Charlotte area. Details will be sent to accepted participants.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 sm:mb-6 px-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Got questions? We've got answers!
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 border-border rounded-lg sm:rounded-xl px-4 sm:px-6 data-[state=open]:border-primary transition-colors"
              >
                <AccordionTrigger className="text-base sm:text-lg font-semibold text-left hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

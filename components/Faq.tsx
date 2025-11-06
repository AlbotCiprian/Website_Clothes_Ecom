import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How does Claroche sizing run?",
    answer:
      "Our silhouettes are designed for a tailored-but-relaxed fit. If you are between sizes or prefer a roomier feel, we recommend sizing up. Detailed measurements live on every product page.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Returns and exchanges are complimentary within 30 days of delivery as long as hangtags remain attached. Start a return anytime inside your Claroche account.",
  },
  {
    question: "How should I care for my pieces?",
    answer:
      "Machine wash cold on a gentle cycle. Lay flat to dry to preserve the fabric finish. Each order includes a care guide tailored to the fibers you receive.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes — Claroche ships to over 40 countries with transparent duties & taxes presented at checkout. Transit estimates are shared before you confirm your order.",
  },
];

export default function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-8">
      <div>
        <h2 id="faq-heading" className="text-lg font-semibold text-neutral-900">
          Claroche FAQs
        </h2>
        <p className="text-sm text-neutral-600">Answers to the most common questions before you checkout.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`} className="border-b-neutral-200">
            <AccordionTrigger className="text-left text-sm font-medium text-neutral-900">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-neutral-600">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

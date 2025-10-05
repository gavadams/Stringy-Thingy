"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What&apos;s included in the kit?",
    answer: "Each kit includes a pre-cut wooden frame, numbered pegs and notches, premium cotton string, access to our online pattern generator, step-by-step digital instructions, and a finishing kit. Premium kits also include extra string colors and display stands."
  },
  {
    question: "How long does it take to complete?",
    answer: "Completion time varies by kit size: Starter Kit (3-4 hours), Standard Kit (4-6 hours), and Premium Kit (6-8 hours). The time depends on your experience level and how detailed you want your piece to be."
  },
  {
    question: "What kind of photos work best?",
    answer: "High-contrast photos with clear subjects work best. Portraits, pets, and landscapes with good lighting and distinct features create the most striking string art. Avoid very dark or very light photos as they may not translate well to string art."
  },
  {
    question: "Can I use the code multiple times?",
    answer: "Each kit code can be used to generate multiple patterns, but the number of generations depends on your kit type. Starter kits allow 3 generations, Standard kits allow 5 generations, and Premium kits allow unlimited generations."
  },
  {
    question: "What if I make a mistake?",
    answer: "Don&apos;t worry! Our kits include extra string, and you can always undo and redo sections. The numbered pegs make it easy to follow the pattern, and our digital instructions include troubleshooting tips for common issues."
  },
  {
    question: "Can I order custom frame sizes?",
    answer: "Currently, we offer three standard sizes (10\", 12\", and 16\"). Custom sizes may be available for bulk orders. Contact our support team for special requests and we&apos;ll do our best to accommodate your needs."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location. Free shipping is available for orders over £50 within the UK. International shipping typically takes 7-14 business days."
  },
  {
    question: "How do I get my instructions?",
    answer: "Instructions are delivered digitally via email after purchase. You&apos;ll receive a link to access your personalized pattern generator and step-by-step guide. The instructions are also available in your account dashboard for easy access anytime."
  },
  {
    question: "Is this suitable for beginners?",
    answer: "Absolutely! Our kits are designed for all skill levels. The numbered pegs and clear instructions make it easy for beginners, while the detailed patterns provide a satisfying challenge for experienced crafters. No prior experience needed!"
  },
  {
    question: "What if I&apos;m not satisfied with my purchase?",
    answer: "We offer a 30-day money-back guarantee. If you&apos;re not completely satisfied with your kit, contact our support team and we&apos;ll provide a full refund or replacement. We want you to love your Stringy-Thingy experience!"
  }
];

export default function FAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers! Here are the most common questions 
            about our Stringy-Thingy kits and process.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-purple-50 transition-colors">
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help! Get in touch and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Contact Support
              </motion.a>
              <motion.a
                href="/shop"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Shop Now
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

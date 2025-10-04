import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            How It Works
          </h1>
          <p className="text-lg text-secondary-600">
            Learn how to create beautiful string art with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="animate-slide-up text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <CardTitle>Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                Use our intuitive generator to create your string art design. 
                Choose from templates or create your own pattern.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up text-center" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <CardTitle>Prepare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                Get your materials ready. We&apos;ll provide you with a detailed 
                materials list and step-by-step instructions.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up text-center" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <CardTitle>Create</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                Follow our guided instructions to bring your design to life. 
                Share your creation with the community!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-secondary-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What materials do I need?</AccordionTrigger>
              <AccordionContent>
                You&apos;ll need a wooden board, nails, string or thread, and a hammer. 
                We provide detailed material lists for each design.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it suitable for beginners?</AccordionTrigger>
              <AccordionContent>
                Absolutely! Our platform is designed for all skill levels. 
                We provide step-by-step instructions and beginner-friendly designs.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I create custom designs?</AccordionTrigger>
              <AccordionContent>
                Yes! Our generator allows you to create completely custom designs 
                or modify existing templates to match your vision.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>How long does it take to complete a project?</AccordionTrigger>
              <AccordionContent>
                Project completion time varies by complexity. Simple designs can be 
                completed in a few hours, while complex patterns may take several days.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground font-bricolage p-8 md:p-16">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center border-b pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
          <p>By using Get2U Errand, you agree to submit to our premium concierge protocols. These terms constitute a legally binding agreement made between you and Get2U Errand concerning your access to and use of the application.</p>
          
          <h2 className="text-2xl font-bold">2. Service Usage</h2>
          <p>You agree to use our concierge services only for lawful purposes. Any attempt to transport illegal goods, hazardous materials, or engage in prohibited activities will result in immediate termination and reporting to the appropriate authorities.</p>
          
          <h2 className="text-2xl font-bold">3. Pricing and Payments</h2>
          <p>All prices are strictly calculated based on distance, requested service tiers, and market demand. You agree to pay all charges to your account in accordance with the billing terms in effect at the time a fee or charge is due and payable.</p>
          
          <h2 className="text-2xl font-bold">4. Liability</h2>
          <p>While we comprehensively insure items actively in transit during our concierge services, Get2U Errand holds no liability for natural wear and tear or pre-existing damage to vehicles or items subjected to our services.</p>
        </div>
      </div>
    </div>
  );
}

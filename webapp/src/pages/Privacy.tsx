import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground font-bricolage p-8 md:p-16">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center border-b pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold">1. Information We Collect</h2>
          <p>We strictly collect the minimal amount of data necessary to provide you with elite, frictionless concierge services. This includes your name, email, delivery addresses, and encrypted payment tokens.</p>
          
          <h2 className="text-2xl font-bold">2. Location Tracking</h2>
          <p>To provide real-time updates on your errands, we track the GPS locations of our agents during active service cycles. WE DO NOT continuously track customer locations outside of active service interactions.</p>
          
          <h2 className="text-2xl font-bold">3. Data Sharing</h2>
          <p>Get2U Errand does not sell, rent, or lease your personal information to third parties. We only share necessary data with trusted service providers who assist us in operating our platform, conducting our business, or servicing you, so long as those parties agree to keep this information strictly confidential.</p>
          
          <h2 className="text-2xl font-bold">4. Security</h2>
          <p>We implement a variety of elite security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
        </div>
      </div>
    </div>
  );
}

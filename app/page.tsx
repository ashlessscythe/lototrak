import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {siteConfig.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Modernizing Safety Protocols for the Digital Age
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
          <Separator className="my-8" />
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Digital Safety Management</CardTitle>
                <CardDescription>
                  Streamline your lockout/tagout procedures with QR-based
                  tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enhance workplace safety with digital tracking, real-time
                  status updates, and comprehensive audit trails.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>OSHA Compliance</CardTitle>
                <CardDescription>
                  Stay compliant with automated documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Maintain detailed records of all lockout events, personnel
                  actions, and safety procedures.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  Track equipment status instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor lock statuses, receive instant notifications, and
                  manage emergency overrides efficiently.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="benefits"
          className="container mx-auto px-4 py-16 bg-muted/50"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose {siteConfig.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Enhanced Safety</h3>
              <p className="text-muted-foreground">
                Reduce workplace accidents with foolproof digital tracking and
                verification systems.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Improved Efficiency</h3>
              <p className="text-muted-foreground">
                Streamline workflows with QR code scanning and mobile-first
                design.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Complete Visibility</h3>
              <p className="text-muted-foreground">
                Access comprehensive reports and audit trails for better
                oversight.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Regulatory Compliance</h3>
              <p className="text-muted-foreground">
                Meet and exceed safety standards with automated documentation.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Ready to Modernize Your Safety Protocols?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join industry leaders in transforming workplace safety management
            with {siteConfig.name}'s comprehensive digital solution.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Start Free Trial</Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

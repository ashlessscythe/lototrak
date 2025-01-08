import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function Contributing() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Contributing to LotoTrak</h1>

        <div className="space-y-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We welcome contributions to LotoTrak! Whether you&apos;re fixing
                bugs, improving documentation, or proposing new features, your
                help makes LotoTrak better for everyone.
              </p>
              <p className="text-muted-foreground">
                Visit our{" "}
                <a
                  href="https://github.com/ashlessscythe/lototrak"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>{" "}
                to get started.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Contribute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Fork the Repository</h3>
                <p className="text-muted-foreground">
                  Start by forking the repository to your GitHub account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Create a Branch</h3>
                <p className="text-muted-foreground">
                  Create a branch for your contribution with a descriptive name.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Make Your Changes</h3>
                <p className="text-muted-foreground">
                  Implement your changes, following our coding standards and
                  guidelines.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Submit a Pull Request</h3>
                <p className="text-muted-foreground">
                  Open a pull request with a clear description of your changes
                  and their purpose.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Development Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                1. Clone your fork:
                <code className="block bg-muted p-2 rounded mt-2">
                  git clone https://github.com/your-username/lototrak.git
                </code>
              </p>
              <p className="text-muted-foreground mb-4">
                2. Install dependencies:
                <code className="block bg-muted p-2 rounded mt-2">
                  npm install
                </code>
              </p>
              <p className="text-muted-foreground">
                3. Create a branch and start developing!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

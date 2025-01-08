import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";

export default function UserGuidePage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">User Guide</h1>

        <div className="space-y-8">
          {/* Getting Started */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    1. Sign Up Process
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Click the &quot;Get Started&quot; button on the homepage
                    </li>
                    <li>Fill out the registration form with your details</li>
                    <li>Submit the form to create your account</li>
                    <li>Your account will be created with a PENDING status</li>
                    <li>Wait for admin approval before accessing the system</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    2. Account Activation
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>An administrator will review your registration</li>
                    <li>
                      Once approved, you&apos;ll receive an email notification
                    </li>
                    <li>You can then sign in using your credentials</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Lock Management */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Lock Management Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    1. Physical Lock Placement
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Locate the equipment that needs to be locked out</li>
                    <li>
                      Place the physical lock on the device following safety
                      protocols
                    </li>
                    <li>Ensure the lock is secure and properly engaged</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    2. Digital Lock Assignment
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Open the mobile app or web interface</li>
                    <li>Navigate to the lock scanning section</li>
                    <li>Scan the QR code on the physical lock</li>
                    <li>Select the corresponding device from the system</li>
                    <li>
                      Confirm the assignment to link the lock to the device
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* System Features */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Security Features
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Secure authentication system</li>
                    <li>Role-based access control (RBAC)</li>
                    <li>User authorization levels</li>
                    <li>Audit trail logging</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Lock Management
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>QR code scanning for quick identification</li>
                    <li>Real-time lock status tracking</li>
                    <li>Device assignment and management</li>
                    <li>Historical tracking of lock usage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function FAQPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Why is my account in PENDING status?
                </h3>
                <p className="text-muted-foreground mt-2">
                  For security reasons, all new accounts require administrator
                  approval before gaining access to the system. This ensures
                  only authorized personnel can access sensitive safety
                  controls.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  How long does account approval take?
                </h3>
                <p className="text-muted-foreground mt-2">
                  Account approval typically takes 1-2 business days.
                  You&apos;ll receive an email notification once your account is
                  approved.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  What roles are available in the system?
                </h3>
                <p className="text-muted-foreground mt-2">
                  The system uses role-based access control with different
                  permission levels including standard users, supervisors, and
                  administrators. Each role has specific capabilities aligned
                  with their responsibilities.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  How do I assign a lock to a device?
                </h3>
                <p className="text-muted-foreground mt-2">
                  First, place the physical lock on the device. Then, use the
                  system to scan the lock&apos;s QR code and select the
                  corresponding device from the system. Confirm the assignment
                  to complete the process.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  What happens if a QR code is damaged?
                </h3>
                <p className="text-muted-foreground mt-2">
                  Contact your system administrator immediately. They can help
                  identify the lock through backup identification methods and
                  arrange for a replacement QR code if necessary.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Can multiple users manage the same lock?
                </h3>
                <p className="text-muted-foreground mt-2">
                  Yes, but access is controlled through role-based permissions.
                  Only authorized users with appropriate permissions can manage
                  specific locks and devices.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  How is my data protected?
                </h3>
                <p className="text-muted-foreground mt-2">
                  The system employs industry-standard security measures
                  including encrypted communications, secure authentication, and
                  comprehensive audit logging of all actions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  What happens during system maintenance?
                </h3>
                <p className="text-muted-foreground mt-2">
                  During scheduled maintenance, the system remains operational
                  but may have limited functionality. Critical safety features
                  always remain active. Users are notified in advance of any
                  maintenance windows.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Is there a mobile app available?
                </h3>
                <p className="text-muted-foreground mt-2">
                  The system is accessible through any modern web browser on
                  mobile devices. The responsive design ensures full
                  functionality on both desktop and mobile platforms.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

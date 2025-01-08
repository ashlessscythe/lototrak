import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { siteConfig } from "@/lib/config";

const APP_NAME = siteConfig.name;

export function SiteFooter() {
  return (
    <footer className="border-t w-full">
      <div className="container max-w-screen-2xl mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 md:h-16 md:flex-row md:py-0">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/contributing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Contributing
          </Link>
          <Link
            href="https://github.com/ashlessscythe/lototrak"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <FaGithub className="h-5 w-5" />
            <span className="sr-only">GitHub repository</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

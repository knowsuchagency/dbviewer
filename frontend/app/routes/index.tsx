import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth } from "@/hooks";
import { FileCode, Database, Download, FolderOpen } from "lucide-react";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  const title = "DBML Viewer";
  const description = "Visualize and export your database schemas from DBML or SQL DDL";
  const siteUrl = "https://your-domain.com";
  const imageUrl = `${siteUrl}/og-image.png`;

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: "DBML, Database, Schema, ERD, Diagram, SQL" },

    // OpenGraph tags
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: siteUrl },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
    { property: "og:site_name", content: "DBML Viewer" },
    { property: "og:locale", content: "en_US" },

    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: title },

    // Additional meta tags
    { name: "theme-color", content: "#000000" },
    { name: "robots", content: "index, follow" },
  ];
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            DBML Viewer
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Visualize your database schemas with beautiful, interactive diagrams
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link to="/viewer">
                <FileCode className="h-5 w-5 mr-2" />
                Open Viewer
              </Link>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" size="lg">
                <Link to="/diagrams">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  My Diagrams
                </Link>
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
              <FileCode className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">DBML & SQL Support</h3>
              <p className="text-sm text-muted-foreground">
                Paste DBML code or import SQL DDL from PostgreSQL, MySQL, or SQL Server
              </p>
            </div>
            <div className="p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
              <Database className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Interactive Diagrams</h3>
              <p className="text-sm text-muted-foreground">
                Drag tables, zoom, pan, and explore your schema visually
              </p>
            </div>
            <div className="p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border">
              <Download className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Export Anywhere</h3>
              <p className="text-sm text-muted-foreground">
                Export as PNG, SVG, SQL DDL, or DBML for documentation
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <p className="mt-8 text-sm text-muted-foreground">
              <Link to="/signup" className="text-primary hover:underline">Sign up</Link> to save your diagrams and access them later
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

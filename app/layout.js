import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import PublicChrome from "@/components/PublicChrome";

export const metadata = {
  title: "HomeLab GH - Ghana Home Lab Service",
  description: "Professional home sample collection and lab testing across Ghana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <PublicChrome>{children}</PublicChrome>
        </ToastProvider>
      </body>
    </html>
  );
}

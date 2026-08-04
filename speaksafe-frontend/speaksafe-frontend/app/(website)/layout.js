import { Toaster } from "sonner";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";

export const metadata = {
  title: "SpeakSafe",
  description: "Anonymous school safety reporting platform",
};

export default function WebsiteLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-(--paper)">{children}</main>

      <Toaster richColors position="top-right" closeButton expand />

      <Footer />
    </>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Sankardev Sishu Vidya Niketan, Mathurapur. Find our address, phone numbers, and email.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

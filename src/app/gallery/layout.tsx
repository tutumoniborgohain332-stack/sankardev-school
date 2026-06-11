import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore photos and videos from Sankardev Sishu Vidya Niketan, Mathurapur.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

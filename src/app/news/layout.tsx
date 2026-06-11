import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Notices",
  description: "Latest news, announcements, and notices from SSVN Mathurapur.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

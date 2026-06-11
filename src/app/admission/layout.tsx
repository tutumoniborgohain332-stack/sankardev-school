import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admissions",
  description: "Information about admission process, criteria, and forms at SSVN Mathurapur.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

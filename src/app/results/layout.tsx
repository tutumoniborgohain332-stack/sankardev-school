import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Results",
  description: "Check latest examination results for students of SSVN Mathurapur.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

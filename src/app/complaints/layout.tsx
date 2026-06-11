import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaints & Reports",
  description: "Submit complaints, feedback, or reports directly to the school administration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

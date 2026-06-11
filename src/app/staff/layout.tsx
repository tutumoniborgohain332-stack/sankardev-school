import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Staff",
  description: "Meet the dedicated teachers and staff members of SSVN Mathurapur.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

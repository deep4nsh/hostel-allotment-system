import { Metadata } from "next";
import WardenDashboardContent from "./content";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function WardenDashboardPage() {
  return <WardenDashboardContent />;
}

import { Metadata } from "next";
import AnalyticsPageContent from "./content";

export const metadata: Metadata = {
    title: "Analytics",
};

export default function AnalyticsPage() {
    return <AnalyticsPageContent />;
}

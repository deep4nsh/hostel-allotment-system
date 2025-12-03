import { Metadata } from "next";
import AdminRequestsPageContent from "./content";

export const metadata: Metadata = {
    title: "Requests",
};

export default function AdminRequestsPage() {
    return <AdminRequestsPageContent />;
}

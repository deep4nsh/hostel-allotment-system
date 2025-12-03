import { Metadata } from "next";
import DocumentsPageContent from "./content";

export const metadata: Metadata = {
    title: "Documents",
};

export default function DocumentsPage() {
    return <DocumentsPageContent />;
}

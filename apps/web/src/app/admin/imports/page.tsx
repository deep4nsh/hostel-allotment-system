import { Metadata } from "next";
import AdminImportsContent from "./content";

export const metadata: Metadata = {
    title: "Imports",
};

export default function AdminImportsPage() {
    return <AdminImportsContent />;
}

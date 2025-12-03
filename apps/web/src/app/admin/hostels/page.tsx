import { Metadata } from "next";
import AdminHostelsContent from "./content";

export const metadata: Metadata = {
    title: "Hostels",
};

export default function AdminHostelsPage() {
    return <AdminHostelsContent />;
}

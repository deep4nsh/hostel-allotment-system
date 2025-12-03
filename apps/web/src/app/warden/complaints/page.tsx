import { Metadata } from "next";
import WardenComplaintsContent from "./content";

export const metadata: Metadata = {
    title: "Complaints",
};

export default function WardenComplaintsPage() {
    return <WardenComplaintsContent />;
}

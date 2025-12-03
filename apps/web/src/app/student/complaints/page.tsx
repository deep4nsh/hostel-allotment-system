import { Metadata } from "next";
import StudentComplaintsContent from "./content";

export const metadata: Metadata = {
    title: "Complaints",
};

export default function StudentComplaintsPage() {
    return <StudentComplaintsContent />;
}

import { Metadata } from "next";
import StudentPaymentsContent from "./content";

export const metadata: Metadata = {
    title: "Payments",
};

export default function StudentPaymentsPage() {
    return <StudentPaymentsContent />;
}

import { Metadata } from "next";
import StudentRequestsContent from "./content";

export const metadata: Metadata = {
    title: "Requests",
};

export default function StudentRequestsPage() {
    return <StudentRequestsContent />;
}

import { Metadata } from "next";
import StudentProfileContent from "./content";

export const metadata: Metadata = {
    title: "Profile",
};

export default function StudentProfilePage() {
    return <StudentProfileContent />;
}

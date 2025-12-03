import { Metadata } from "next";
import StudentRebateContent from "./content";

export const metadata: Metadata = {
    title: "Mess Rebate",
};

export default function StudentRebatePage() {
    return <StudentRebateContent />;
}

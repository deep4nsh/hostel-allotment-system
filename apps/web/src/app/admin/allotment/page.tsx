import { Metadata } from "next";
import AdminAllotmentContent from "./content";

export const metadata: Metadata = {
    title: "Allotment",
};

export default function AdminAllotmentPage() {
    return <AdminAllotmentContent />;
}

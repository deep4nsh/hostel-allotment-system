import { Metadata } from "next";
import AdminRefundsContent from "./content";

export const metadata: Metadata = {
    title: "Refunds",
};

export default function AdminRefundsPage() {
    return <AdminRefundsContent />;
}

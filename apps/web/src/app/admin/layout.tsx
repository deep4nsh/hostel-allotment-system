import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "Admin's page-%s",
        default: "Admin's page",
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

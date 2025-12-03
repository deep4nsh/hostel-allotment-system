import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "Warden's Page-%s",
        default: "Warden's Page",
    },
};

export default function WardenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

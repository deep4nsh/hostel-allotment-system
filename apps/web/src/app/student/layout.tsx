import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "Student's Page-DTU-%s",
        default: "Student's Page-DTU",
    },
};

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

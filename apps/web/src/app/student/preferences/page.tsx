import { Metadata } from "next";
import PreferencesPageContent from "./content";

export const metadata: Metadata = {
    title: "Preferences",
};

export default function PreferencesPage() {
    return <PreferencesPageContent />;
}

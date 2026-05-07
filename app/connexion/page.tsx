import { Metadata } from "next";
import { Suspense } from "react";
import Connexion from "./content";
 
export const metadata: Metadata = {
  title: "Connexion",
};
 
export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <Connexion />
    </Suspense>
  );
}

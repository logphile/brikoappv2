import type jsPDF from "jspdf";
// Vite/Nuxt will inline these as asset URLs; we fetch and convert to base64
import OutfitRegular from "@/assets/fonts/Outfit-Regular.ttf?url";
import OutfitSemi from "@/assets/fonts/Outfit-SemiBold.ttf?url";
import OutfitHeavy from "@/assets/fonts/Outfit-ExtraBold.ttf?url";

async function fetchAsBase64(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const buf = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function registerOutfit(pdf: jsPDF) {
  const [reg, semi, heavy] = await Promise.all([
    fetchAsBase64(OutfitRegular),
    fetchAsBase64(OutfitSemi),
    fetchAsBase64(OutfitHeavy)
  ]);

  (pdf as any).addFileToVFS("Outfit-Regular.ttf", reg);
  (pdf as any).addFileToVFS("Outfit-SemiBold.ttf", semi);
  (pdf as any).addFileToVFS("Outfit-ExtraBold.ttf", heavy);
  (pdf as any).addFont("Outfit-Regular.ttf", "Outfit", "normal");
  (pdf as any).addFont("Outfit-SemiBold.ttf", "Outfit", "bold");
  (pdf as any).addFont("Outfit-ExtraBold.ttf", "Outfit", "heavy");
}

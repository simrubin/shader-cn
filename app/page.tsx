"use client";

import { PresetGallery } from "@/components/preset-gallery";
import { shaderPresets } from "@/lib/shader-presets";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const router = useRouter();

  const handleSelect = (preset: typeof shaderPresets[0]) => {
    // When a preset is selected, we navigate to the editor with the preset selected
    // Since the editor is on a different route (or state), we'll need to pass this info.
    // For now, let's assume the editor is at /editor and we pass the preset name via query param
    // or we can use local storage / global state.
    // Given the previous setup, the editor was the main page.
    // Let's change the route structure:
    // / -> Gallery
    // /editor -> Shader Editor
    
    // We'll use query params to pass the preset to the editor
    const params = new URLSearchParams();
    params.set("preset", preset.name);
    router.push(`/editor?${params.toString()}`);
  };

  return (
    <div className="w-full h-screen bg-[#f5f5f7]">
      <PresetGallery 
        presets={shaderPresets} 
        onSelect={handleSelect} 
        onClose={() => {}} // No close button needed on main page
      />
    </div>
  );
}

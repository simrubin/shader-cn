"use client";

import { ShaderEditor } from "@/components/shader-editor";
import { Suspense } from "react";

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShaderEditor />
    </Suspense>
  );
}


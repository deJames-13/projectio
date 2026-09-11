"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProjectRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}`);
    } else {
      router.replace("/projects");
    }
  }, [projectId, router]);

  return null;
}

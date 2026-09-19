"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useUserNotes } from "@/lib/stores/userNotes";

const FloatingChatLayer = dynamic(() => import("@/components/chat/FloatingChatLayer"), { ssr: false });
const QuizExplainLayer = dynamic(() => import("@/components/quiz/QuizExplainLayer"), { ssr: false });
const RecordPreviewLayer = dynamic(() => import("@/components/review/RecordPreviewLayer"), { ssr: false });
const ArtifactViewer = dynamic(() => import("@/components/chat/ArtifactViewer"), { ssr: false });
const ImageGenViewerLayer = dynamic(() => import("@/components/chat/ImageGenViewer"), { ssr: false });
const DocumentViewerLayer = dynamic(() => import("@/components/chat/DocumentViewer"), { ssr: false });
const NoteCitationViewer = dynamic(() => import("@/components/chat/NoteCitationViewer"), { ssr: false });
const UserNoteLayer = dynamic(() => import("@/components/notes/UserNoteLayer"), { ssr: false });
const FlashcardCiteWindow = dynamic(() => import("@/components/notes/FlashcardCiteWindow"), { ssr: false });
const AgentProductPickerWindow = dynamic(() => import("@/components/notes/AgentProductPickerWindow"), { ssr: false });
const MemoryInboxLayer = dynamic(() => import("@/components/memory/MemoryInboxLayer"), { ssr: false });
const SourceTraceViewer = dynamic(() => import("@/components/chat/SourceTraceViewer"), { ssr: false });
const SourcePreviewViewer = dynamic(() => import("@/components/chat/SourcePreviewViewer"), { ssr: false });
const AttachmentPreviewViewer = dynamic(() => import("@/components/chat/AttachmentPreviewViewer"), { ssr: false });
const MessageContextMenu = dynamic(() => import("@/components/shared/MessageContextMenu"), { ssr: false });
const BillingDashboardLayer = dynamic(() => import("@/components/chat/BillingDashboard"), { ssr: false });
const MembershipSponsorLayer = dynamic(() => import("@/components/chat/MembershipSponsorWindow"), { ssr: false });
const ProjectFilesLayer = dynamic(() => import("@/components/project/ProjectFilesLayer"), { ssr: false });

/**
 * 首屏不立刻挂 15 个窗层。idle 后再挂；用户一开窗则马上挂，避免水合同时解析一堆 chunk。
 */
export default function DeferredWindowLayers() {
  const windowCount = useWindowManager((s) => s.windows.length);
  const openNoteCount = useUserNotes((s) => s.openEditorIds.length);
  const libraryOpen = useUserNotes((s) => s.libraryOpen);
  const [idleReady, setIdleReady] = useState(false);
  const neededNow = windowCount > 0 || openNoteCount > 0 || libraryOpen;

  useEffect(() => {
    if (neededNow || idleReady) return;
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setIdleReady(true), { timeout: 900 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdleReady(true), 0);
    return () => window.clearTimeout(id);
  }, [idleReady, neededNow]);

  if (!idleReady && !neededNow) return null;

  return (
    <>
      <FloatingChatLayer />
      <QuizExplainLayer />
      <RecordPreviewLayer />
      <ArtifactViewer />
      <ImageGenViewerLayer />
      <DocumentViewerLayer />
      <NoteCitationViewer />
      <UserNoteLayer />
      <FlashcardCiteWindow />
      <AgentProductPickerWindow />
      <MemoryInboxLayer />
      <SourceTraceViewer />
      <SourcePreviewViewer />
      <AttachmentPreviewViewer />
      <MessageContextMenu />
      <BillingDashboardLayer />
      <MembershipSponsorLayer />
      <ProjectFilesLayer />
    </>
  );
}

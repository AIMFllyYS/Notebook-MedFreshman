# `lib/stores/`

Zustand store 的唯一落点。本目录**不做桶导出**（避免把全部 store 打进每个页面）。

清点方法：搜 `from "zustand"` / `from 'zustand'` 且文件内有 `create(`。共 **28** 个。

| 文件 | hook | persist name / 存储 |
|------|------|---------------------|
| `artifacts.ts` | `useArtifacts` | `artifacts`（idb） |
| `documents.ts` | `useDocuments` | `documents`（idb） |
| `imageGen.ts` | `useImageGen` | `image-gen`（idb） |
| `skills.ts` | `useSkills` | `skills`（idb） |
| `reviewCards.ts` | `useReviewCards` | `review-cards`（idb） |
| `billing.ts` | `useBillingStore` | `billing-history`（idb） |
| `settings.ts` | `useSettings` | `gailvlun-settings-v1`（自定义 localStorage） |
| `theme.ts` | `useTheme` | `gailvlun-theme` + `gailvlun-appearance-v1` |
| `academicYear.ts` | `useAcademicYear` | `gailvlun-academic-year` |
| `browser.ts` | `useBrowser` | `gailvlun-browser-v1` |
| `chatHistory.ts` | `useChatHistory` | `chat-history` / `chat-manifest` / `chat-session:*`（chatStorage） |
| `windowManager.ts` | `useWindowManager` | 不持久化 |
| `floatingChats.ts` | `useFloatingChats` | `quickExplainWindowSize`（仅窗口尺寸） |
| `chatUI.ts` | `useChatUI` | 不持久化 |
| `contextMenu.ts` | `useContextMenu` | 不持久化 |
| `noteCitations.ts` | `useNoteCitations` | 不持久化 |
| `noteLocator.ts` | `useNoteLocator` | 不持久化 |
| `recordPreviews.ts` | `useRecordPreviews` | 不持久化 |
| `tokenTracker.ts` | `useTokenTracker` | 不持久化 |
| `floatingTokenTracker.ts` | `useFloatingTokenTracker` | 不持久化 |
| `keyboard/keyboardSettings.ts` | `useKeyboardSettings` | `gailvlun-disabled-shortcuts` |
| `keyboard/reviewKeyboard.ts` | `useReviewKeyboard` | 不持久化 |
| `keyboard/shortcutHelp.ts` | `useShortcutHelp` | 不持久化 |
| `keyboard/globalSearch.ts` | `useGlobalSearch` | 不持久化 |
| `keyboard/overlayStack.ts` | `useOverlayStack` | 不持久化 |
| `ui.ts` | `useStore` | `gailvlun-sidebar-collapsed` / `gailvlun-topbar-collapsed` |
| `quiz.ts` | `useQuizStore` | `gailvlun-quiz-progress-v1`（经 `lib/quiz-progress.ts`） |
| `lightbox.ts` | `useLightbox` | 不持久化 |

旧路径（`lib/hooks/useX.ts` 等）保留 re-export 一个发布周期。

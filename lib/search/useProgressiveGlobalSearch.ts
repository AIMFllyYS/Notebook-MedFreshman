"use client";

import { useEffect, useMemo, useState } from "react";
import { contentTree } from "@/lib/content-data";
import type { AcademicYearId } from "@/lib/constants/academic-year";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useReviewCards } from "@/lib/stores/reviewCards";
import {
  buildGlobalSearchIndex,
  chapterHitsFromIndex,
  listBodySearchShards,
  matchFlashcard,
  matchUserNote,
  mergeBodyHits,
  type GlobalSearchHit,
} from "@/lib/search/globalSearch";
import { scanInChunks, yieldToMain } from "@/lib/search/progressiveScan";
import { fetchSubjectBodyHits } from "@/lib/search/fetchSubjectBody";

const TITLE_LIMIT = 12;
const BODY_LIMIT = 16;

export function useProgressiveGlobalSearch(rawQuery: string, preferYear: AcademicYearId) {
  const query = rawQuery.trim();
  const titleIndex = useMemo(() => buildGlobalSearchIndex(contentTree), []);
  const chapterHits = useMemo(
    () => (query ? chapterHitsFromIndex(titleIndex, query, TITLE_LIMIT) : []),
    [query, titleIndex],
  );

  const notesById = useUserNotes((s) => s.byId);
  const notesOrder = useUserNotes((s) => s.order);
  const notesHydrated = useUserNotes((s) => s._hasHydrated);
  const cardsById = useReviewCards((s) => s.byId);
  const cardsOrder = useReviewCards((s) => s.order);
  const cardsHydrated = useReviewCards((s) => s._hasHydrated);

  const [noteHits, setNoteHits] = useState<GlobalSearchHit[]>([]);
  const [cardHits, setCardHits] = useState<GlobalSearchHit[]>([]);
  const [bodyHits, setBodyHits] = useState<GlobalSearchHit[]>([]);
  const [notesScanning, setNotesScanning] = useState(false);
  const [cardsScanning, setCardsScanning] = useState(false);
  const [bodyLoading, setBodyLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setNoteHits([]);
      setCardHits([]);
      setNotesScanning(false);
      setCardsScanning(false);
      return;
    }

    const ac = new AbortController();

    const notes = notesOrder.map((id) => notesById[id]).filter(Boolean);
    if (notesHydrated && notes.length === 0) {
      setNoteHits([]);
      setNotesScanning(false);
    } else if (notesHydrated) {
      setNotesScanning(true);
      void scanInChunks(notes, (note) => matchUserNote(note, query), { signal: ac.signal, onProgress: setNoteHits }).then(
        (hits) => {
          if (ac.signal.aborted) return;
          setNoteHits(hits);
          setNotesScanning(false);
        },
      );
    }

    const cards = cardsOrder.map((id) => cardsById[id]).filter(Boolean);
    if (cardsHydrated && cards.length === 0) {
      setCardHits([]);
      setCardsScanning(false);
    } else if (cardsHydrated) {
      setCardsScanning(true);
      void scanInChunks(cards, (card) => matchFlashcard(card, query), { signal: ac.signal, onProgress: setCardHits }).then(
        (hits) => {
          if (ac.signal.aborted) return;
          setCardHits(hits);
          setCardsScanning(false);
        },
      );
    }

    return () => ac.abort();
  }, [query, notesHydrated, notesById, notesOrder, cardsHydrated, cardsById, cardsOrder]);

  useEffect(() => {
    if (!query) {
      setBodyHits([]);
      setBodyLoading(false);
      return;
    }

    const ac = new AbortController();
    setBodyHits([]);
    setBodyLoading(true);
    const shards = listBodySearchShards(contentTree, preferYear);

    void (async () => {
      await yieldToMain();
      if (ac.signal.aborted) return;
      const acc: GlobalSearchHit[] = [];
      for (const subjectId of shards) {
        if (ac.signal.aborted) return;
        try {
          const hits = await fetchSubjectBodyHits(subjectId, query, ac.signal);
          if (ac.signal.aborted) return;
          acc.push(...hits);
          setBodyHits(acc.slice());
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
        await yieldToMain();
      }
      if (!ac.signal.aborted) setBodyLoading(false);
    })();

    return () => ac.abort();
  }, [query, preferYear]);

  const bodySectionHits = useMemo(
    () => mergeBodyHits(chapterHits, bodyHits, BODY_LIMIT),
    [chapterHits, bodyHits],
  );

  return {
    noteHits,
    cardHits,
    bodyHits: bodySectionHits,
    notesLoading: Boolean(query) && (!notesHydrated || notesScanning),
    cardsLoading: Boolean(query) && (!cardsHydrated || cardsScanning),
    bodyLoading: Boolean(query) && bodyLoading,
  };
}

"use client";

import { useSyncExternalStore } from "react";

const KEY = "mitchelturner_voter_key";

function createKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateKey(): string {
  let existing = localStorage.getItem(KEY);
  if (!existing) {
    existing = createKey();
    localStorage.setItem(KEY, existing);
  }
  return existing;
}

// No external mutations to subscribe to — the key is created once and stable.
function subscribe(): () => void {
  return () => {};
}

// Returns a stable per-browser identifier used to attribute anonymous votes.
// Uses useSyncExternalStore so it is SSR-safe (null on the server) and avoids
// synchronous setState inside an effect.
export function useVoterKey(): string | null {
  return useSyncExternalStore(
    subscribe,
    getOrCreateKey,
    () => null,
  );
}

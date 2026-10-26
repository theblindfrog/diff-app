import { useCallback, useEffect, useRef } from "react";
import { Flex, IconButton, Text, TextField, Tooltip } from "@radix-ui/themes";
import { useDiffStore } from "../store";
import { matchId, matchesFor, useDiffSearch } from "../diff/useDiffSearch";
import { scrollToMatch } from "../diff/searchDom";
import type { SearchMatch } from "../diff/search";

/**
 * Find-in-diff. Searches only what the diff shows: lines folded into a
 * collapsed "unmodified lines" region don't match until expanded.
 * ⌘F / Ctrl+F focuses; Enter / ⇧Enter (or ⌘G / ⇧⌘G) step through matches;
 * Esc clears.
 */
export function SearchBox() {
  const query = useDiffStore((s) => s.searchQuery);
  const caseSensitive = useDiffStore((s) => s.searchCaseSensitive);
  const layout = useDiffStore((s) => s.layout);
  const setQuery = useDiffStore((s) => s.setSearchQuery);
  const toggleCase = useDiffStore((s) => s.toggleSearchCaseSensitive);
  const setActiveId = useDiffStore((s) => s.setSearchActiveId);
  const { lines, matches, activeIndex } = useDiffSearch();
  const input = useRef<HTMLInputElement>(null);

  const goTo = useCallback(
    (m: SearchMatch | undefined) => {
      setActiveId(m ? matchId(m) : null);
      if (m) scrollToMatch(m, lines, layout);
    },
    [setActiveId, lines, layout],
  );

  // Re-run the search for new criteria and jump to the first hit, like a
  // browser's find bar.
  const research = (q: string, cs: boolean) => goTo(matchesFor(lines, q, cs, layout)[0]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const n = matches.length;
      if (n === 0) return;
      const from = activeIndex < 0 ? (dir === 1 ? -1 : 0) : activeIndex;
      goTo(matches[(from + dir + n) % n]);
    },
    [matches, activeIndex, goTo],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      } else if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault();
        step(e.shiftKey ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const status =
    query.length === 0
      ? ""
      : matches.length === 0
        ? "No results"
        : `${activeIndex >= 0 ? activeIndex + 1 : "–"}/${matches.length}`;
  const disabled = matches.length === 0;

  return (
    <Flex align="center" gap="1" role="search" aria-label="Find in diff">
      <TextField.Root
        ref={input}
        size="1"
        variant="surface"
        placeholder="Find in diff"
        aria-label="Find in diff"
        value={query}
        style={{ width: 170 }}
        onChange={(e) => {
          setQuery(e.target.value);
          research(e.target.value, caseSensitive);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            step(e.shiftKey ? -1 : 1);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setQuery("");
            setActiveId(null);
            e.currentTarget.blur();
          }
        }}
      >
        <TextField.Slot side="right">
          <Text
            size="1"
            color={query && disabled ? "red" : "gray"}
            style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
            aria-live="polite"
          >
            {status}
          </Text>
        </TextField.Slot>
      </TextField.Root>
      <Tooltip content="Match case">
        <IconButton
          size="1"
          variant={caseSensitive ? "solid" : "surface"}
          color={caseSensitive ? undefined : "gray"}
          aria-pressed={caseSensitive}
          aria-label="Match case"
          onClick={() => {
            toggleCase();
            research(query, !caseSensitive);
          }}
        >
          Aa
        </IconButton>
      </Tooltip>
      <Tooltip content="Previous match (⇧Enter / ⇧⌘G)">
        <IconButton
          size="1"
          variant="surface"
          color="gray"
          disabled={disabled}
          onClick={() => step(-1)}
          aria-label="Previous match"
        >
          ↑
        </IconButton>
      </Tooltip>
      <Tooltip content="Next match (Enter / ⌘G)">
        <IconButton
          size="1"
          variant="surface"
          color="gray"
          disabled={disabled}
          onClick={() => step(1)}
          aria-label="Next match"
        >
          ↓
        </IconButton>
      </Tooltip>
    </Flex>
  );
}

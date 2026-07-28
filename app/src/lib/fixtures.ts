/**
 * Fixture resolution for a competition, with an archive fallback.
 *
 * The TxLINE devnet feed rolls its fixture snapshot forward, so a finished
 * competition eventually disappears from `/api/fixtures/snapshot`. Score data
 * remains addressable by fixture id, so when the snapshot has nothing for the
 * World Cup we fall back to archived fixture records and keep pulling real
 * scores for them. Live data always wins when it is there.
 */
import { txlineGet } from "@/lib/txlineServer";
import { WORLD_CUP_COMPETITION_ID } from "@/lib/matchState";
import { WC_ARCHIVE_FIXTURES } from "@/data/wcArchive";
import type { FixtureRecord } from "@/lib/txlineTypes";

export type FixtureSource = "live" | "archive";

export interface ResolvedFixtures {
  fixtures: FixtureRecord[];
  source: FixtureSource;
}

/**
 * Fixtures for a competition. Falls back to the archived World Cup knockout run
 * when the live snapshot has aged the competition out.
 */
export async function resolveFixtures(competitionId: number): Promise<ResolvedFixtures> {
  let live: FixtureRecord[] = [];
  try {
    live = (await txlineGet<FixtureRecord[]>(
      `/api/fixtures/snapshot?competitionId=${competitionId}`
    )).filter((f) => f.CompetitionId === competitionId);
  } catch (e) {
    // A snapshot failure should not blank the board when we can serve the archive.
    if (competitionId !== WORLD_CUP_COMPETITION_ID) throw e;
  }

  if (live.length > 0) return { fixtures: live, source: "live" };
  if (competitionId === WORLD_CUP_COMPETITION_ID) {
    return { fixtures: WC_ARCHIVE_FIXTURES, source: "archive" };
  }
  return { fixtures: [], source: "live" };
}

/**
 * Cache window for a response. Archived fixtures are finished, so their scores
 * are immutable and can be cached hard; live fixtures need a short window.
 */
export function cacheFor(source: FixtureSource, liveMaxAge: number): string {
  return source === "archive"
    ? "s-maxage=300, stale-while-revalidate=600"
    : `s-maxage=${liveMaxAge}, stale-while-revalidate=${liveMaxAge * 2}`;
}

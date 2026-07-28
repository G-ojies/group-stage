/**
 * Archived World Cup fixture records, recovered from the TxLINE devnet feed.
 *
 * The devnet feed rolls its fixture snapshot forward: once a competition ends,
 * `/api/fixtures/snapshot?competitionId=72` stops returning World Cup fixtures
 * (as of 2026-07-28 it serves Friendlies only). Per-fixture score data is still
 * served by id, so these records let the app keep resolving real TxLINE scores
 * for the knockout run after the fixtures have aged out of the snapshot.
 *
 * These are verbatim TxLINE fixture records, pulled from
 * `/api/fixtures/updates/{epochDay}/{hourOfDay}` on 2026-07-28. Nothing is
 * synthesised: scores are still fetched live from TxLINE by fixture id.
 *
 * Used only as a fallback. Whenever the live snapshot returns World Cup
 * fixtures, the live data wins.
 */
import type { FixtureRecord } from "@/lib/txlineTypes";

export const WC_ARCHIVE_FIXTURES: FixtureRecord[] = [
  {"FixtureId": 18187298, "StartTime": 1783281600000, "Participant1": "Brazil", "Participant2": "Norway", "Participant1IsHome": true, "Participant1Id": 1634, "Participant2Id": 2661, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115574, "Ts": 1783454400000},
  {"FixtureId": 18192996, "StartTime": 1783299600000, "Participant1": "Mexico", "Participant2": "England", "Participant1IsHome": true, "Participant1Id": 2545, "Participant2Id": 1888, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115574, "Ts": 1783468800000},
  {"FixtureId": 18198205, "StartTime": 1783364400000, "Participant1": "Portugal", "Participant2": "Spain", "Participant1IsHome": true, "Participant1Id": 2802, "Participant2Id": 3021, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115574, "Ts": 1783447200000},
  {"FixtureId": 18193785, "StartTime": 1783382400000, "Participant1": "USA", "Participant2": "Belgium", "Participant1IsHome": true, "Participant1Id": 3220, "Participant2Id": 1575, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115574, "Ts": 1783468800000},
  {"FixtureId": 18202701, "StartTime": 1783440000000, "Participant1": "Argentina", "Participant2": "Egypt", "Participant1IsHome": true, "Participant1Id": 1489, "Participant2Id": 1867, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115574, "Ts": 1783443600000},
  {"FixtureId": 18202783, "StartTime": 1783454400000, "Participant1": "Switzerland", "Participant2": "Colombia", "Participant1IsHome": true, "Participant1Id": 3099, "Participant2Id": 1748, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115574, "Ts": 1783468800000},
  {"FixtureId": 18209181, "StartTime": 1783627200000, "Participant1": "France", "Participant2": "Morocco", "Participant1IsHome": true, "Participant1Id": 1999, "Participant2Id": 2530, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115675, "Ts": 1783641600000},
  {"FixtureId": 18218149, "StartTime": 1783710000000, "Participant1": "Spain", "Participant2": "Belgium", "Participant1IsHome": true, "Participant1Id": 3021, "Participant2Id": 1575, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115675, "Ts": 1783778400000},
  {"FixtureId": 18213979, "StartTime": 1783803600000, "Participant1": "Norway", "Participant2": "England", "Participant1IsHome": true, "Participant1Id": 2661, "Participant2Id": 1888, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115675, "Ts": 1783818000000},
  {"FixtureId": 18222446, "StartTime": 1783818000000, "Participant1": "Argentina", "Participant2": "Switzerland", "Participant1IsHome": true, "Participant1Id": 1489, "Participant2Id": 3099, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115675, "Ts": 1783767600000},
  {"FixtureId": 18237038, "StartTime": 1784055600000, "Participant1": "France", "Participant2": "Spain", "Participant1IsHome": true, "Participant1Id": 1999, "Participant2Id": 3021, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115573, "Ts": 1784070000000},
  {"FixtureId": 18241006, "StartTime": 1784142000000, "Participant1": "England", "Participant2": "Argentina", "Participant1IsHome": true, "Participant1Id": 1888, "Participant2Id": 1489, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115573, "Ts": 1784156400000},
  {"FixtureId": 18257865, "StartTime": 1784408400000, "Participant1": "France", "Participant2": "England", "Participant1IsHome": true, "Participant1Id": 1999, "Participant2Id": 1888, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115771, "Ts": 1784422800000},
  {"FixtureId": 18257739, "StartTime": 1784487900000, "Participant1": "Spain", "Participant2": "Argentina", "Participant1IsHome": true, "Participant1Id": 3021, "Participant2Id": 1489, "Competition": "World Cup", "CompetitionId": 72, "FixtureGroupId": 10115676, "Ts": 1784487600000},
];

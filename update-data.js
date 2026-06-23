#!/usr/bin/env node

// WinCharlie Data Scraper
// Run weekly: node update-data.js
// Fetches league-wide rankings from footywire, merges with player pool

import { writeFileSync } from "fs";

const BASE = "https://www.footywire.com/afl/footy";
const YEAR = new Date().getFullYear();
const DELAY_MS = 600;

// Top 100 by AFL Player Rating Points — update this list when the pool changes
// Format: [name, position, ratingRank, ratingPoints]
const POOL_RAW = [
  ["Marcus Bontempelli", "MID", 1, 680.7],
  ["Ed Richards", "MID", 2, 641.2],
  ["Tristan Xerri", "RUC", 3, 636.4],
  ["Isaac Heeney", "MID", 4, 603.8],
  ["Max Gawn", "RUC", 5, 599.2],
  ["Nasiah Wanganeen-Milera", "MID", 6, 573.7],
  ["Zak Butters", "MID", 7, 572.4],
  ["Noah Anderson", "MID", 8, 569.4],
  ["Caleb Serong", "MID", 9, 567.7],
  ["Luke Jackson", "RUC", 10, 561.8],
  ["Reilly O'Brien", "RUC", 101, 365.0],
  ["Nick Daicos", "MID", 12, 549.1],
  ["Matt Rowell", "MID", 13, 543.0],
  ["Bailey Smith", "MID", 14, 539.9],
  ["Max Holmes", "MID", 15, 539.8],
  ["Brodie Grundy", "RUC", 16, 537.2],
  ["Kysaiah Pickett", "MID", 17, 533.0],
  ["Jordan Dawson", "MID", 18, 527.4],
  ["Christian Petracca", "MID", 19, 521.1],
  ["Chad Warner", "FWD", 20, 516.2],
  ["Finn Callaghan", "MID", 21, 509.2],
  ["Lachie Neale", "MID", 22, 506.0],
  ["Nick Blakey", "DEF", 23, 503.7],
  ["Touk Miller", "FWD", 24, 502.1],
  ["Tom Liberatore", "MID", 25, 499.6],
  ["Luke Davies-Uniacke", "MID", 26, 498.7],
  ["Hugh McCluggage", "MID", 27, 493.2],
  ["Zach Merrett", "MID", 28, 491.1],
  ["Andrew Brayshaw", "MID", 29, 487.0],
  ["Jack Sinclair", "DEF", 30, 480.9],
  ["Bailey Dale", "DEF", 31, 475.7],
  ["Darcy Cameron", "RUC", 32, 468.3],
  ["Jai Newcombe", "MID", 33, 467.6],
  ["Jack Crisp", "MID", 34, 462.3],
  ["Patrick Cripps", "MID", 35, 460.5],
  ["George Hewett", "MID", 36, 459.5],
  ["Izak Rankine", "FWD", 37, 453.2],
  ["Sam Walsh", "MID", 38, 442.2],
  ["Max Hall", "FWD", 39, 441.9],
  ["Sam Durham", "MID", 40, 440.2],
  ["Riley Thilthorpe", "KEYF", 41, 436.8],
  ["Tom Atkins", "MID", 42, 436.4],
  ["Tim Taranto", "MID", 43, 435.3],
  ["Toby Nankervis", "RUC", 44, 433.6],
  ["Jarrod Witts", "RUC", 45, 432.7],
  ["Zac Bailey", "FWD", 46, 432.5],
  ["Jeremy Cameron", "KEYF", 47, 431.7],
  ["Tim English", "RUC", 48, 430.4],
  ["Dayne Zorko", "DEF", 49, 429.6],
  ["Shaun Mannagh", "FWD", 50, 423.1],
  ["Shai Bolton", "MID", 51, 422.3],
  ["Lachie Ash", "DEF", 52, 421.9],
  ["Nick Watson", "FWD", 53, 421.5],
  ["Matthew Kennedy", "MID", 54, 418.1],
  ["Will Ashcroft", "MID", 55, 416.9],
  ["Joel Freijah", "FWD", 56, 415.6],
  ["Kieren Briggs", "RUC", 57, 415.2],
  ["Harris Andrews", "KEYD", 58, 414.9],
  ["Kade Chandler", "FWD", 59, 413.8],
  ["Gryan Miers", "FWD", 60, 413.3],
  ["Jason Horne-Francis", "MID", 61, 412.5],
  ["Jack Steele", "MID", 62, 411.8],
  ["Darcy Wilmot", "DEF", 63, 411.6],
  ["Rowan Marshall", "RUC", 64, 411.5],
  ["Josh Dunkley", "MID", 65, 409.9],
  ["Scott Pendlebury", "MID", 66, 405.4],
  ["Jy Simpkin", "MID", 67, 401.5],
  ["Errol Gulden", "FWD", 68, 400.2],
  ["Josh Treacy", "KEYF", 69, 397.9],
  ["Sam Darcy", "KEYF", 70, 395.2],
  ["Connor Rozee", "MID", 71, 394.8],
  ["Clayton Oliver", "MID", 72, 391.5],
  ["Harry Sheezel", "MID", 73, 388.1],
  ["Darcy Moore", "KEYD", 74, 387.2],
  ["Luke Parker", "DEF", 75, 387.1],
  ["Lloyd Meek", "RUC", 76, 385.8],
  ["Trent Rivers", "DEF", 77, 384.8],
  ["Callum Wilkie", "KEYD", 78, 384.6],
  ["Toby Greene", "FWD", 79, 384.2],
  ["Jack Macrae", "MID", 80, 383.8],
  ["Dylan Moore", "FWD", 81, 383.1],
  ["Sam Collins", "KEYD", 82, 382.3],
  ["Jack Gunston", "KEYF", 83, 382.0],
  ["Oliver Dempsey", "MID", 84, 381.2],
  ["Bodhi Uwland", "DEF", 85, 379.4],
  ["Josh Daicos", "DEF", 86, 377.7],
  ["Adam Saad", "DEF", 87, 376.6],
  ["Dan Houston", "DEF", 88, 375.9],
  ["Steele Sidebottom", "MID", 89, 375.3],
  ["Cam Rayner", "FWD", 90, 374.5],
  ["James Rowbottom", "FWD", 91, 374.4],
  ["Josh Ward", "MID", 92, 373.9],
  ["Liam Baker", "DEF", 93, 372.2],
  ["Jack Buckley", "KEYD", 94, 371.9],
  ["Jordan Clark", "DEF", 95, 370.8],
  ["Willem Drew", "MID", 96, 370.2],
  ["Josh Weddle", "DEF", 97, 369.4],
  ["Justin McInerney", "MID", 98, 368.1],
  ["Jack Ross", "MID", 99, 367.1],
  ["Patrick Dangerfield", "FWD", 100, 366.6],
];

// Some names differ between AFL.com.au and footywire
const SLUG_ALIASES = {
  "zach-merrett": "zachary-merrett",
  "lachie-ash": "lachlan-ash",
  "cam-rayner": "cameron-rayner",
  "tom-liberatore": "thomas-liberatore",
  "tim-english": "timothy-english",
  "matthew-kennedy": "matthew-kennedy-1",
  "jack-macrae": "jackson-macrae",
  "sam-collins": "samuel-collins",
  "oliver-dempsey": "ollie-dempsey",
  "josh-weddle": "joshua-weddle",
  "reilly-obrien": "reilly-o-brien",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function extractCells(rowHtml) {
  const cells = [];
  const re = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = re.exec(rowHtml)) !== null) {
    cells.push(m[1].replace(/<[^>]+>/g, "").trim());
  }
  return cells;
}

function extractPlayerInfo(rowHtml) {
  const match = rowHtml.match(/href="(?:pp|pr)-([^"]+)--([^"]+)"/);
  if (!match) return null;
  return { teamSlug: match[1], nameSlug: match[2] };
}

function getRows(html) {
  return html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
}

const TEAM_DISPLAY = {
  "western-bulldogs": "Bulldogs",
  "collingwood-magpies": "Magpies",
  "geelong-cats": "Cats",
  "sydney-swans": "Swans",
  "melbourne-demons": "Demons",
  "st-kilda-saints": "Saints",
  "port-adelaide-power": "Power",
  "gold-coast-suns": "Suns",
  "fremantle-dockers": "Dockers",
  "greater-western-sydney-giants": "Giants",
  "gws-giants": "Giants",
  "north-melbourne-kangaroos": "Kangaroos",
  "north-melbourne": "Kangaroos",
  "brisbane-lions": "Lions",
  "essendon-bombers": "Bombers",
  "hawthorn-hawks": "Hawks",
  "carlton-blues": "Blues",
  "richmond-tigers": "Tigers",
  "adelaide-crows": "Crows",
  "west-coast-eagles": "Eagles",
};

function teamDisplayName(teamSlug) {
  const fallback = teamSlug.split("-").pop();
  return TEAM_DISPLAY[teamSlug] || fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

// Scrape a league-wide ranking page (returns all 600+ players)
function parseRankingPage(html) {
  const data = new Map();
  let rank = 0;
  let lastValue = null;
  let count = 0;

  for (const row of getRows(html)) {
    const info = extractPlayerInfo(row);
    if (!info) continue;

    const cells = extractCells(row);
    if (cells.length < 3) continue;

    const value = parseFloat(cells[cells.length - 1]?.replace(/,/g, "")) || 0;
    count++;
    if (value !== lastValue) {
      rank = count;
      lastValue = value;
    }

    data.set(info.nameSlug, {
      rank,
      value,
      teamSlug: info.teamSlug,
    });
  }
  return data;
}

function parseGoalKickersPage(html) {
  const data = new Map();
  let rank = 0;
  let lastValue = null;
  let count = 0;

  for (const row of getRows(html)) {
    const info = extractPlayerInfo(row);
    if (!info) continue;

    const cells = extractCells(row);
    if (cells.length < 4) continue;

    // Goal kickers page: cells[3] is total goals (not last cell)
    const value = parseFloat(cells[3]?.replace(/,/g, "")) || 0;
    count++;
    if (value !== lastValue) {
      rank = count;
      lastValue = value;
    }

    data.set(info.nameSlug, {
      rank,
      value,
      teamSlug: info.teamSlug,
    });
  }
  return data;
}

async function scrapeRankingPage(url, label) {
  console.log(`Fetching ${label}...`);
  const html = await fetchHTML(url);
  const data = parseRankingPage(html);
  console.log(`  Found ${data.size} players`);
  return data;
}

async function scrapeFantasyRankings() {
  console.log("Fetching fantasy points...");
  const html = await fetchHTML(`${BASE}/dream_team_season`);
  const entries = [];

  for (const row of getRows(html)) {
    const info = extractPlayerInfo(row);
    if (!info) continue;
    const cells = extractCells(row);
    if (cells.length < 6) continue;
    const total = parseInt(cells[5]?.replace(/,/g, "")) || 0;
    entries.push({ nameSlug: info.nameSlug, teamSlug: info.teamSlug, total });
  }

  // Re-rank by total (descending)
  entries.sort((a, b) => b.total - a.total);
  const data = new Map();
  let rank = 0;
  let lastVal = null;
  entries.forEach((e, i) => {
    if (e.total !== lastVal) {
      rank = i + 1;
      lastVal = e.total;
    }
    data.set(e.nameSlug, { rank, value: e.total, teamSlug: e.teamSlug });
  });

  console.log(`  Found ${data.size} players (ranked by total)`);
  return data;
}

async function scrapeDisposalEfficiency(players) {
  console.log(`Fetching DE% from ${players.length} profiles...`);
  const deValues = [];

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.profileSlug) {
      deValues.push({ nameSlug: p.slug, de: null });
      continue;
    }

    const url = `${BASE}/pp-${p.profileSlug}?advv=Y`;
    try {
      const html = await fetchHTML(url);
      const deIdx = html.indexOf("DE%");
      if (deIdx === -1) {
        deValues.push({ nameSlug: p.slug, de: null });
        continue;
      }

      const tableStart = html.lastIndexOf("<table", deIdx);
      const tableEnd = html.indexOf("</table>", deIdx);
      const tableHtml = html.substring(tableStart, tableEnd);

      const headerRow = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/i);
      if (!headerRow) {
        deValues.push({ nameSlug: p.slug, de: null });
        continue;
      }

      const headers = [];
      const thRe = /<th[^>]*>([\s\S]*?)<\/th>/gi;
      let hm;
      while ((hm = thRe.exec(headerRow[0])) !== null) {
        headers.push(hm[1].replace(/<[^>]+>/g, "").trim());
      }

      const deColIdx = headers.indexOf("DE%");
      if (deColIdx === -1) {
        deValues.push({ nameSlug: p.slug, de: null });
        continue;
      }

      const totalRow = tableHtml.match(
        /<tr[^>]*>[\s\S]*?Total[\s\S]*?<\/tr>/i
      );
      if (!totalRow) {
        deValues.push({ nameSlug: p.slug, de: null });
        continue;
      }

      const val = parseFloat(extractCells(totalRow[0])[deColIdx]);
      deValues.push({ nameSlug: p.slug, de: isNaN(val) ? null : val });
    } catch (e) {
      deValues.push({ nameSlug: p.slug, de: null });
    }

    if ((i + 1) % 20 === 0)
      console.log(`  Processed ${i + 1}/${players.length}`);
    await sleep(DELAY_MS);
  }

  // Rank by DE% descending (higher = better)
  const withDE = deValues.filter((e) => e.de !== null);
  withDE.sort((a, b) => b.de - a.de);

  const rankings = new Map();
  let rank = 0;
  let lastVal = null;
  withDE.forEach((e, i) => {
    if (e.de !== lastVal) {
      rank = i + 1;
      lastVal = e.de;
    }
    rankings.set(e.nameSlug, { rank, value: e.de });
  });

  console.log(`  Got DE% for ${withDE.length} players`);
  return rankings;
}

async function main() {
  console.log(`\n=== WinCharlie Data Update (${YEAR}) ===\n`);

  // Fetch all ranking pages
  const [disposals, marks, tackles, goals, fantasy] = await Promise.all([
    scrapeRankingPage(
      `${BASE}/ft_player_rankings?year=${YEAR}&rt=LT&st=DI`,
      "disposals"
    ),
    sleep(200).then(() =>
      scrapeRankingPage(
        `${BASE}/ft_player_rankings?year=${YEAR}&rt=LT&st=MA`,
        "marks"
      )
    ),
    sleep(400).then(() =>
      scrapeRankingPage(
        `${BASE}/ft_player_rankings?year=${YEAR}&rt=LT&st=TA`,
        "tackles"
      )
    ),
    sleep(600).then(() =>
      sleep(600).then(async () => {
        console.log("Fetching goals...");
        const html = await fetchHTML(`${BASE}/ft_goal_kickers`);
        const data = parseGoalKickersPage(html);
        console.log(`  Found ${data.size} players`);
        return data;
      })
    ),
    sleep(800).then(() => scrapeFantasyRankings()),
  ]);

  // Build master lookup: nameSlug -> { teamSlug, ranks }
  const masterLookup = new Map();
  for (const [slug, data] of disposals) {
    if (!masterLookup.has(slug))
      masterLookup.set(slug, { teamSlug: data.teamSlug });
    masterLookup.get(slug).disposals = data;
  }
  for (const [slug, data] of marks) {
    if (!masterLookup.has(slug))
      masterLookup.set(slug, { teamSlug: data.teamSlug });
    masterLookup.get(slug).marks = data;
  }
  for (const [slug, data] of tackles) {
    if (!masterLookup.has(slug))
      masterLookup.set(slug, { teamSlug: data.teamSlug });
    masterLookup.get(slug).tackles = data;
  }
  for (const [slug, data] of goals) {
    if (!masterLookup.has(slug))
      masterLookup.set(slug, { teamSlug: data.teamSlug });
    masterLookup.get(slug).goals = data;
  }
  for (const [slug, data] of fantasy) {
    if (!masterLookup.has(slug))
      masterLookup.set(slug, { teamSlug: data.teamSlug });
    masterLookup.get(slug).fantasy = data;
  }

  // Match pool players to footywire data
  const poolPlayers = POOL_RAW.map(([name, pos, ratingRank, ratingPts]) => {
    let slug = nameToSlug(name);
    const alias = SLUG_ALIASES[slug];

    const lookup = masterLookup.get(slug) || (alias && masterLookup.get(alias));
    const resolvedSlug = lookup
      ? slug
      : alias && masterLookup.has(alias)
        ? alias
        : slug;
    const teamSlug = lookup?.teamSlug || null;

    return {
      name,
      pos,
      ratingRank,
      ratingPts,
      slug: resolvedSlug,
      profileSlug: teamSlug ? `${teamSlug}--${resolvedSlug}` : null,
      teamSlug,
      lookup: lookup || null,
    };
  });

  const matched = poolPlayers.filter((p) => p.lookup);
  console.log(
    `\nMatched ${matched.length}/${poolPlayers.length} players to footywire`
  );
  const unmatched = poolPlayers.filter((p) => !p.lookup);
  if (unmatched.length > 0) {
    console.log(
      "  Unmatched:",
      unmatched.map((p) => p.name).join(", ")
    );
  }

  // Fetch DE%
  await sleep(DELAY_MS);
  const deRankings = await scrapeDisposalEfficiency(poolPlayers);

  // Build output
  const cap = (data) => (!data || data.rank > 100 ? "100+" : data.rank);
  const statVal = (data) => (data ? data.value : 0);

  const gameData = poolPlayers.map((p) => {
    const l = p.lookup || {};
    const de = deRankings.get(p.slug);

    return {
      name: p.name,
      team: p.teamSlug ? teamDisplayName(p.teamSlug) : p.pos,
      position: p.pos,
      ratingRank: p.ratingRank,
      ratingPoints: p.ratingPts,
      rankings: {
        fantasyPoints: cap(l.fantasy),
        goals: cap(l.goals),
        disposals: cap(l.disposals),
        marks: cap(l.marks),
        tackles: cap(l.tackles),
        disposalEfficiency: cap(de),
      },
      stats: {
        fantasyPoints: statVal(l.fantasy),
        goals: statVal(l.goals),
        disposals: statVal(l.disposals),
        marks: statVal(l.marks),
        tackles: statVal(l.tackles),
        disposalEfficiency: de ? de.value : null,
      },
    };
  });

  const output = {
    lastUpdated: new Date().toISOString(),
    season: YEAR,
    playerCount: gameData.length,
    players: gameData,
  };

  writeFileSync(
    new URL("./data.json", import.meta.url),
    JSON.stringify(output, null, 2)
  );
  console.log(`\nDone! Wrote data.json with ${gameData.length} players`);

  const sample = gameData[0];
  console.log(`\nSample — ${sample.name} (${sample.team}):`);
  Object.entries(sample.rankings).forEach(([k, v]) => {
    console.log(`  ${k}: #${v} (${sample.stats[k]})`);
  });
}

main().catch((e) => {
  console.error("Scraper failed:", e);
  process.exit(1);
});

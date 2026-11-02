// Pulls everything the cards need from the GitHub GraphQL API in one query.

const QUERY = `
query($login: String!) {
  user(login: $login) {
    login name bio location createdAt
    followers { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, REPOSITORY]) { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name description stargazerCount forkCount pushedAt isArchived
        primaryLanguage { name color }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { name description stargazerCount forkCount pushedAt primaryLanguage { name color } } }
    }
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

export async function fetchProfile(login, token, cfg = {}) {
  if (!token) throw new Error('No token: set GITHUB_TOKEN (or SKINS_TOKEN for private contributions).');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-skins' },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const u = json.data.user;
  if (!u) throw new Error(`User ${login} not found`);

  const repos = u.repositories.nodes;
  const excludeRepos = new Set((cfg.excludeRepos || []).map((s) => s.toLowerCase()));
  const excludeLangs = new Set((cfg.excludeLanguages || []).map((s) => s.toLowerCase()));

  // Language bytes across owned public repos.
  const langMap = new Map();
  for (const r of repos) {
    if (excludeRepos.has(r.name.toLowerCase())) continue;
    for (const e of r.languages.edges) {
      if (excludeLangs.has(e.node.name.toLowerCase())) continue;
      const cur = langMap.get(e.node.name) || { name: e.node.name, color: e.node.color, size: 0 };
      cur.size += e.size;
      langMap.set(e.node.name, cur);
    }
  }
  const languages = [...langMap.values()].sort((a, b) => b.size - a.size);

  // Contribution calendar → weekly totals + streaks.
  const cal = u.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const weeks = cal.weeks.map((w) => ({
    start: w.contributionDays[0].date,
    count: w.contributionDays.reduce((a, d) => a + d.contributionCount, 0),
  }));
  const { current, longest, active } = streaks(days);

  const toRepo = (r) => ({
    name: r.name,
    description: r.description,
    stars: r.stargazerCount,
    forks: r.forkCount,
    language: r.primaryLanguage?.name,
    languageColor: r.primaryLanguage?.color,
    updated: r.pushedAt,
  });

  let pins;
  if (cfg.pins?.length) {
    pins = cfg.pins.map((n) => repos.find((r) => r.name.toLowerCase() === n.toLowerCase())).filter(Boolean).map(toRepo);
    const want = cfg.maxPins ?? 2;
    if (pins.length < want) {
      const have = new Set(pins.map((p) => p.name));
      pins.push(...[...repos].filter((r) => !r.isArchived && !have.has(r.name)).sort((a, b) => b.stargazerCount - a.stargazerCount).slice(0, want - pins.length).map(toRepo));
    }
  } else if (u.pinnedItems.nodes.length) {
    pins = u.pinnedItems.nodes.map(toRepo);
  } else {
    pins = [...repos].filter((r) => !r.isArchived).sort((a, b) => b.stargazerCount - a.stargazerCount).slice(0, 2).map(toRepo);
  }

  return {
    login: u.login,
    name: u.name,
    bio: u.bio,
    location: u.location,
    createdAt: u.createdAt,
    stats: {
      stars: repos.reduce((a, r) => a + r.stargazerCount, 0),
      repos: u.repositories.totalCount,
      followers: u.followers.totalCount,
      commits: u.contributionsCollection.totalCommitContributions + (cfg.includePrivate ? u.contributionsCollection.restrictedContributionsCount : 0),
      prs: u.pullRequests.totalCount,
      issues: u.issues.totalCount,
      contributedTo: u.repositoriesContributedTo.totalCount,
      totalContributions: cal.totalContributions,
      activeDays: active,
      currentStreak: current,
      longestStreak: longest,
    },
    languages,
    weeks,
    pins,
  };
}

export function streaks(days) {
  let longest = 0, run = 0, active = 0;
  for (const d of days) {
    if (d.contributionCount > 0) { run++; active++; longest = Math.max(longest, run); }
    else run = 0;
  }
  // Current streak: today may still be empty without breaking the streak.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++;
    else if (i === days.length - 1) continue;
    else break;
  }
  return { current, longest, active };
}

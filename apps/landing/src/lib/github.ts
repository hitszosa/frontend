const GITHUB_ORG_MEMBERS_URL =
  'https://api.github.com/orgs/hitszosa/members?per_page=100';

const githubHeaders = () => {
  const headers = new Headers({
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'hitszosa-landing',
  });
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

export interface GithubOrgMember {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface GithubRepositoryStats {
  fullName: string;
  stars: number;
  updatedAt: Date;
}

let membersPromise: Promise<GithubOrgMember[]> | undefined;
const repositoryPromises = new Map<
  string,
  Promise<GithubRepositoryStats | null>
>();

export function getGithubOrgMembers(): Promise<GithubOrgMember[]> {
  membersPromise ??= fetch(GITHUB_ORG_MEMBERS_URL, {
    headers: githubHeaders(),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch HITSZ OSA GitHub members: ${response.status} ${response.statusText}`,
      );
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error('GitHub returned an invalid organization member list');
    }

    return payload.map((member, index) => {
      if (
        typeof member !== 'object' ||
        member === null ||
        typeof member.login !== 'string' ||
        typeof member.avatar_url !== 'string' ||
        typeof member.html_url !== 'string'
      ) {
        throw new Error(`GitHub returned an invalid member at index ${index}`);
      }

      return {
        login: member.login,
        avatarUrl: member.avatar_url,
        profileUrl: member.html_url,
      };
    });
  });

  return membersPromise;
}

export function getGithubRepositoryStats(
  href: string,
): Promise<GithubRepositoryStats | null> {
  const url = new URL(href);
  if (url.hostname !== 'github.com') return Promise.resolve(null);

  const [owner, repositoryWithSuffix] = url.pathname.split('/').filter(Boolean);
  const repository = repositoryWithSuffix?.replace(/\.git$/, '');
  if (!owner || !repository) return Promise.resolve(null);

  const key = `${owner}/${repository}`.toLowerCase();
  const cached = repositoryPromises.get(key);
  if (cached) return cached;

  const request = fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
    {
      headers: githubHeaders(),
    },
  ).then(async (response) => {
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub repository ${owner}/${repository}: ${response.status} ${response.statusText}`,
      );
    }

    const payload: unknown = await response.json();
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('full_name' in payload) ||
      typeof payload.full_name !== 'string' ||
      !('stargazers_count' in payload) ||
      typeof payload.stargazers_count !== 'number' ||
      !('updated_at' in payload) ||
      typeof payload.updated_at !== 'string'
    ) {
      throw new Error(
        `GitHub returned invalid repository data for ${owner}/${repository}`,
      );
    }

    return {
      fullName: payload.full_name,
      stars: payload.stargazers_count,
      updatedAt: new Date(payload.updated_at),
    };
  });

  repositoryPromises.set(key, request);
  return request;
}

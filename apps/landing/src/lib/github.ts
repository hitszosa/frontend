import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GITHUB_ORG_MEMBERS_URL =
  'https://api.github.com/orgs/hitszosa/members?per_page=100';
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_DIRECTORY = path.join(process.cwd(), '.cache', 'github');
const FORCE_CACHE_REFRESH = process.env.GITHUB_CACHE_REFRESH === 'true';

interface CacheEntry<T> {
  version: typeof CACHE_VERSION;
  fetchedAt: string;
  etag?: string;
  data: T;
}

const githubHeaders = (etag?: string) => {
  const headers = new Headers({
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'hitszosa-landing',
  });
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (etag) headers.set('If-None-Match', etag);
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

interface CachedRepositoryStats {
  fullName: string;
  stars: number;
  updatedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isGithubOrgMember = (value: unknown): value is GithubOrgMember =>
  isRecord(value) &&
  typeof value.login === 'string' &&
  typeof value.avatarUrl === 'string' &&
  typeof value.profileUrl === 'string';

const isCachedRepositoryStats = (
  value: unknown,
): value is CachedRepositoryStats =>
  isRecord(value) &&
  typeof value.fullName === 'string' &&
  typeof value.stars === 'number' &&
  typeof value.updatedAt === 'string' &&
  !Number.isNaN(Date.parse(value.updatedAt));

const readCache = async <T>(
  filename: string,
  validate: (value: unknown) => value is T,
): Promise<CacheEntry<T> | undefined> => {
  try {
    const value: unknown = JSON.parse(await readFile(filename, 'utf8'));
    if (
      !isRecord(value) ||
      value.version !== CACHE_VERSION ||
      typeof value.fetchedAt !== 'string' ||
      Number.isNaN(Date.parse(value.fetchedAt)) ||
      (value.etag !== undefined && typeof value.etag !== 'string') ||
      !validate(value.data)
    ) {
      return undefined;
    }
    return value as unknown as CacheEntry<T>;
  } catch (error) {
    if (
      isRecord(error) &&
      (error.code === 'ENOENT' || error.name === 'SyntaxError')
    ) {
      return undefined;
    }
    console.warn(`Unable to read GitHub cache ${filename}`, error);
    return undefined;
  }
};

const writeCache = async <T>(
  filename: string,
  entry: CacheEntry<T>,
): Promise<void> => {
  const temporaryFilename = `${filename}.${process.pid}.tmp`;
  try {
    await mkdir(CACHE_DIRECTORY, { recursive: true });
    await writeFile(temporaryFilename, `${JSON.stringify(entry)}\n`, 'utf8');
    await rename(temporaryFilename, filename);
  } catch (error) {
    console.warn(`Unable to write GitHub cache ${filename}`, error);
  }
};

const isFresh = (entry: CacheEntry<unknown>): boolean =>
  !FORCE_CACHE_REFRESH &&
  Date.now() - Date.parse(entry.fetchedAt) < CACHE_TTL_MS;

const refreshTimestamp = <T>(entry: CacheEntry<T>): CacheEntry<T> => ({
  ...entry,
  fetchedAt: new Date().toISOString(),
});

let membersPromise: Promise<GithubOrgMember[]> | undefined;
const repositoryPromises = new Map<
  string,
  Promise<GithubRepositoryStats | null>
>();

const fetchGithubOrgMembers = async (): Promise<GithubOrgMember[]> => {
  const cacheFilename = path.join(CACHE_DIRECTORY, 'members.json');
  const cache = await readCache(
    cacheFilename,
    (value): value is GithubOrgMember[] =>
      Array.isArray(value) && value.every(isGithubOrgMember),
  );
  if (cache && isFresh(cache)) return cache.data;

  try {
    const response = await fetch(GITHUB_ORG_MEMBERS_URL, {
      headers: githubHeaders(cache?.etag),
    });
    if (response.status === 304 && cache) {
      await writeCache(cacheFilename, refreshTimestamp(cache));
      return cache.data;
    }
    if (!response.ok) {
      throw new Error(
        `Failed to fetch HITSZ OSA GitHub members: ${response.status} ${response.statusText}`,
      );
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error('GitHub returned an invalid organization member list');
    }
    const members = payload.map((member, index) => {
      if (
        !isRecord(member) ||
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
    await writeCache(cacheFilename, {
      version: CACHE_VERSION,
      fetchedAt: new Date().toISOString(),
      etag: response.headers.get('etag') ?? undefined,
      data: members,
    });
    return members;
  } catch (error) {
    if (cache) {
      console.warn('Using stale GitHub organization member cache', error);
      return cache.data;
    }
    throw error;
  }
};

export function getGithubOrgMembers(): Promise<GithubOrgMember[]> {
  membersPromise ??= fetchGithubOrgMembers();
  return membersPromise;
}

const fetchGithubRepositoryStats = async (
  owner: string,
  repository: string,
  key: string,
): Promise<GithubRepositoryStats | null> => {
  const cacheFilename = path.join(
    CACHE_DIRECTORY,
    `repository-${encodeURIComponent(key)}.json`,
  );
  const cache = await readCache(cacheFilename, isCachedRepositoryStats);
  if (cache && isFresh(cache)) {
    return { ...cache.data, updatedAt: new Date(cache.data.updatedAt) };
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
      { headers: githubHeaders(cache?.etag) },
    );
    if (response.status === 304 && cache) {
      await writeCache(cacheFilename, refreshTimestamp(cache));
      return { ...cache.data, updatedAt: new Date(cache.data.updatedAt) };
    }
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub repository ${owner}/${repository}: ${response.status} ${response.statusText}`,
      );
    }

    const payload: unknown = await response.json();
    if (
      !isRecord(payload) ||
      typeof payload.full_name !== 'string' ||
      typeof payload.stargazers_count !== 'number' ||
      typeof payload.updated_at !== 'string'
    ) {
      throw new Error(
        `GitHub returned invalid repository data for ${owner}/${repository}`,
      );
    }
    const data: CachedRepositoryStats = {
      fullName: payload.full_name,
      stars: payload.stargazers_count,
      updatedAt: payload.updated_at,
    };
    await writeCache(cacheFilename, {
      version: CACHE_VERSION,
      fetchedAt: new Date().toISOString(),
      etag: response.headers.get('etag') ?? undefined,
      data,
    });
    return { ...data, updatedAt: new Date(data.updatedAt) };
  } catch (error) {
    if (cache) {
      console.warn(`Using stale GitHub repository cache for ${key}`, error);
      return { ...cache.data, updatedAt: new Date(cache.data.updatedAt) };
    }
    throw error;
  }
};

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

  const request = fetchGithubRepositoryStats(owner, repository, key);
  repositoryPromises.set(key, request);
  return request;
}

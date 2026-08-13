
export const GITHUB_OWNER = "ZohaibStackNinja";
export const GITHUB_REPO = "AZM-School-Pro";
export const GITHUB_BRANCH = "main";
 
export const RATE_LIMIT_DELAY_MS = 21_000;
 
export const MAX_CONSECUTIVE_FAILURES = 5;
 
 
export function shouldIncludeFile(path: string): boolean {
  if (!path.startsWith("docs/chatbot-knowledge-base/")) {
    return false;
  }
  return true;
}
 
export function stripFrontmatter(content: string): string {
  const match = /^---\n[\s\S]*?\n---\n?/.exec(content);
  return match ? content.slice(match[0].length) : content;
}
 
export type GithubDocMetadata = {
  source: "github-sync";
  path: string;
  uploadBy: string;
};
 
function requireGithubToken(): string {
  const token = process.env.GITHUB_DOCS_TOKEN;
 
  if (!token) {
    throw new Error(
      "GITHUB_DOCS_TOKEN is not configured. Set it with `npx convex env set GITHUB_DOCS_TOKEN <token>`."
    );
  }
 
  return token;
}
 
// Lists every file in the repo so the sync can pick out the ones to embed.
export async function fetchGithubTree(): Promise<{ path: string; type: string }[]> {
  const token = requireGithubToken();
 
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
 
  if (!res.ok) {
    throw new Error(
      `Failed to list repo tree: ${res.status} ${await res.text()}`
    );
  }
 
  const data = (await res.json()) as { tree: { path: string; type: string }[] };
  return data.tree;
}
 
// Fetches a single file's raw text content from the repo.
export async function fetchGithubFileContent(path: string): Promise<string> {
  const token = requireGithubToken();
 
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw",
      },
    }
  );
 
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${await res.text()}`);
  }
 
  return res.text();
}
 
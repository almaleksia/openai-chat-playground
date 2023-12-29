import { Octokit } from "octokit";
import { Endpoints } from "@octokit/types";
const auth = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth });
const CREATE_ISSUE_ENDPOINT = "POST /repos/{owner}/{repo}/issues";
const CREATE_ISSUE_COMMENT_ENDPOINT =
  "POST /repos/{owner}/{repo}/issues/{issue_number}/comments";
const UPDATE_ISSUE_ENDPOINT =
  "PATCH /repos/{owner}/{repo}/issues/{issue_number}";
export async function githubApiRequest<T>(
  endpoint: string,
  parameters: any,
): Promise<T> {
  if (!auth) {
    throw new Error("GitHub PAT Not set!");
  }
  const response = await octokit.request(endpoint, parameters);
  return response as T;
}

export async function searchIssues<T>(q: string, page: number = 1): Promise<T> {
  if (!auth) {
    throw new Error("GitHub PAT Not set!");
  }

  const response = await octokit.rest.search.issuesAndPullRequests({
    q,
    page,
    per_page: 25,
  });

  if (!response) {
    throw new Error("Failed to load commits");
  }
  return response as T;
}

export async function retrieveDiffContents(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.diff",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch diff contents");
    }

    const diffContents = await response.text();
    return diffContents;
  } catch (error) {
    console.log("Failed to fetch diff contents!");
    console.log(error);
    throw error;
  }
}

type IssueProps = {
  repository: string;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
};

type EditIssueProps = {
  repository: string;
  title?: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  stateReason?: string;
  state?: "open" | "closed";
  issueNumber: number;
};

export async function updateIssue({
  repository,
  title,
  body,
  labels = [],
  assignees = [],
  stateReason,
  state,
  issueNumber,
}: EditIssueProps) {
  type UpdateIssueResponse =
    | Endpoints[typeof UPDATE_ISSUE_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<UpdateIssueResponse>(
      UPDATE_ISSUE_ENDPOINT,
      {
        owner: "skylar-anderson",
        repo: "openai-chat-playground",
        title,
        body,
        assignees,
        labels,
        state_reason: stateReason,
        issue_number: issueNumber,
        state,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response?.status) {
      return new Error("Failed to update issue");
    }

    return response;
  } catch (error) {
    console.log("Failed to update issue!");
    console.log(error);
    return error;
  }
}

export async function createIssue({
  repository,
  title,
  body,
  labels = [],
  assignees = [],
}: IssueProps) {
  type CreateIssueResponse =
    | Endpoints[typeof CREATE_ISSUE_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreateIssueResponse>(
      CREATE_ISSUE_ENDPOINT,
      {
        owner: "skylar-anderson",
        repo: "openai-chat-playground",
        title,
        body,
        assignees,
        labels,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response?.status) {
      return new Error("Failed to create issue");
    }

    return response;
  } catch (error) {
    console.log("Failed to create issue!");
    console.log(error);
    return error;
  }
}

type IssueCommentProps = {
  repository: string;
  issueNumber: number;
  body: string;
};

export async function createIssueComment({
  repository,
  issueNumber,
  body,
}: IssueCommentProps) {
  type CreateIssueCommentResponse =
    | Endpoints[typeof CREATE_ISSUE_COMMENT_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreateIssueCommentResponse>(
      CREATE_ISSUE_COMMENT_ENDPOINT,
      {
        owner: "skylar-anderson",
        repo: "openai-chat-playground",
        issue_number: issueNumber,
        body,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response?.status) {
      return new Error("Failed to create issue comment");
    }

    return response;
  } catch (error) {
    console.log("Failed to create issue comment!");
    console.log(error);
    return error;
  }
}

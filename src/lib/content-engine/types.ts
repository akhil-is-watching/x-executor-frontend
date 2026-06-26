export type AngleType = "product" | "authentic" | "founder" | "default";
export type CheckStatus = "flag" | "nudge" | "pass";
export type TrendType = "narrative" | "price";

export interface ToneTweet {
  id: string;
  text: string;
  createdAt: string;
}

export interface ContentProfile {
  orgId: string;
  name: string;
  role: string;
  country: string;
  company: string;
  companyDetails: string;
  background: string;
  toneTweets: ToneTweet[];
  onboardingComplete: boolean;
  selectedTopics: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TrendTopic {
  id: string;
  title: string;
  summary: string;
  type: TrendType;
  sentiment?: string;
  companyAngles: string[];
  authenticAngle?: string;
  angles: string[];
  examplePosts?: { text: string; url?: string }[];
  source: string;
}

export interface ProductTrendTopic {
  id: string;
  title: string;
  summary: string;
  productLink: string;
  dataPoints: { fact: string; source?: string }[];
  founderAngle: string;
  examplePosts?: { text: string; url?: string }[];
}

export interface TrendTopicGroup {
  label: string;
  topics: readonly string[];
}

export interface TrendsResponse {
  topics: TrendTopic[];
  source: string;
  cached: boolean;
  fetchedAt?: string;
}

export interface ProductTrendsResponse {
  topics: ProductTrendTopic[];
  source: string;
  cached: boolean;
  fetchedAt?: string;
}

export interface CustomTrendsResponse extends TrendsResponse {
  selectedTopics: string[];
}

export interface CoachCheck {
  id: string;
  label: string;
  status: CheckStatus;
  hint?: string;
}

export interface CoachResult {
  score: number;
  verdict: "Ship it" | "Almost there" | "Needs work";
  summary: string;
  checks: CoachCheck[];
  stats: { flagged: number; nudges: number; onPoint: number };
  wordCount: number;
  charCount: number;
}

export interface GenerateResponse extends CoachResult {
  text: string;
}

export interface TweetAngleSuggestion {
  id: string;
  label: string;
  text: string;
  angleType?: AngleType;
}

export interface SuggestAnglesResponse {
  topic: string;
  angles: TweetAngleSuggestion[];
}

export interface DraftVersion {
  text: string;
  score: number;
  createdAt: string;
}

export interface ContentDraft {
  _id: string;
  orgId: string;
  text: string;
  score: number;
  verdict: string;
  checks: Record<string, unknown>;
  topic: string;
  angle: string;
  angleType: AngleType;
  versions: DraftVersion[];
  status: "draft" | "posted";
  postedAt?: string;
  xTweetId?: string;
  sentiment?: string;
  trendSummary?: string;
  dataPoints?: { fact: string; source?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface DraftsListResponse {
  drafts: ContentDraft[];
  total: number;
}

export interface TweetsListResponse {
  tweets: ContentDraft[];
  total: number;
}

export interface FollowedAccount {
  _id: string;
  orgId: string;
  xHandle: string;
  createdAt: string;
}

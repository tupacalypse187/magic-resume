export type ReviewCategory = "content" | "ats" | "keywords" | "formatting" | "completeness";
export type ReviewSeverity = "info" | "warning" | "critical";

export interface ReviewFinding {
  id: string;
  category: ReviewCategory;
  severity: ReviewSeverity;
  sectionId: string;
  message: string;
  originalText?: string;
  suggestedFix?: string;
  autoApplicable: boolean;
}

export interface ReviewResponse {
  overallScore: number;
  findings: ReviewFinding[];
}

export interface TemplateSuggestion {
  rationale: string;
  suggestedSettings: Record<string, unknown>;
  suggestedTemplateId?: string;
  confidence: "high" | "medium" | "low";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  resumeId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

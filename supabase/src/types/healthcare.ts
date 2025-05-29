
// Healthcare-specific types for SOPify healthcare specialization

export type HealthcareContentType = 
  | "critical-safety" 
  | "hipaa-alert" 
  | "patient-communication"
  | "scenario-guidance"
  | "standard";

export interface HealthcareContent {
  id: string;
  type: HealthcareContentType;
  content: string;
  priority: "high" | "medium" | "low";
  icon?: string;
}

export interface RevisionHistoryEntry {
  id: string;
  version: string;
  date: string;
  changes: string;
  author: string;
  approved: boolean;
  approver?: string;
  approvalDate?: string;
}

export interface ApprovalSignature {
  id: string;
  role: string;
  name: string;
  signature?: string; // Base64 signature image
  date?: string;
  approved: boolean;
}

export interface HealthcareSopMetadata {
  revisionHistory: RevisionHistoryEntry[];
  approvalSignatures: ApprovalSignature[];
  complianceLevel: "basic" | "hipaa" | "joint-commission";
  patientImpact: "direct" | "indirect" | "administrative";
  criticalityLevel: "routine" | "important" | "critical";
}

export interface HealthcareThemeConfig {
  id: string;
  organizationName: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDefault: boolean;
}

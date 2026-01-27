/**
 * ASQ-3 Screening TypeScript Interfaces
 * 
 * Generated: 2026-01-23
 * Feature: ASQ-3 Screening Real Data Implementation
 * 
 * These interfaces define the data structures for passing screening data
 * from Laravel backend to React frontend via Inertia.js props.
 */

// =============================================================================
// Enums and Type Aliases
// =============================================================================

/**
 * Screening result status indicating child's developmental level
 */
export type ScreeningResult = 'sesuai' | 'pantau' | 'perlu_rujukan';

/**
 * Screening session status
 */
export type ScreeningStatus = 'in_progress' | 'completed' | 'cancelled';

/**
 * ASQ-3 developmental domain codes
 */
export type ASQ3DomainCode = 
  | 'communication' 
  | 'gross_motor' 
  | 'fine_motor' 
  | 'problem_solving' 
  | 'personal_social';

/**
 * Intervention types for follow-up actions
 */
export type InterventionType = 
  | 'stimulation' 
  | 'referral' 
  | 'follow_up' 
  | 'counseling' 
  | 'other';

/**
 * Intervention status
 */
export type InterventionStatus = 
  | 'planned' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

// =============================================================================
// Label Mappings (Indonesian)
// =============================================================================

export const ScreeningResultLabels: Record<ScreeningResult, string> = {
  sesuai: 'Perkembangan Sesuai',
  pantau: 'Perlu Pemantauan',
  perlu_rujukan: 'Perlu Rujukan',
};

export const ASQ3DomainLabels: Record<ASQ3DomainCode, string> = {
  communication: 'Komunikasi',
  gross_motor: 'Motorik Kasar',
  fine_motor: 'Motorik Halus',
  problem_solving: 'Pemecahan Masalah',
  personal_social: 'Personal Sosial',
};

export const InterventionTypeLabels: Record<InterventionType, string> = {
  stimulation: 'Stimulasi',
  referral: 'Rujukan',
  follow_up: 'Tindak Lanjut',
  counseling: 'Konseling',
  other: 'Lainnya',
};

export const InterventionStatusLabels: Record<InterventionStatus, string> = {
  planned: 'Direncanakan',
  in_progress: 'Sedang Berjalan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

// =============================================================================
// Domain Result Interface
// =============================================================================

/**
 * Result for a single developmental domain within a screening
 */
export interface Asq3DomainResult {
  /** Unique identifier */
  id: number;
  
  /** Domain code for icon/label mapping */
  domain_code: ASQ3DomainCode;
  
  /** Indonesian domain name */
  domain_name: string;
  
  /** Child's score for this domain */
  total_score: number;
  
  /** Score below which referral is needed */
  cutoff_score: number;
  
  /** Score below which monitoring is needed */
  monitoring_score: number;
  
  /** Maximum possible score (60 for all domains) */
  max_score: number;
  
  /** Derived status based on score vs thresholds */
  status: ScreeningResult;
}

// =============================================================================
// Recommendation Interface
// =============================================================================

/**
 * Developmental stimulation recommendation
 */
export interface Asq3Recommendation {
  /** Unique identifier */
  id: number;
  
  /** Reference to domain */
  domain_id: number;
  
  /** Domain code for categorization */
  domain_code: ASQ3DomainCode;
  
  /** Display title (derived from domain + context) */
  title: string;
  
  /** Full recommendation text in Indonesian */
  recommendation_text: string;
  
  /** Sort order (lower = higher priority) */
  priority: number;
}

// =============================================================================
// Intervention Interface
// =============================================================================

/**
 * Intervention/action record for a screening
 */
export interface Asq3Intervention {
  /** Unique identifier */
  id: number;
  
  /** Type of intervention */
  type: InterventionType;
  
  /** Indonesian type label */
  type_label: string;
  
  /** Action description */
  action: string;
  
  /** Additional notes */
  notes: string | null;
  
  /** Current status */
  status: InterventionStatus;
  
  /** Indonesian status label */
  status_label: string;
  
  /** Scheduled follow-up date */
  follow_up_date: string | null;
  
  /** When completed */
  completed_at: string | null;
  
  /** Associated domain (if any) */
  domain_code: ASQ3DomainCode | null;
}

// =============================================================================
// Screening Detail Interface
// =============================================================================

/**
 * Complete screening detail with all related data
 * Used for displaying the latest/selected screening
 */
export interface Asq3ScreeningDetail {
  /** Unique identifier */
  id: number;
  
  /** Reference to child */
  child_id: number;
  
  /** Age interval ID for questionnaire selection */
  age_interval_id: number;
  
  /** Date screening was conducted (YYYY-MM-DD) */
  screening_date: string;
  
  /** Child's age at screening in months */
  age_at_screening_months: number;
  
  /** Child's age at screening in days */
  age_at_screening_days: number;
  
  /** Display label for age interval (e.g., "24 bulan") */
  age_interval_label: string;
  
  /** Current screening status */
  status: ScreeningStatus;
  
  /** Overall developmental status (null if not completed) */
  overall_status: ScreeningResult | null;
  
  /** Sum of all domain scores */
  total_score: number;
  
  /** Maximum possible total score (300 = 60 × 5 domains) */
  max_score: number;
  
  /** Results for each domain */
  domain_results: Asq3DomainResult[];
  
  /** Recommendations based on screening results */
  recommendations: Asq3Recommendation[];
  
  /** Any interventions created for this screening */
  interventions: Asq3Intervention[];
  
  /** Calculated next screening date (YYYY-MM-DD) */
  next_screening_date: string | null;
  
  /** Days until next screening */
  days_until_next: number | null;
}

// =============================================================================
// Screening History Interface
// =============================================================================

/**
 * Minimal screening data for history list
 */
export interface Asq3ScreeningHistoryItem {
  /** Unique identifier */
  id: number;
  
  /** Date screening was conducted (YYYY-MM-DD) */
  screening_date: string;
  
  /** Child's age at screening in months */
  age_at_screening_months: number;
  
  /** Sum of all domain scores */
  total_score: number;
  
  /** Overall developmental status */
  overall_status: ScreeningResult;
}

// =============================================================================
// Component Props Interface
// =============================================================================

/**
 * Props for ScreeningsTabContent component
 */
export interface ScreeningsTabProps {
  /** Child ID for navigation/actions */
  childId: number;
  
  /** Latest completed screening with full details (null if none) */
  latestScreening: Asq3ScreeningDetail | null;
  
  /** Previous screenings for history display */
  screeningHistory: Asq3ScreeningHistoryItem[];
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get color classes for a screening result status
 */
export function getScreeningResultColor(status: ScreeningResult): string {
  switch (status) {
    case 'sesuai':
      return 'bg-[#DEEBC5] text-black border-[#c5daa6]';
    case 'pantau':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'perlu_rujukan':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Calculate percentage score for display
 */
export function calculateScorePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Get icon component name for a domain
 */
export function getDomainIconName(domainCode: ASQ3DomainCode): string {
  const iconMap: Record<ASQ3DomainCode, string> = {
    communication: 'MessageCircle',
    gross_motor: 'Activity',
    fine_motor: 'Hand',
    problem_solving: 'Puzzle',
    personal_social: 'Users',
  };
  return iconMap[domainCode];
}

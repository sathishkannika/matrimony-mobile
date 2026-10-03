/** Types aligned with backend DTOs (BACKEND_IMPLEMENTATION.md) */

export type Gender = 'MALE' | 'FEMALE'
export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
export type ProfileActorType = 'SELF' | 'PARENT' | 'BROTHER' | 'SISTER' | 'COUSIN' | 'GUARDIAN'
export type ProfileForType = 'SELF' | 'SON' | 'DAUGHTER' | 'BROTHER' | 'SISTER'
export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
export type PlanType = 'TRIAL' | 'STANDARD' | 'PREMIUM' | 'PLATINUM'
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
export type SubscriptionSource = 'TRIAL' | 'PURCHASE' | 'ADMIN_GRANT'

export interface AddressDto {
  id?: number
  doorNo?: string
  street?: string
  area?: string
  city?: string
  district?: string
  state?: string
  country?: string
  pincode?: string
}

export interface ProfileResponse {
  id: number
  /** Public shareable profile ID (e.g. MAT000123) */
  profileCode: string
  userId: number
  firstName: string
  lastName: string
  displayName: string
  gender: Gender
  dob: string
  age: number
  maritalStatus: MaritalStatus
  heightCm?: number
  weightKg?: number
  bloodGroup?: string
  religion?: string
  caste?: string
  subCasteId?: number
  subCasteName?: string
  motherTongue?: string
  star?: string
  rasi?: string
  highestDegree?: string
  course?: string
  profession?: string
  companyName?: string
  annualIncome?: string
  diet?: string
  smoking?: string
  drinking?: string
  houseType?: string
  physicalStatus?: string
  fatherName?: string
  fatherOccupation?: string
  motherName?: string
  motherOccupation?: string
  siblings?: string
  referencePersonName?: string
  referencePersonCountryCode?: string
  referencePersonContact?: string
  city?: string
  state?: string
  address?: AddressDto
  aboutMe?: string
  partnerExpectation?: string
  hobbies?: string
  profileVisibility?: string
  isVerified?: boolean
  /** false = owner has temporarily deactivated (hidden) the profile */
  isActive?: boolean
  /** True when a horoscope file is stored for this profile */
  hasHoroscope?: boolean
  profileCompleted?: boolean
  primaryPhotoUrl?: string
  /** Feed/card sized image; prefer over primaryPhotoUrl in lists. */
  primaryPhotoThumbnailUrl?: string
  email?: string
  /** Dialing country code for account mobile (digits only). */
  countryCode?: string
  mobile?: string
  /** Who registered this profile (self, parent, etc.) */
  createdByActor?: ProfileActorType
  /** Whose matrimony profile this is (son, daughter, self) */
  profileFor?: ProfileForType
  creatorName?: string
  creatorMobile?: string
  creatorRelationship?: string
}

/** GET /api/profiles/{id}/relation — single-profile interest + shortlist status */
export interface ProfileViewerRelationResponse {
  /** PENDING | RECEIVED | ACCEPTED | null */
  interestStatus: 'PENDING' | 'RECEIVED' | 'ACCEPTED' | null
  shortlisted: boolean
  blocked?: boolean
  reported?: boolean
}

/** POST /api/profiles/viewer-relations — batch locks for card grids */
export interface ProfileRelationsBatchResponse {
  relations: Record<string, ProfileViewerRelationResponse>
}

export interface InterestResponse {
  id: number
  senderProfileId: number
  senderDisplayName: string
  senderPrimaryPhotoUrl?: string
  receiverProfileId: number
  receiverDisplayName: string
  receiverPrimaryPhotoUrl?: string
  status: InterestStatus
  sentAt: string
  respondedAt?: string
}

export interface InterestDashboardCounts {
  sent: number
  received: number
  accepted: number
  matches: number
  unreadNotifications: number
  profileViews: number
}

export interface NotificationResponse {
  id: number
  profileId: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export interface MembershipPlanResponse {
  id: number
  planCode: string
  planName: string
  planType: PlanType
  durationDays: number
  price: number
  currency: string
  maxInterestPerDay?: number
  maxPhotoUpload?: number
  profileBoostCount?: number
  canChat?: boolean
  canViewMobile?: boolean
  canViewEmail?: boolean
  canViewPhotos?: boolean
  maxProfileViews?: number
  canDownloadHoroscope?: boolean
  profileHighlight?: boolean
  customerSupport?: string
  active: boolean
}

export interface SubscriptionResponse {
  id: number
  subscriptionNumber: string
  subscriptionStatus: SubscriptionStatus
  source: SubscriptionSource
  planName: string
  planCode: string
  price: number
  startDate?: string
  endDate?: string
  features?: Record<string, unknown>
}

export interface MatchResponse {
  id: number
  profile1Id: number
  profile2Id: number
  otherProfile: ProfileResponse
  interestRequestId: number
  matchedAt: string
}

export interface MatchesSummaryResponse {
  preferenceExists: boolean
  preferenceMatches: PagedResponse<ProfileResponse>
  mutualMatches: MatchResponse[]
}

export interface ShortlistResponse {
  id: number
  profileId: number
  shortlistedProfileId: number
  shortlistedProfile: ProfileResponse
  createdAt: string
}

export interface ProfileViewResponse {
  id: number
  viewerProfileId: number
  viewedProfileId: number
  otherProfile: ProfileResponse
  viewCount: number
  firstViewedAt: string
  lastViewedAt: string
}

export interface PhotoResponse {
  id: number
  profileId: number
  imageUrl: string
  thumbnailUrl?: string
  isPrimary: boolean
  uploadedAt: string
}

/** Backend ProfileSearchRequest.sortBy — NEWEST / OLDEST by profiles.created_at. */
export type ProfileSearchSortBy = 'NEWEST' | 'OLDEST'

export interface ProfileSearchFilters {
  /** Direct lookup: MAT000123 or numeric digits */
  profileId?: string
  gender?: Gender
  minAge?: number
  maxAge?: number
  /** ISO date YYYY-MM-DD — born on/after */
  dobFrom?: string
  /** ISO date YYYY-MM-DD — born on/before */
  dobTo?: string
  minHeightCm?: number
  maxHeightCm?: number
  city?: string
  state?: string
  country?: string
  caste?: string
  subCasteId?: number
  profession?: string
  annualIncome?: string
  houseType?: string
  star?: string
  rasi?: string
  maritalStatus?: MaritalStatus
  religion?: string
  motherTongue?: string
  education?: string
  /** NEWEST (default) or OLDEST — opposite-gender profiles by join date */
  sortBy?: ProfileSearchSortBy
  /** OR match when multiple rows (e.g. from partner preferences). */
  locations?: PreferenceLocation[]
  page?: number
  size?: number
}

export interface ProfileSearchRequest extends ProfileSearchFilters {}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ProfileUpdateRequest {
  firstName?: string
  lastName?: string
  dob?: string
  maritalStatus?: MaritalStatus
  heightCm?: number
  weightKg?: number
  bloodGroup?: string
  religion?: string
  caste?: string
  subCasteId?: number
  motherTongue?: string
  star?: string
  rasi?: string
  highestDegree?: string
  course?: string
  profession?: string
  companyName?: string
  annualIncome?: string
  diet?: string
  smoking?: string
  drinking?: string
  houseType?: string
  physicalStatus?: string
  fatherName?: string
  fatherOccupation?: string
  motherName?: string
  motherOccupation?: string
  siblings?: string
  referencePersonName?: string
  referencePersonCountryCode?: string
  referencePersonContact?: string
  city?: string
  state?: string
  address?: AddressDto
  aboutMe?: string
  partnerExpectation?: string
  hobbies?: string
  profileVisibility?: string
}

export interface PreferenceLocation {
  id?: number
  country: string
  state?: string
  city?: string
}

export interface PartnerPreferenceResponse {
  id: number
  profileId: number
  minAge?: number
  maxAge?: number
  minHeightCm?: number
  maxHeightCm?: number
  maritalStatus?: string
  religion?: string
  caste?: string
  subCasteId?: number
  subCasteName?: string
  motherTongue?: string
  education?: string
  profession?: string
  minIncome?: string
  locations?: PreferenceLocation[]
  additionalExpectation?: string
}

export interface PartnerPreferenceRequest {
  minAge?: number | null
  maxAge?: number | null
  minHeightCm?: number | null
  maxHeightCm?: number | null
  maritalStatus?: string | null
  religion?: string | null
  caste?: string | null
  subCasteId?: number | null
  motherTongue?: string | null
  education?: string | null
  profession?: string | null
  minIncome?: string | null
  locations?: PreferenceLocation[]
  additionalExpectation?: string | null
}

export interface BlockResponse {
  id: number
  blockerProfileId: number
  blockedProfileId: number
  blockedProfile: ProfileResponse
  createdAt: string
}

export type PaymentStatus = 'INITIATED' | 'PENDING' | 'PENDING_REVIEW' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'CASH'

export interface PaymentResponse {
  id: number
  paymentReference: string
  gatewayOrderId?: string
  finalAmount: number
  currency: string
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paidAt?: string
}

export interface UpgradeSubscriptionResponse {
  subscription: SubscriptionResponse
  payment: PaymentResponse
  gateway: string
  amountDue: number
  currency: string
  razorpayKeyId?: string
  redirectUrl?: string
  redirectFields?: Record<string, string>
}

export interface CreateMembershipPlanRequest {
  planCode: string
  planName: string
  planType: PlanType
  durationDays: number
  price: number
  currency: string
  maxInterestPerDay: number
  maxPhotoUpload: number
  profileBoostCount: number
  canChat: boolean
  canViewMobile: boolean
  canViewEmail: boolean
  canDownloadHoroscope: boolean
  profileHighlight: boolean
  customerSupport: string
  active: boolean
}

/** Matches backend ProfileCreateRequest DTO (POST /api/profiles). */
export interface ProfileCreateRequest {
  firstName: string
  lastName: string
  gender: Gender
  /** ISO date YYYY-MM-DD (backend LocalDate). */
  dob: string
  maritalStatus: MaritalStatus
  heightCm?: number
  weightKg?: number
  bloodGroup?: string
  religion?: string
  caste?: string
  subCasteId?: number
  motherTongue?: string
  star?: string
  rasi?: string
  highestDegree?: string
  course?: string
  profession?: string
  companyName?: string
  annualIncome?: string
  diet?: string
  smoking?: string
  drinking?: string
  houseType?: string
  physicalStatus?: string
  fatherName?: string
  fatherOccupation?: string
  motherName?: string
  motherOccupation?: string
  siblings?: string
  referencePersonName?: string
  referencePersonCountryCode?: string
  referencePersonContact?: string
  city?: string
  state?: string
  address?: AddressDto
  aboutMe?: string
  partnerExpectation?: string
  hobbies?: string
  profileVisibility?: string
}

/** Frontend-only fields collected by CreateProfileForm; mapped before API call. */
export interface CreateProfileFormValues extends ProfileCreateRequest {
  createdByActor: ProfileActorType
  profileFor: ProfileForType
  creatorName?: string
  creatorMobile?: string
  creatorMobileCountryCode?: string
  creatorRelationship?: string
  addressDoorNo?: string
  addressStreet?: string
  addressArea?: string
  addressDistrict?: string
  addressCountry?: string
  addressPincode?: string
  profileVisibility?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface RegisterRequest {
  username: string
  email: string
  /** Dialing country code digits only (e.g. 91). */
  countryCode: string
  /** National mobile digits only. */
  mobile: string
  password: string
  captchaId: string
  captchaAnswer: string
  notRobot: boolean
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
  /** Optional when signing in with phone. */
  countryCode?: string
  captchaId: string
  captchaAnswer: string
  notRobot: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
  profileId: number | null
  /** USER | ADMIN — present on newer backends */
  role?: string
}

export type ReportReason = 'SCAM' | 'FAKE_PROFILE' | 'HARASSMENT' | 'INAPPROPRIATE' | 'OTHER'
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'CONFIRMED_SCAM' | 'DISMISSED'

export type ProfileDeleteReason =
  | 'MATCHES_FOUND'
  | 'MATCHES_NOT_FOUND'
  | 'FOUND_OTHER_EXTERNAL_SOURCES'
  | 'GOT_MARRIED_ELSEWHERE'
  | 'TAKING_A_BREAK'
  | 'NOT_SATISFIED'
  | 'OTHER'

export interface DeleteProfileRequest {
  reason: ProfileDeleteReason
  customReason?: string
}

export interface CreateProfileReportRequest {
  reason: ReportReason
  details?: string
}

export interface ProfileReportResponse {
  id: number
  reporterProfileId: number
  reporterName: string
  reportedProfileId: number
  reportedProfile: ProfileResponse
  reason: ReportReason
  details?: string | null
  status: ReportStatus
  adminNotes?: string | null
  investigatedByUserId?: number | null
  investigatedByUsername?: string | null
  investigatedAt?: string | null
  createdAt: string
  openReportCountAgainstProfile: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}


export interface CaptchaResponse {
  captchaId: string
  imageSvg?: string
  /** @deprecated older backend shape */
  imageDataUri?: string
}

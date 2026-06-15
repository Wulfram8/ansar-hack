export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
}

export interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

// CRM Entities
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  customFields: Record<string, any>;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Lead {
  id: string;
  title: string;
  contactId?: string | null;
  contact?: Contact;
  source?: string;
  status: LeadStatus;
  value?: number | null;
  priority: LeadPriority;
  notes?: string;
  customFields: Record<string, any>;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export interface Opportunity {
  id: string;
  title: string;
  contactId?: string | null;
  leadId?: string | null;
  contact?: Contact;
  lead?: Lead;
  stage: OpportunityStage;
  value?: number | null;
  probability: number;
  expectedCloseDate?: string | null;
  notes?: string;
  customFields: Record<string, any>;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  customFields: Record<string, any>;
  createdBy: string;
  assignedTo?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: string;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses?: string[];
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  status: 'draft' | 'sent' | 'failed' | 'received';
  direction: 'inbound' | 'outbound';
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  sentAt?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface FileEntity {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  filters: Record<string, any>[];
  columns?: string[];
  groupBy?: string;
  sortBy?: string;
  chartType?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  userId: string;
  widgetType: string;
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  size: { w: number; h: number };
  createdAt: string;
  updatedAt: string;
}

// Schema types
export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  RICH_TEXT = 'rich_text',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  DATE = 'date',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  BOOLEAN = 'boolean',
  URL = 'url',
  CURRENCY = 'currency',
  RELATION = 'relation',
  FILE = 'file',
}

export interface FieldSchema {
  id: string;
  name: string;
  slug: string;
  fieldType: FieldType;
  isRequired: boolean;
  defaultValue?: string;
  options?: Record<string, any>;
  displayOrder: number;
  entitySchemaId: string;
}

export interface EntitySchema {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
  fields: FieldSchema[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntityRecord {
  id: string;
  entitySchemaId: string;
  data: Record<string, any>;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

import type { Types } from "mongoose";

export type EntityId = string | Types.ObjectId;

export type MessageChannel = "email" | "whatsapp";

export type MessageDeliveryStatus =
  | "pending"
  | "sending"
  | "accepted"
  | "partial"
  | "rejected"
  | "unknown";

export interface MessageMediaResult {
  mediaIndex: number;
  mediaType: "image" | "video";
  senderPhone?: EntityId;
  status: MessageDeliveryStatus;
  providerMessageId?: string;
}

export interface MessageDelivery {
  recipient: string;
  senderPhone?: EntityId;
  status: MessageDeliveryStatus;
  providerMessageId?: string;
  mediaResults?: MessageMediaResult[];
}

export interface MessageMediaAttachment {
  mediaType: "image" | "video";
  mediaUrl?: string;
}

export interface MessageRecord {
  _id?: EntityId;
  sender: EntityId;
  contacts: EntityId[];
  channel: MessageChannel;
  content: string;
  header?: string;
  mediaUrl?: string;
  mediaAttachments?: MessageMediaAttachment[];
  senderMode?: "single" | "round-robin" | "per-media";
  senderPhone?: EntityId;
  senderEmail?: string;
  requestId?: string;
  deliveries: MessageDelivery[];
  deliveryStatus: "pending" | "sending" | "accepted" | "partial" | "failed";
  hiddenAt?: Date;
}

export interface PhoneNumberRecord {
  _id: EntityId;
  owner: EntityId;
  ownerType: "User" | "Contact";
  phone: string;
  countryNumber: string;
  e164?: string;
  tokens?: {
    whatsapp?: EntityId;
  };
}

export interface WhatsAppTokenRecord {
  _id?: EntityId;
  owner: EntityId;
  phone: EntityId;
  whatsappSession: string;
}

export interface WhatsAppMedia {
  type: "image" | "video";
  data: string;
  filename: string;
  mimeType: string;
}

export interface WhatsAppTransportOptions {
  apiBaseUrl?: string;
  apiKey?: string;
  sourcePhoneNumber?: string;
  sessionVerified?: boolean;
  media?: WhatsAppMedia;
  fetchImpl?: typeof fetch;
  limit?: number;
  offset?: number;
}

export interface WhatsAppChatMessage {
  id: string;
  body: string;
  timestamp: string | null;
  fromMe: boolean;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  lastMessage: WhatsAppChatMessage | null;
}

export interface ProviderError extends Error {
  providerRejected?: boolean;
  providerStatus?: number;
  providerOperation?: string;
  status?: number;
}

export interface CloudinaryConfig {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface ServerFeatureFlags {
  mediaUploadsConfigured?: boolean;
  webhookConfigured?: boolean;
  whatsappConfigured?: boolean;
}

export interface HttpError extends Error {
  status?: number;
  code?: number | string;
  providerRejected?: boolean;
  providerStatus?: number;
  providerOperation?: string;
}

export interface WhatsAppSessionRecord {
  whatsappSession: string;
}

export interface WhatsAppConnectionOptions extends WhatsAppTransportOptions {
  restartWrongNumber?: boolean;
}

export interface WhatsAppMessageResponse {
  messages: Array<{ id: string }>;
  [key: string]: unknown;
}

export interface AccountInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface PhoneMigrationRecord extends Record<string, unknown> {
  _id: EntityId;
  phone: string;
  countryNumber: string;
  owner: EntityId;
  ownerType: string;
  e164?: string;
}

export interface PhoneMigrationToken extends Record<string, unknown> {
  _id: EntityId;
  owner: EntityId;
  phone?: EntityId;
}

export interface ContactImportRow {
  row: number;
  value: unknown;
}

export interface ImportPhoneNumber extends NormalizedPhoneNumber {
  row: number;
}

export interface NormalizedPhoneNumber {
  phone: string;
  countryNumber: string;
  e164: string;
}

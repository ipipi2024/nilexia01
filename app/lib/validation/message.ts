import { ObjectId } from "mongodb";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface SendMessageInput {
  receiverId: string;
  content: string;
}

// Sanitize input to prevent injection attacks
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

// Validate message sending data
export function validateSendMessage(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate receiverId
  if (!data.receiverId || typeof data.receiverId !== "string") {
    errors.push({ field: "receiverId", message: "Receiver ID is required and must be a string" });
  } else if (!ObjectId.isValid(data.receiverId)) {
    errors.push({ field: "receiverId", message: "Receiver ID must be a valid ObjectId" });
  }

  // Validate content
  if (!data.content || typeof data.content !== "string") {
    errors.push({ field: "content", message: "Content is required and must be a string" });
  } else if (data.content.trim().length === 0) {
    errors.push({ field: "content", message: "Content cannot be empty" });
  } else if (data.content.trim().length > 1000) {
    errors.push({ field: "content", message: "Content must not exceed 1000 characters" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate ObjectId format
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

import { ObjectId } from "mongodb";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface CreateListingInput {
  title: string;
  description: string;
  type: "sell" | "donate" | "rent";
  price?: number | null;
  rentPeriod?: "hour" | "day" | "week" | "month" | "year";
  images?: string[];
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  type?: "sell" | "donate" | "rent";
  price?: number | null;
  rentPeriod?: "hour" | "day" | "week" | "month" | "year";
  images?: string[];
  status?: "available" | "unavailable" | "sold" | "donated" | "rented";
}

// Sanitize input to prevent injection attacks
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

// Validate listing creation data
export function validateCreateListing(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate title
  if (!data.title || typeof data.title !== "string") {
    errors.push({ field: "title", message: "Title is required and must be a string" });
  } else if (data.title.trim().length < 3) {
    errors.push({ field: "title", message: "Title must be at least 3 characters long" });
  } else if (data.title.trim().length > 100) {
    errors.push({ field: "title", message: "Title must not exceed 100 characters" });
  }

  // Validate description
  if (!data.description || typeof data.description !== "string") {
    errors.push({ field: "description", message: "Description is required and must be a string" });
  } else if (data.description.trim().length < 10) {
    errors.push({ field: "description", message: "Description must be at least 10 characters long" });
  } else if (data.description.trim().length > 1000) {
    errors.push({ field: "description", message: "Description must not exceed 1000 characters" });
  }

  // Validate type
  if (!data.type || !["sell", "donate", "rent"].includes(data.type)) {
    errors.push({ field: "type", message: "Type must be 'sell', 'donate', or 'rent'" });
  }

  // Validate price based on type
  if (data.type === "donate") {
    if (data.price !== null && data.price !== undefined) {
      errors.push({ field: "price", message: "Price must be null for 'donate' type" });
    }
  } else if (data.type === "sell" || data.type === "rent") {
    if (data.price === null || data.price === undefined) {
      errors.push({ field: "price", message: `Price is required for '${data.type}' type` });
    } else if (typeof data.price !== "number") {
      errors.push({ field: "price", message: "Price must be a number" });
    } else if (data.price < 0) {
      errors.push({ field: "price", message: "Price must be greater than or equal to 0" });
    }
  }

  // Validate rentPeriod for rent type
  if (data.type === "rent") {
    if (!data.rentPeriod) {
      errors.push({ field: "rentPeriod", message: "Rental period is required for 'rent' type" });
    } else if (!["hour", "day", "week", "month", "year"].includes(data.rentPeriod)) {
      errors.push({ field: "rentPeriod", message: "Rental period must be 'hour', 'day', 'week', 'month', or 'year'" });
    }
  }

  // Validate images (optional)
  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) {
      errors.push({ field: "images", message: "Images must be an array" });
    } else if (data.images.length > 5) {
      errors.push({ field: "images", message: "Maximum 5 images allowed" });
    } else {
      // Validate each image URL
      for (let i = 0; i < data.images.length; i++) {
        if (typeof data.images[i] !== "string" || data.images[i].trim() === "") {
          errors.push({ field: "images", message: `Image at index ${i} must be a valid URL string` });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate listing update data
export function validateUpdateListing(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate title if provided
  if (data.title !== undefined) {
    if (typeof data.title !== "string") {
      errors.push({ field: "title", message: "Title must be a string" });
    } else if (data.title.trim().length < 3) {
      errors.push({ field: "title", message: "Title must be at least 3 characters long" });
    } else if (data.title.trim().length > 100) {
      errors.push({ field: "title", message: "Title must not exceed 100 characters" });
    }
  }

  // Validate description if provided
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      errors.push({ field: "description", message: "Description must be a string" });
    } else if (data.description.trim().length < 10) {
      errors.push({ field: "description", message: "Description must be at least 10 characters long" });
    } else if (data.description.trim().length > 1000) {
      errors.push({ field: "description", message: "Description must not exceed 1000 characters" });
    }
  }

  // Validate type if provided
  if (data.type !== undefined) {
    if (!["sell", "donate", "rent"].includes(data.type)) {
      errors.push({ field: "type", message: "Type must be 'sell', 'donate', or 'rent'" });
    }
  }

  // Validate price if provided
  if (data.price !== undefined) {
    if (data.price !== null && typeof data.price !== "number") {
      errors.push({ field: "price", message: "Price must be a number or null" });
    } else if (data.price !== null && data.price < 0) {
      errors.push({ field: "price", message: "Price must be greater than or equal to 0" });
    }
  }

  // Validate images if provided
  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) {
      errors.push({ field: "images", message: "Images must be an array" });
    } else if (data.images.length > 5) {
      errors.push({ field: "images", message: "Maximum 5 images allowed" });
    } else {
      for (let i = 0; i < data.images.length; i++) {
        if (typeof data.images[i] !== "string" || data.images[i].trim() === "") {
          errors.push({ field: "images", message: `Image at index ${i} must be a valid URL string` });
        }
      }
    }
  }

  // Validate status if provided
  if (data.status !== undefined) {
    if (!["available", "unavailable", "sold", "donated", "rented"].includes(data.status)) {
      errors.push({ field: "status", message: "Status must be 'available', 'unavailable', 'sold', 'donated', or 'rented'" });
    }
  }

  // Validate rentPeriod if provided
  if (data.rentPeriod !== undefined) {
    if (!["hour", "day", "week", "month", "year"].includes(data.rentPeriod)) {
      errors.push({ field: "rentPeriod", message: "Rental period must be 'hour', 'day', 'week', 'month', or 'year'" });
    }
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

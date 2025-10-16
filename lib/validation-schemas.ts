import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  url: z.string().url('Please enter a valid URL'),
  required: (fieldName: string) => z.string().min(1, `${fieldName} is required`),
  optionalString: z.string().optional(),
  positiveNumber: z.number().positive('Must be a positive number'),
  dateString: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Please enter a valid date'
  ),
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
}

// User validation schemas
export const userValidation = {
  register: z.object({
    username: commonSchemas.required('Username'),
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    fullName: commonSchemas.required('Full name'),
    role: z.enum(['student', 'faculty', 'coordinator', 'mentor'])
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  login: z.object({
    email: commonSchemas.email,
    password: commonSchemas.required('Password')
  }),

  profile: z.object({
    fullName: commonSchemas.required('Full name'),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    department: commonSchemas.optionalString,
    year: z.number().min(1).max(4).optional()
  })
}

// Hackathon validation schemas
export const hackathonValidation = {
  create: z.object({
    title: commonSchemas.required('Title'),
    description: commonSchemas.required('Description'),
    startDate: commonSchemas.dateString,
    endDate: commonSchemas.dateString,
    registrationDeadline: commonSchemas.dateString,
    maxParticipants: commonSchemas.positiveNumber,
    registrationFee: z.number().min(0, 'Fee must be 0 or greater'),
    location: commonSchemas.required('Location'),
    prizes: z.array(z.string()).optional(),
    rules: z.array(z.string()).optional()
  }).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  }).refine((data) => new Date(data.registrationDeadline) < new Date(data.startDate), {
    message: "Registration deadline must be before start date",
    path: ["registrationDeadline"],
  })
}

// Payment validation schemas
export const paymentValidation = {
  create: z.object({
    hackathon: commonSchemas.objectId,
    amount: commonSchemas.positiveNumber,
    paymentMethod: z.enum(['PayPal', 'Credit Card', 'Debit Card', 'Bank Transfer']),
    dueDate: commonSchemas.dateString
  })
}

// Team validation schemas  
export const teamValidation = {
  create: z.object({
    name: commonSchemas.required('Team name'),
    hackathon: commonSchemas.objectId,
    members: z.array(commonSchemas.objectId).min(1, 'Team must have at least one member'),
    description: commonSchemas.optionalString
  })
}

// Helper function to get validation errors in a user-friendly format
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })
  
  return errors
}

// Helper function to validate data and return formatted errors
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: getValidationErrors(error) }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}
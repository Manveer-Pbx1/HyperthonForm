import * as z from 'zod';

const baseFields = {
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  rollNo: z.string().min(1, 'Roll number is required'),
  email: z.string().email('Invalid email address'),
  branch: z.string().min(1, 'Branch is required'),
};

const memberSchema = z.object(baseFields);

export const formSchema = z.object({
  ...baseFields,
  teamMembers: z.array(memberSchema.optional()).max(2),
});
import { z } from "zod";
import { ACTIVITY_TYPES, BATCH_STATUSES, BATCH_UNITS } from "@/lib/constants";

export const batchCodeSchema = z
  .string()
  .trim()
  .min(3, "Batch code must be at least 3 characters")
  .max(64, "Batch code is too long")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid batch code format");

export const createBatchSchema = z
  .object({
    farm_id: z.string().trim().min(1, "Select a farm"),
    crop_name: z.string().min(1, "Crop is required"),
    variety: z.string().optional(),
    sowing_date: z.string().min(1, "Sowing date is required"),
    expected_harvest_date: z.string().optional(),
    harvest_date: z.string().optional(),
    quantity: z.coerce.number().positive("Quantity must be greater than 0"),
    unit: z.enum(BATCH_UNITS),
  })
  .superRefine((data, ctx) => {
    if (data.expected_harvest_date && data.expected_harvest_date < data.sowing_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected harvest cannot be before sowing date",
        path: ["expected_harvest_date"],
      });
    }
    if (data.harvest_date && data.harvest_date < data.sowing_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Harvest date cannot be before sowing date",
        path: ["harvest_date"],
      });
    }
  });

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const updateBatchSchema = z
  .object({
    id: z.string().trim().min(1, "Batch ID is required"),
    crop_name: z.string().min(1, "Crop is required"),
    variety: z.string().nullable().optional(),
    sowing_date: z.string().min(1, "Sowing date is required"),
    expected_harvest_date: z.string().nullable().optional(),
    harvest_date: z.string().nullable().optional(),
    quantity: z.coerce.number().positive("Quantity must be greater than 0"),
    unit: z.enum(BATCH_UNITS),
    status: z.enum(BATCH_STATUSES),
  })
  .superRefine((data, ctx) => {
    if (data.expected_harvest_date && data.expected_harvest_date < data.sowing_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected harvest cannot be before sowing date",
        path: ["expected_harvest_date"],
      });
    }
    if (data.harvest_date && data.harvest_date < data.sowing_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Harvest date cannot be before sowing date",
        path: ["harvest_date"],
      });
    }
  });

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export const createActivitySchema = z.object({
  batch_id: z.string().trim().min(1, "Batch ID is required"),
  activity_type: z.enum(ACTIVITY_TYPES, {
    message: "Activity type is required",
  }),
  description: z.string().optional(),
  activity_date: z.string().min(1, "Activity date is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  photo_url: z.union([z.string().url(), z.null()]).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = z.object({
  id: z.string().trim().min(1, "Activity ID is required"),
  batch_id: z.string().trim().min(1, "Batch ID is required"),
  activity_type: z.enum(ACTIVITY_TYPES, {
    message: "Activity type is required",
  }),
  description: z.string().nullable().optional(),
  activity_date: z.string().min(1, "Activity date is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  photo_url: z.union([z.string().url(), z.null()]).optional(),
});

export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

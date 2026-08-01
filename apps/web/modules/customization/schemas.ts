import { z } from "zod";

export const widgetSettingsSchema = z.object({
  greetMessage: z.string().min(1, "Greeting message is required"),
  defaultSuggestions: z.object({
    suggestion1: z.string().optional(),
    suggestion2: z.string().optional(),
    suggestion3: z.string().optional(),
  }),
  vapiSettings: z.object({
    assistantId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
   branding: z.object({
    primaryColor: z
      .string()
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Enter a valid hex color, e.g. #2563EB")
      .optional()
      .or(z.literal("")),
    logoUrl: z
      .string()
      .url("Enter a valid image URL")
      .optional()
      .or(z.literal("")),
  }),
});
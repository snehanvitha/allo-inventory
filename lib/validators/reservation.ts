import { z } from "zod";

export const reservationSchema = z.object({
  inventoryId: z.string().min(1),

  quantity: z.coerce.number().min(1),
});
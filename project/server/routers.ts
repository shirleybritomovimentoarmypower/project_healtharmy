import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createVolunteer,
  listVolunteers,
  getVolunteerWithAvailability,
  updateVolunteer,
  deleteVolunteer,
} from "./db";
import { sendConfirmationEmail, sendAdminNotification } from "./email";
import type { InsertVolunteer } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  volunteers: router({
    create: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(1, "Nome completo é obrigatório"),
          email: z.string().email("Email inválido"),
          phone: z.string().min(10, "Telefone inválido"),
          specialization: z.string().min(1, "Especialidade é obrigatória"),
          professionalRegistration: z.string().min(1, "Registro profissional é obrigatório"),
          project: z.enum(["borahae_terapias", "purple_army"]),
          serviceType: z.enum(["gratuito", "valor_social", "ambos"]),
          modality: z.enum(["online", "presencial"]),
          sessionDuration: z.number().int().positive().default(50),
          frequency: z.enum(["semanal", "quinzenal", "pontual"]),
          notes: z.string().optional(),
          address: z.string().optional(),
          availability: z.array(
            z.object({
              dayOfWeek: z.number().int().min(0).max(6),
              startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:mm)"),
              endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:mm)"),
            })
          ) as z.ZodType<Omit<any, 'volunteerId' | 'id' | 'createdAt' | 'updatedAt'>[]>,
        })
      )
      .mutation(async ({ input }) => {
        const { availability, ...volunteerData } = input;
        const volunteerId = await createVolunteer(
          volunteerData as InsertVolunteer,
          availability as any
        );
        // Enviar email de confirmacao
        await sendConfirmationEmail(input.fullName, input.email);
        
        // Enviar notificacao ao admin
        const adminEmail = process.env.OWNER_NAME || "admin@healtharmy.com";
        await sendAdminNotification(
          input.fullName,
          input.specialization,
          input.project,
          adminEmail
        );
        
        return { id: volunteerId, message: "Voluntário cadastrado com sucesso!" };
      }),

    list: publicProcedure.query(async () => {
      return await listVolunteers();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        return await getVolunteerWithAvailability(input.id);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          data: z.object({
            fullName: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            specialization: z.string().optional(),
            professionalRegistration: z.string().optional(),
            project: z.enum(["borahae_terapias", "purple_army"]).optional(),
            serviceType: z.enum(["gratuito", "valor_social", "ambos"]).optional(),
            modality: z.enum(["online", "presencial"]).optional(),
            sessionDuration: z.number().int().positive().optional(),
            frequency: z.enum(["semanal", "quinzenal", "pontual"]).optional(),
            notes: z.string().optional(),
            address: z.string().optional(),
            status: z.enum(["ativo", "inativo", "pendente"]).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await updateVolunteer(input.id, input.data as Partial<InsertVolunteer>);
        return { message: "Voluntário atualizado com sucesso!" };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteVolunteer(input.id);
        return { message: "Voluntário deletado com sucesso!" };
      }),
  }),
});

export type AppRouter = typeof appRouter;

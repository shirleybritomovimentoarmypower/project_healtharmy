import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  createVolunteer,
  listVolunteers,
  getVolunteerWithAvailability,
  updateVolunteer,
  deleteVolunteer,
} from "./db";
import { sendConfirmationEmail, sendAdminNotification } from "./email";
import { supabase, getOrCreateUser } from "./supabase";
import type { InsertVolunteer } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(async ({ ctx }) => {
      // Logout do Supabase
      await supabase.auth.signOut();
      
      // Limpar cookie de sessão
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      
      return {
        success: true,
      } as const;
    }),

    // Novo: Login com Supabase
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        })
      )
      .mutation(async ({ input }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error || !data.user) {
          throw new Error(error?.message || "Erro ao fazer login");
        }

        // Criar ou atualizar usuário na tabela users
        const user = await getOrCreateUser(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.name
        );

        return {
          success: true,
          user,
          session: data.session,
        };
      }),

    // Novo: Registro com Supabase
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
          name: z.string().min(1, "Nome é obrigatório"),
        })
      )
      .mutation(async ({ input }) => {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              name: input.name,
            },
          },
        });

        if (error || !data.user) {
          throw new Error(error?.message || "Erro ao criar conta");
        }

        // Criar usuário na tabela users
        const user = await getOrCreateUser(data.user.id, data.user.email!, input.name);

        return {
          success: true,
          user,
          message: "Conta criada com sucesso! Verifique seu email para confirmar.",
        };
      }),

    // Novo: Recuperação de senha
    resetPassword: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
        })
      )
      .mutation(async ({ input }) => {
        const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
          redirectTo: `${process.env.VITE_APP_URL || "http://localhost:3001"}/reset-password`,
        });

        if (error) {
          throw new Error(error.message);
        }

        return {
          success: true,
          message: "Email de recuperação enviado! Verifique sua caixa de entrada.",
        };
      }),

    // Novo: Atualizar senha
    updatePassword: publicProcedure
      .input(
        z.object({
          newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Usuário não autenticado");
        }

        const { error } = await supabase.auth.updateUser({
          password: input.newPassword,
        });

        if (error) {
          throw new Error(error.message);
        }

        return {
          success: true,
          message: "Senha atualizada com sucesso!",
        };
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
        
        // Enviar email de confirmação
        await sendConfirmationEmail(input.fullName, input.email);
        
        // Enviar notificação ao admin
        const adminEmail = process.env.OWNER_NAME || "admin@healtharmy.com";
        await sendAdminNotification(
          input.fullName,
          input.specialization,
          input.project,
          adminEmail
        );
        
        return { id: volunteerId, message: "Voluntário cadastrado com sucesso!" };
      }),

    list: adminProcedure.query(async () => {
      return await listVolunteers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const volunteer = await getVolunteerWithAvailability(input.id);
        
        // Se não for admin, só pode ver se for o próprio cadastro (pelo email)
        if (ctx.user.role !== 'admin' && volunteer?.email !== ctx.user.email) {
          throw new Error("Acesso negado");
        }
        
        return volunteer;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          fullName: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().min(10).optional(),
          specialization: z.string().min(1).optional(),
          professionalRegistration: z.string().min(1).optional(),
          project: z.enum(["borahae_terapias", "purple_army"]).optional(),
          serviceType: z.enum(["gratuito", "valor_social", "ambos"]).optional(),
          modality: z.enum(["online", "presencial"]).optional(),
          sessionDuration: z.number().int().positive().optional(),
          frequency: z.enum(["semanal", "quinzenal", "pontual"]).optional(),
          notes: z.string().optional(),
          address: z.string().optional(),
          status: z.enum(["ativo", "inativo", "pendente"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await updateVolunteer(id, updateData);
        return { success: true, message: "Voluntário atualizado com sucesso!" };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteVolunteer(input.id);
        return { success: true, message: "Voluntário removido com sucesso!" };
      }),
  }),
});

export type AppRouter = typeof appRouter;

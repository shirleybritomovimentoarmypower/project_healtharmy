import { pgTable, varchar, text, timestamp, integer, pgEnum, time } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow with Supabase Auth.
 * Sincronizado com auth.users do Supabase via trigger.
 * Columns use camelCase to match both database fields and generated types.
 */

// Enum para roles de usuário
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * UUID do Supabase Auth - sincronizado com auth.users
   * Este é o ID do usuário autenticado pelo Supabase
   */
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de voluntários do Health Army
 * Armazena informações de cadastro dos profissionais voluntários
 */

// Enums para voluntários
export const projectEnum = pgEnum("project", ["borahae_terapias", "purple_army"]);
export const serviceTypeEnum = pgEnum("service_type", ["gratuito", "valor_social", "ambos"]);
export const modalityEnum = pgEnum("modality", ["online", "presencial"]);
export const frequencyEnum = pgEnum("frequency", ["semanal", "quinzenal", "pontual"]);
export const statusEnum = pgEnum("status", ["ativo", "inativo", "pendente"]);

export const volunteers = pgTable("volunteers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Nome completo do profissional */
  fullName: varchar("fullName", { length: 255 }).notNull(),
  /** Email de contato */
  email: varchar("email", { length: 320 }).notNull(),
  /** Telefone/WhatsApp */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** Especialização profissional (ex: Psicólogo, Terapeuta) */
  specialization: varchar("specialization", { length: 255 }).notNull(),
  /** Registro profissional (CRP, CRM, etc) */
  professionalRegistration: varchar("professionalRegistration", { length: 100 }),
  /** Projeto ao qual está vinculado */
  project: projectEnum("project").notNull(),
  /** Tipo de atendimento oferecido */
  serviceType: serviceTypeEnum("serviceType").notNull(),
  /** Modalidade de atendimento */
  modality: modalityEnum("modality").notNull(),
  /** Duração da sessão em minutos */
  sessionDuration: integer("sessionDuration").notNull(),
  /** Frequência de atendimento */
  frequency: frequencyEnum("frequency").notNull(),
  /** Observações adicionais */
  notes: text("notes"),
  /** Endereço (para atendimento presencial) */
  address: text("address"),
  /** Status do cadastro */
  status: statusEnum("status").default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;

/**
 * Tabela de disponibilidade de horários dos voluntários
 * Armazena os horários disponíveis por dia da semana
 */
export const volunteerAvailability = pgTable("volunteerAvailability", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** ID do voluntário */
  volunteerId: integer("volunteerId")
    .notNull()
    .references(() => volunteers.id, { onDelete: "cascade" }),
  /** Dia da semana (0 = Domingo, 6 = Sábado) */
  dayOfWeek: integer("dayOfWeek").notNull(),
  /** Horário de início */
  startTime: time("startTime").notNull(),
  /** Horário de término */
  endTime: time("endTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VolunteerAvailability = typeof volunteerAvailability.$inferSelect;
export type InsertVolunteerAvailability = typeof volunteerAvailability.$inferInsert;

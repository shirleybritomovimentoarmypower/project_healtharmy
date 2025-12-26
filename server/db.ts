import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  volunteers,
  volunteerAvailability,
  InsertVolunteer,
  InsertVolunteerAvailability,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Create postgres client
      _client = postgres(process.env.DATABASE_URL, {
        max: 10, // Maximum number of connections
        idle_timeout: 20,
        connect_timeout: 10,
      });
      
      // Create drizzle instance
      _db = drizzle(_client);
      
      console.log("[Database] Connected to PostgreSQL/Supabase successfully");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using ON CONFLICT
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: {
          name: values.name,
          email: values.email,
          loginMethod: values.loginMethod,
          role: values.role,
          lastSignedIn: values.lastSignedIn || new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Criar um novo voluntário com sua disponibilidade de horários
 */
export async function createVolunteer(
  volunteerData: InsertVolunteer,
  availabilityData: InsertVolunteerAvailability[]
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Inserir voluntário e retornar o ID
    const result = await db.insert(volunteers).values(volunteerData).returning({ id: volunteers.id });
    
    const volunteerId = result[0]?.id;

    if (!volunteerId) {
      throw new Error('Failed to get inserted volunteer ID');
    }

    // Inserir disponibilidade de horários se fornecida
    if (availabilityData.length > 0) {
      const availabilityWithId = availabilityData.map((avail) => ({
        ...avail,
        volunteerId,
      }));
      await db.insert(volunteerAvailability).values(availabilityWithId);
    }

    return volunteerId;
  } catch (error) {
    console.error("[Database] Failed to create volunteer:", error);
    throw error;
  }
}

/**
 * Obter voluntário com sua disponibilidade de horários
 */
export async function getVolunteerWithAvailability(volunteerId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const volunteer = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.id, volunteerId))
      .limit(1);

    if (volunteer.length === 0) {
      return null;
    }

    const availability = await db
      .select()
      .from(volunteerAvailability)
      .where(eq(volunteerAvailability.volunteerId, volunteerId));

    return {
      ...volunteer[0],
      availability,
    };
  } catch (error) {
    console.error("[Database] Failed to get volunteer:", error);
    throw error;
  }
}

/**
 * Listar todos os voluntários
 */
export async function listVolunteers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    return await db.select().from(volunteers);
  } catch (error) {
    console.error("[Database] Failed to list volunteers:", error);
    throw error;
  }
}

/**
 * Atualizar voluntário
 */
export async function updateVolunteer(
  volunteerId: number,
  data: Partial<InsertVolunteer> & { availability?: InsertVolunteerAvailability[] }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const { availability, ...volunteerData } = data;

    // Adicionar updatedAt automaticamente
    const updateData = {
      ...volunteerData,
      updatedAt: new Date(),
    };

    // Atualizar dados do voluntário
    await db
      .update(volunteers)
      .set(updateData)
      .where(eq(volunteers.id, volunteerId));

    // Se availability foi fornecida, atualizar disponibilidade
    if (availability !== undefined) {
      // Deletar disponibilidade antiga
      await db
        .delete(volunteerAvailability)
        .where(eq(volunteerAvailability.volunteerId, volunteerId));

      // Inserir nova disponibilidade
      if (availability.length > 0) {
        const availabilityWithVolunteerId = availability.map((a) => ({
          ...a,
          volunteerId,
        }));
        await db.insert(volunteerAvailability).values(availabilityWithVolunteerId);
      }
    }
  } catch (error) {
    console.error("[Database] Failed to update volunteer:", error);
    throw error;
  }
}

/**
 * Deletar voluntário (e sua disponibilidade em cascata)
 */
export async function deleteVolunteer(volunteerId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(volunteers).where(eq(volunteers.id, volunteerId));
  } catch (error) {
    console.error("[Database] Failed to delete volunteer:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.

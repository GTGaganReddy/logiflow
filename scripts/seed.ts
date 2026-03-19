import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { customerLoads, trucks, notepad, journeyMilestones } from "../shared/schema";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "logiflow.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

async function seed() {
  const dataPath = path.join(process.cwd(), "data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("data.json not found!");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log("Seeding database with data.json...");

  // Seed customer loads
  if (data.customerLoads?.length) {
    for (const load of data.customerLoads) {
      const { id, ...rest } = load;
      await db.insert(customerLoads).values({
        ...rest,
        aiAcceptanceCount: rest.aiAcceptanceCount ?? 0,
        incentivePoints: rest.incentivePoints ?? 0,
        aiSuggestionAccepted: rest.aiSuggestionAccepted ?? false,
      });
    }
    console.log(`  Inserted ${data.customerLoads.length} customer loads`);
  }

  // Seed trucks
  if (data.trucks?.length) {
    for (const truck of data.trucks) {
      const { id, ...rest } = truck;
      await db.insert(trucks).values(rest);
    }
    console.log(`  Inserted ${data.trucks.length} trucks`);
  }

  // Seed notepad
  if (data.notepad?.length) {
    for (const note of data.notepad) {
      const { id, ...rest } = note;
      await db.insert(notepad).values(rest);
    }
    console.log(`  Inserted ${data.notepad.length} notepad entries`);
  }

  // Seed journey milestones
  if (data.journeyMilestones?.length) {
    for (const milestone of data.journeyMilestones) {
      const { id, ...rest } = milestone;
      await db.insert(journeyMilestones).values(rest);
    }
    console.log(`  Inserted ${data.journeyMilestones.length} journey milestones`);
  }

  console.log("Seeding complete!");
  sqlite.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

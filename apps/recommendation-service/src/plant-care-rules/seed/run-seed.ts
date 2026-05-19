/**
 * Standalone seed script — run with:
 *   npm run seed:recommendations
 *
 * Connects directly to MongoDB and upserts all plant care rules.
 */
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { plantCareRulesSeed } from './plant-care-rules.seed';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI_RECOMMENDATIONS ?? 'mongodb://localhost:27017/garden-recommendations';

const schema = new mongoose.Schema(
  {
    plantSlug: { type: String, required: true, unique: true },
    category: String,
    supportsVarieties: Boolean,
    varietyType: String,
    allowedVarieties: [String],
    growth: mongoose.Schema.Types.Mixed,
    watering: mongoose.Schema.Types.Mixed,
    fertilizing: mongoose.Schema.Types.Mixed,
    harvesting: mongoose.Schema.Types.Mixed,
    notes: String,
  },
  { collection: 'plantCareRules', timestamps: true },
);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const PlantCareRuleModel = mongoose.model('PlantCareRule', schema);

  let upserted = 0;
  for (const rule of plantCareRulesSeed) {
    await PlantCareRuleModel.updateOne(
      { plantSlug: rule.plantSlug },
      { $set: rule },
      { upsert: true },
    );
    upserted++;
  }

  console.log(`Seeded ${upserted} plant care rules.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

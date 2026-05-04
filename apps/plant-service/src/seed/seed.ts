import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI_PLANTS ?? 'mongodb://localhost:27017/garden-plants';

const PlantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: '' },
});

const PlantModel = mongoose.model('Plant', PlantSchema);

const plants = [
  { name: 'Potato', slug: 'potato', category: 'vegetable', imageUrl: '' },
  { name: 'Carrot', slug: 'carrot', category: 'vegetable', imageUrl: '' },
  { name: 'Pepper', slug: 'pepper', category: 'vegetable', imageUrl: '' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const plant of plants) {
    const exists = await PlantModel.findOne({ slug: plant.slug });
    if (!exists) {
      await PlantModel.create(plant);
      console.log(`Added: ${plant.name}`);
    } else {
      console.log(`Skipped (already exists): ${plant.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

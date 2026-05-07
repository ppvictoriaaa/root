import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI_PLANTS ?? 'mongodb://localhost:27017/garden-plants';

const PlantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  color: { type: String, default: '' },
});

const PlantModel = mongoose.model('Plant', PlantSchema);

const plants = [
  {
    name: 'Potato',
    slug: 'potato',
    category: 'vegetable',
    imageUrl: '/plant-icons/potato.svg',
    color: '#8B6340',
  },
  {
    name: 'Carrot',
    slug: 'carrot',
    category: 'vegetable',
    imageUrl: '/plant-icons/carrot.svg',
    color: '#E8650A',
  },
  {
    name: 'Pepper',
    slug: 'pepper',
    category: 'vegetable',
    imageUrl: '/plant-icons/pepper.svg',
    color: '#D32F2F',
  },
  {
    name: 'Tomato',
    slug: 'tomato',
    category: 'vegetable',
    imageUrl: '/plant-icons/tomato.svg',
    color: '#E53935',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const plant of plants) {
    await PlantModel.findOneAndUpdate(
      { slug: plant.slug },
      { $set: plant },
      { upsert: true },
    );
    console.log(`Upserted: ${plant.name}`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

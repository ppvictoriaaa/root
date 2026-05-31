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
  {
    name: 'Onion',
    slug: 'onion',
    category: 'vegetable',
    imageUrl: '/plant-icons/onion.svg',
    color: '#A0522D',
  },
  {
    name: 'Apple',
    slug: 'apple',
    category: 'tree',
    imageUrl: '/plant-icons/apple.svg',
    color: '#C0392B',
  },
  {
    name: 'Pear',
    slug: 'pear',
    category: 'tree',
    imageUrl: '/plant-icons/pear.svg',
    color: '#A8B84B',
  },
  {
    name: 'Plum',
    slug: 'plum',
    category: 'tree',
    imageUrl: '/plant-icons/plum.svg',
    color: '#6A0DAD',
  },
  {
    name: 'Cherry',
    slug: 'cherry',
    category: 'tree',
    imageUrl: '/plant-icons/cherry.svg',
    color: '#8B0000',
  },
  {
    name: 'Walnut',
    slug: 'walnut',
    category: 'tree',
    imageUrl: '/plant-icons/walnut.svg',
    color: '#5C3317',
  },
  {
    name: 'Strawberry',
    slug: 'strawberry',
    category: 'berry',
    imageUrl: '/plant-icons/strawberry.svg',
    color: '#E8112D',
  },
  {
    name: 'Raspberry',
    slug: 'raspberry',
    category: 'berry',
    imageUrl: '/plant-icons/raspberry.svg',
    color: '#C0204D',
  },
  {
    name: 'Blueberry',
    slug: 'blueberry',
    category: 'berry',
    imageUrl: '/plant-icons/blueberry.svg',
    color: '#4A6FA5',
  },
  {
    name: 'Currant',
    slug: 'currant',
    category: 'berry',
    imageUrl: '/plant-icons/currant.svg',
    color: '#6B2D8B',
  },
  {
    name: 'Gooseberry',
    slug: 'gooseberry',
    category: 'berry',
    imageUrl: '/plant-icons/gooseberry.svg',
    color: '#7A9E3B',
  },
  {
    name: 'Rose',
    slug: 'rose',
    category: 'flower',
    imageUrl: '/plant-icons/rose.svg',
    color: '#E91E63',
  },
  {
    name: 'Marigold',
    slug: 'marigold',
    category: 'flower',
    imageUrl: '/plant-icons/marigold.svg',
    color: '#FF8F00',
  },
  {
    name: 'Lavender',
    slug: 'lavender',
    category: 'flower',
    imageUrl: '/plant-icons/lavender.svg',
    color: '#9575CD',
  },
  {
    name: 'Sunflower',
    slug: 'sunflower',
    category: 'flower',
    imageUrl: '/plant-icons/sunflower.svg',
    color: '#FDD835',
  },
  {
    name: 'Tulip',
    slug: 'tulip',
    category: 'flower',
    imageUrl: '/plant-icons/tulip.svg',
    color: '#F06292',
  },
  {
    name: 'Basil',
    slug: 'basil',
    category: 'herb',
    imageUrl: '/plant-icons/basil.svg',
    color: '#388E3C',
  },
  {
    name: 'Mint',
    slug: 'mint',
    category: 'herb',
    imageUrl: '/plant-icons/mint.svg',
    color: '#26A69A',
  },
  {
    name: 'Parsley',
    slug: 'parsley',
    category: 'herb',
    imageUrl: '/plant-icons/parsley.svg',
    color: '#558B2F',
  },
  {
    name: 'Dill',
    slug: 'dill',
    category: 'herb',
    imageUrl: '/plant-icons/dill.svg',
    color: '#7CB342',
  },
  {
    name: 'Rosemary',
    slug: 'rosemary',
    category: 'herb',
    imageUrl: '/plant-icons/rosemary.svg',
    color: '#5C7A3E',
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

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const prisma = new PrismaClient();

// Helper to read CSV into array
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Helper to process arrays in chunks for createMany
async function seedInChunks(model, data, chunkSize = 10000) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await model.createMany({
      data: chunk
    });
    console.log(`Seeded ${Math.min(i + chunkSize, data.length)} / ${data.length} records`);
  }
}

async function main() {
  const dataDir = path.join(__dirname, '..', '..', 'cleaned_data');
  
  console.log("Reading CSV files...");
  const statesRaw = await readCSV(path.join(dataDir, 'states.csv'));
  const districtsRaw = await readCSV(path.join(dataDir, 'districts.csv'));
  const subDistrictsRaw = await readCSV(path.join(dataDir, 'sub_districts.csv'));
  const villagesRaw = await readCSV(path.join(dataDir, 'villages.csv'));

  console.log(`Loaded ${statesRaw.length} states, ${districtsRaw.length} districts, ${subDistrictsRaw.length} sub-districts, and ${villagesRaw.length} villages.`);

  // Map to Prisma schema shape
  const states = statesRaw.map(s => ({
    id: parseInt(s.state_code),
    name: s.state_name
  }));

  const districts = districtsRaw.map(d => ({
    id: parseInt(d.district_code),
    name: d.district_name,
    stateId: parseInt(d.state_code)
  }));

  const subDistricts = subDistrictsRaw.map(sd => ({
    id: parseInt(sd.sub_district_code),
    name: sd.sub_district_name,
    districtId: parseInt(sd.district_code)
  }));

  const villages = villagesRaw.map(v => ({
    id: parseInt(v.village_code),
    name: v.village_name,
    subDistrictId: parseInt(v.sub_district_code)
  }));

  console.log("Clearing existing data...");
  await prisma.village.deleteMany();
  await prisma.subDistrict.deleteMany();
  await prisma.district.deleteMany();
  await prisma.state.deleteMany();

  console.log("Seeding States...");
  await seedInChunks(prisma.state, states);

  console.log("Seeding Districts...");
  await seedInChunks(prisma.district, districts);

  console.log("Seeding SubDistricts...");
  await seedInChunks(prisma.subDistrict, subDistricts);

  console.log("Seeding Villages (This might take a while)...");
  await seedInChunks(prisma.village, villages);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

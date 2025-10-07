import { db } from "./db";
import { organizations, users, memberships, animals, people, medicalSchedule, applications, locations, fosterAssignments } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("Seeding database...");

  // Create demo organization
  const [org] = await db.insert(organizations).values({
    name: "Kirby Demo Shelter",
    address: "123 Shelter Lane, Pet City, PC 12345",
    settings: { allowPublicAdoptions: true }
  }).returning();

  console.log("Created organization:", org.name);

  // Create main location
  const [mainLocation] = await db.insert(locations).values({
    organizationId: org.id,
    name: "Main Shelter",
    type: "shelter"
  }).returning();

  // Create users with different roles
  const hashedPassword = await hashPassword("demo-only");
  
  const [adminUser] = await db.insert(users).values({
    name: "Staff Admin",
    email: "staff@demo.kirby.org",
    password: hashedPassword,
  }).returning();

  const [fosterUser] = await db.insert(users).values({
    name: "Foster User",
    email: "foster@demo.kirby.org",
    password: hashedPassword,
  }).returning();

  const [volunteerUser] = await db.insert(users).values({
    name: "Volunteer User",
    email: "volunteer@demo.kirby.org",
    password: hashedPassword,
  }).returning();

  // Create memberships
  await db.insert(memberships).values([
    { userId: adminUser.id, organizationId: org.id, role: 'admin' },
    { userId: fosterUser.id, organizationId: org.id, role: 'foster' },
    { userId: volunteerUser.id, organizationId: org.id, role: 'volunteer' },
  ]);

  console.log("Created users and memberships");

  // Create 50 animals
  const animalNames = [
    "Buddy", "Luna", "Max", "Bella", "Charlie", "Lucy", "Cooper", "Daisy",
    "Rocky", "Molly", "Bear", "Sadie", "Duke", "Sophie", "Zeus", "Chloe",
    "Oliver", "Lily", "Jack", "Zoe", "Milo", "Penny", "Leo", "Rosie",
    "Teddy", "Ruby", "Tucker", "Maggie", "Bentley", "Stella", "Toby", "Nala",
    "Finn", "Coco", "Winston", "Pepper", "Jasper", "Princess", "Oscar", "Abby",
    "Rex", "Emma", "Simba", "Angel", "Murphy", "Gracie", "Gus", "Harley", "Shadow", "Misty"
  ];

  const breeds = {
    dog: ["Labrador Mix", "German Shepherd", "Beagle", "Bulldog", "Golden Retriever", "Husky Mix", "Terrier Mix"],
    cat: ["Domestic Shorthair", "Tabby", "Siamese Mix", "Persian", "Calico", "Tuxedo"]
  };

  for (let i = 0; i < 50; i++) {
    const species = i % 2 === 0 ? 'dog' : 'cat';
    const breedList = breeds[species];
    const statusOptions: ('available' | 'fostered' | 'hold')[] = ['available', 'fostered', 'hold'];
    
    await db.insert(animals).values({
      organizationId: org.id,
      name: animalNames[i],
      species: species as 'dog' | 'cat',
      breed: breedList[Math.floor(Math.random() * breedList.length)],
      sex: Math.random() > 0.5 ? 'Male' : 'Female',
      color: ['Brown', 'Black', 'White', 'Orange', 'Gray', 'Mixed'][Math.floor(Math.random() * 6)],
      dobEst: new Date(Date.now() - Math.random() * 365 * 5 * 24 * 60 * 60 * 1000),
      intakeDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      status: statusOptions[Math.floor(Math.random() * 3)],
      locationId: mainLocation.id,
      description: `Friendly and playful ${species}. Great with families!`,
    });
  }

  console.log("Created 50 animals");

  // Get all animals for medical tasks, applications, and foster assignments
  const someAnimals = await db.select().from(animals).limit(50);

  // Create medical tasks - some due today, some overdue
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (let i = 0; i < 10; i++) {
    const medicalTypes: ('vaccine' | 'treatment' | 'exam')[] = ['vaccine', 'treatment', 'exam'];
    await db.insert(medicalSchedule).values({
      animalId: someAnimals[i].id,
      type: medicalTypes[Math.floor(Math.random() * 3)],
      dueDate: today,
      status: 'scheduled',
      notes: 'Regular checkup required'
    });
  }

  // Create overdue tasks
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  for (let i = 10; i < 16; i++) {
    const overdueTypes: ('vaccine' | 'treatment')[] = ['vaccine', 'treatment'];
    await db.insert(medicalSchedule).values({
      animalId: someAnimals[i].id,
      type: overdueTypes[Math.floor(Math.random() * 2)],
      dueDate: yesterday,
      status: 'scheduled',
      notes: 'Overdue - needs attention'
    });
  }

  console.log("Created medical tasks");

  // Create people (adopters, fosters)
  const peopleData: Array<{
    organizationId: string;
    name: string;
    email: string;
    phone: string;
    type: 'foster' | 'adopter';
    flags: any;
  }> = [];
  for (let i = 0; i < 30; i++) {
    peopleData.push({
      organizationId: org.id,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      phone: `555-${String(i).padStart(4, '0')}`,
      type: (i < 15 ? 'foster' : 'adopter') as 'foster' | 'adopter',
      flags: i < 15 ? { available: i < 10, maxCapacity: 2 } : {}
    });
  }
  
  const createdPeople = await db.insert(people).values(peopleData).returning();
  console.log("Created people");

  // Create applications
  for (let i = 0; i < 8; i++) {
    const appStatuses: ('received' | 'review' | 'approved')[] = ['received', 'review', 'approved'];
    await db.insert(applications).values({
      animalId: someAnimals[i + 15].id,
      personId: createdPeople[i + 15].id,
      type: 'adoption',
      status: appStatuses[Math.floor(Math.random() * 3)],
      form: { homeType: 'house', hasYard: true, otherPets: false }
    });
  }

  console.log("Created applications");

  // Create foster assignments
  for (let i = 0; i < 15; i++) {
    if (someAnimals[i + 30] && createdPeople[i]) {
      await db.insert(fosterAssignments).values({
        animalId: someAnimals[i + 30].id,
        personId: createdPeople[i].id,
        startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    }
  }

  console.log("Created foster assignments");
  console.log("Seeding complete!");
}

seed().catch(console.error);

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    
    const lessons = await prisma.lesson.findMany();
    console.log('Lessons:', lessons.length);
    
    const quests = await prisma.quest.findMany();
    console.log('Quests:', quests.length);
    
    const exercises = await prisma.exercise.findMany();
    console.log('Exercises:', exercises.length);
    
    console.log('✅ Database is working correctly!');
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
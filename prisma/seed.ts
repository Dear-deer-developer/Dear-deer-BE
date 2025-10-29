import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding: Letter Papers...`);

  // 1부터 11까지의 편지지 데이터를 생성합니다.
  const paperCount = 11;

  for (let i = 1; i <= paperCount; i++) {
    const paperName = `letter_paper_${i}`;

    // upsert를 사용하여 중복 생성을 방지합니다.
    // name 필드가 unique이므로 where 조건으로 사용할 수 있습니다.
    const paper = await prisma.letterPaper.upsert({
      where: { name: paperName }, // 이 이름으로 편지지가 있는지 검색
      update: {}, // 이미 있다면 아무것도 변경하지 않음
      create: {
        // 없다면 새로 생성
        name: paperName,
      },
    });
    console.log(
      `Created or found letter paper: ${paper.name} (ID: ${paper.id})`,
    );
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 스크립트가 끝나면 DB 연결을 종료
    await prisma.$disconnect();
  });

import { PrismaClient, Prisma, GiftCategory, LoginType } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();
const EVENT_TZ = 'Asia/Seoul'; // 캘린더 이벤트 기준 타임존 (KST)

// ----------------------------------------------------
// I. 상수 및 데이터 정의
// ----------------------------------------------------

// [A] 산타 유저 상수 (Santa User Constants)
const SANTA_NICKNAME = '산타클로스';
const SANTA_ZIPCODE = 12025; // 예시 번호 (생성 로직에서 제외하는 번호와는 다름)
const SANTA_PROVIDER_ID = 'santa_claus_official';

// [B] Music 데이터 (Snippet 6)
const musicData: Prisma.MusicCreateInput[] = [
  { title: 'O Christmas Tree (Instrumental)', artist: 'Jingle Punks' },
  { title: 'Jingle Bells (Instrumental)', artist: 'Jingle Punks' },
  { title: 'Deck the Halls (Instrumental)', artist: 'Jingle Punks' },
  { title: 'Silent Night (Instrumental Jazz)', artist: "E's Jammy Jams" },
  {
    title: 'We Wish You a Merry Christmas (Instrumental Jazz)',
    artist: "E's Jammy Jams",
  },
  { title: 'Christmas Village', artist: 'Aaron Kenny' },
];

// [C] Letter Paper 데이터 (Snippet 3)
const paperCount = 12;

// [D] Gift 데이터 (Snippet 1)
const giftsData = [
  { name: 'ball_1', category: GiftCategory.ORNAMENT },
  { name: 'icecream', category: GiftCategory.ORNAMENT },
  { name: 'heart', category: GiftCategory.ORNAMENT },
  { name: 'latte', category: GiftCategory.ORNAMENT },
  { name: 'carpet_1', category: GiftCategory.CARPET },
  { name: 'snowman', category: GiftCategory.ORNAMENT },
  { name: 'garland_1', category: GiftCategory.GARLAND },
  { name: 'candlelight', category: GiftCategory.ORNAMENT },
  { name: 'wallpaper_1', category: GiftCategory.WALLPAPER },
  { name: 'candy', category: GiftCategory.ORNAMENT },
  { name: 'electric_bulb_1', category: GiftCategory.ELECTRIC_BULB },
  { name: 'train', category: GiftCategory.ORNAMENT },
  { name: 'smile_star', category: GiftCategory.STAR },
  { name: 'bread', category: GiftCategory.ORNAMENT },
  { name: 'santa', category: GiftCategory.ORNAMENT },
  { name: 'snowflake', category: GiftCategory.ORNAMENT },
  { name: 'cake', category: GiftCategory.ORNAMENT },
  { name: 'carousel', category: GiftCategory.ORNAMENT },
  { name: 'cat', category: GiftCategory.ANIMAL },
  { name: 'bell', category: GiftCategory.ORNAMENT },
  { name: 'macaroon', category: GiftCategory.ORNAMENT },
  { name: 'wallpaper_2', category: GiftCategory.WALLPAPER },
  { name: 'gift_package', category: GiftCategory.GIFTBOX },
  { name: 'pink_star', category: GiftCategory.STAR },
  { name: 'carpet_2', category: GiftCategory.CARPET },
  { name: 'ball_2', category: GiftCategory.ORNAMENT },
  { name: 'mistletoe', category: GiftCategory.ORNAMENT },
  { name: 'electric_bulb_2', category: GiftCategory.ELECTRIC_BULB },
  { name: 'angel', category: GiftCategory.ORNAMENT },
  { name: 'ball_3', category: GiftCategory.ORNAMENT },
  { name: 'cookie', category: GiftCategory.ORNAMENT },
  { name: 'wallpaper_3', category: GiftCategory.WALLPAPER },
  { name: 'socks', category: GiftCategory.ORNAMENT },
  { name: 'candy_gift', category: GiftCategory.ORNAMENT },
  { name: 'snowball', category: GiftCategory.ORNAMENT },
  { name: 'ribbon', category: GiftCategory.ORNAMENT },
  { name: 'garland_2', category: GiftCategory.GARLAND },
  { name: 'pine_cone', category: GiftCategory.ORNAMENT },
  { name: 'gloves', category: GiftCategory.ORNAMENT },
  { name: 'dog', category: GiftCategory.ANIMAL },
  { name: 'two_bells', category: GiftCategory.ORNAMENT },
  { name: 'blue_star', category: GiftCategory.STAR },
  { name: 'electric_bulb_3', category: GiftCategory.ELECTRIC_BULB },
  { name: 'wallpaper_4', category: GiftCategory.WALLPAPER },
  { name: 'sugar_loaf', category: GiftCategory.ORNAMENT },
  { name: 'deer', category: GiftCategory.ORNAMENT },
  { name: 'santa_train', category: GiftCategory.TRAIN },
  { name: 'fairy_hat', category: GiftCategory.ORNAMENT },
  { name: 'cupcake', category: GiftCategory.ORNAMENT },
  { name: 'donuts', category: GiftCategory.ORNAMENT },
  { name: 'carpet_3', category: GiftCategory.CARPET },
  { name: 'ball_4', category: GiftCategory.ORNAMENT },
  { name: 'penguin', category: GiftCategory.ORNAMENT },
  { name: 'ginger_cookie', category: GiftCategory.ORNAMENT },
  { name: 'santa_letter_trigger', category: GiftCategory.EVENT }, // 👈 55번째 (Day 55)
];

const capacityByCategory = {
  ORNAMENT: 12,
  STAR: 1,
  ELECTRIC_BULB: 1,
  WALLPAPER: 1,
  GARLAND: 1,
  CARPET: 1,
  TRAIN: 1,
  GIFTBOX: 1,
  ANIMAL: 1,
  // EVENT는 장착 불가이므로 제외
};

// ----------------------------------------------------
// II. Seed Helper Functions
// ----------------------------------------------------

/** [5번] 산타 유저 생성 */
async function seedSantaUser() {
  const santaUser = await prisma.user.upsert({
    where: { providerId: SANTA_PROVIDER_ID },
    update: {},
    create: {
      nickname: SANTA_NICKNAME,
      zipCode: SANTA_ZIPCODE,
      loginType: LoginType.SOCIAL,
      providerId: SANTA_PROVIDER_ID,
      isAdmin: true,
    },
  });
  console.log(`[User] Upserted Santa User (ID: ${santaUser.id})`);
}

/** [3번] 편지지 데이터 생성 */
async function seedLetterPapers() {
  console.log(`Start seeding Letter Papers...`);
  for (let i = 1; i <= paperCount; i++) {
    const paperName = `letter_paper_${i}`;
    await prisma.letterPaper.upsert({
      where: { name: paperName },
      update: {},
      create: { name: paperName },
    });
  }
  console.log(`[LetterPaper] Created ${paperCount} papers.`);
}

/** [6번] 음악 데이터 생성 */
async function seedMusic() {
  console.log(`Start seeding music...`);
  for (const music of musicData) {
    const existingMusic = await prisma.music.findFirst({
      where: { title: music.title },
    });

    if (!existingMusic) {
      await prisma.music.create({
        data: { title: music.title, artist: music.artist },
      });
    }
  }
  console.log(`[Music] Seeding finished.`);
}

/** [1번] 선물 카탈로그 및 장착 규칙 생성 */
async function seedGiftsAndRules() {
  console.log(`Start seeding Gifts and Equip Rules...`);

  await prisma.$transaction(async (tx) => {
    // (A) Gift 카탈로그 upsert
    for (const g of giftsData) {
      await tx.gift.upsert({
        where: { name: g.name },
        create: g,
        update: { category: g.category },
      });
    }

    // (B) 용량 규칙 upsert
    for (const [k, cap] of Object.entries(capacityByCategory)) {
      await tx.equipCategoryRule.upsert({
        where: { category: k as GiftCategory },
        create: { category: k as GiftCategory, capacity: cap },
        update: { capacity: cap },
      });

      // (C) 슬롯 집합: 초과 슬롯 정리 및 1..capacity 슬롯 보장
      await tx.userEquipSlot.deleteMany({
        where: { category: k as GiftCategory, slot: { gt: cap } },
      });
      await tx.equipCategorySlot.deleteMany({
        where: { category: k as GiftCategory, slot: { gt: cap } },
      });

      for (let s = 1; s <= cap; s++) {
        await tx.equipCategorySlot.upsert({
          where: { category_slot: { category: k as GiftCategory, slot: s } },
          create: { category: k as GiftCategory, slot: s },
          update: {},
        });
      }
    }
  });
  console.log(`[Gift] Upserted ${giftsData.length} gifts and equip rules.`);
}

/** [2번] 캘린더 보상 계획 생성 */
async function seedCalendarPlans(
  startYmd: string,
  days: number,
  label: string,
) {
  // Gift id 55개 확보 (ID 순서대로 매칭하기 위해)
  const gifts = await prisma.gift.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
    take: days,
  });
  if (gifts.length < days) {
    throw new Error(`Gift가 ${days}개 필요합니다. 현재 ${gifts.length}개`);
  }

  // 날짜 배열 생성
  const start = DateTime.fromISO(startYmd, { zone: EVENT_TZ }).startOf('day');
  const dates = Array.from(
    { length: days },
    (_, i) => new Date(start.plus({ days: i }).toISODate()!),
  );

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < days; i++) {
      await tx.calendarRewardPlan.upsert({
        where: { localDate: dates[i] },
        create: { localDate: dates[i], giftId: gifts[i].id },
        update: { giftId: gifts[i].id },
      });
    }
  });

  const endYmd = dates[dates.length - 1].toISOString().slice(0, 10);
  console.log(
    `[Plan] ${label}: ${startYmd} ~ ${endYmd} (총 ${dates.length}일)`,
  );
}

// ----------------------------------------------------
// III. Main Execution
// ----------------------------------------------------

async function main() {
  console.log('\n--- Starting All Seeding Processes ---');

  // 1. Core System Data
  await seedSantaUser();
  await seedLetterPapers();
  await seedMusic();

  // 2. Core Item Catalog (필수 선행 작업)
  await seedGiftsAndRules();

  // 3. Dependent Plan Data (Gift catalog의 ID가 1부터 순서대로 있다고 가정)
  const totalDays = giftsData.length; // 55일
  await seedCalendarPlans('2025-11-01', totalDays, 'Release Plan');

  console.log('\n--- Seeding Complete ---');
  const finalGiftCount = await prisma.gift.count();
  const finalRulesCount = await prisma.equipCategoryRule.count();
  const finalPlanCount = await prisma.calendarRewardPlan.count();
  console.log(
    `\nFinal Summary: Gifts=${finalGiftCount}, Rules=${finalRulesCount}, Plans=${finalPlanCount}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

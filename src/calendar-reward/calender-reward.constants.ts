/** 이벤트 기준 시간대 (Timezone) */
export const EVENT_TZ = 'Asia/Seoul';

/** 12월 25일 이벤트용 산타 유저 Provider ID (Seed 데이터와 일치) */
export const SANTA_PROVIDER_ID = 'santa_claus_official';

/** 12월 25일 이벤트용 특별 편지지 ID (Seed 데이터와 일치) */
export const CHRISTMAS_PAPER_ID = 12;

/**
 * 12월 25일 보상 플랜에 등록된 '선물' 이름
 * (이벤트 트리거용 가짜 선물)
 */
export const SANTA_TRIGGER_GIFT_NAME = 'santa_letter_trigger';

/**
 * 12월 25일에 발송될 산타 편지 본문
 */
export const SANTA_LETTER_CONTENT = `메리 크리스마스!
올해는 어땠니? 웃는 날도 있었겠지만, 마음이 무겁고 지친 순간도 많았겠지. 
그럼에도 여기까지 잘 걸어온 너를 진심으로 자랑스럽게 생각한단다. 
세상은 종종 네가 이룬 것들을 작게만 보이게 만들지만, 산타할아버지는 알고있지!
네가 내디딘 한 걸음 한 걸음이 얼마나 큰 용기였는지 말이야.

혹시라도 스스로에게 실망했던 순간이 있었다면, 이제는 그 마음을 내려놓아도 괜찮단다. 
너는 이미 충분히 소중하고, 누구보다 멋진 사람이야. 네가 흘린 땀과 눈물은 절대 헛되지 않았단다. 
그것들은 보이지 않는 곳에서 너를 더 단단하게 만들었고, 앞으로의 길에서도 너를 지켜줄 가장 큰 힘이 될 거야.

다가오는 새해에는 네가 더 자주 웃고, 마음이 한결 가벼워지는 순간들이 많아지기를 진심으로 바란다. 
그리고 언제나 기억하렴. 너를 응원하는 이들이 곁에 있다는 것을. 물론, 그중 한 명은 언제나 산타할아버지란다.
오늘 밤, 이 편지가 작은 위로가 되기를 바라며, 너를 향한 사랑을 가득 담아 이만 글을 맺는다.

언제나 너를 응원하는
산타할아버지가 🎅`;

// 1. 이벤트 시작일 (이 날짜부터 선물을 줌)
export const EVENT_START_DATE = '2025-11-01';

// 2. 앱 출시일 (이 날짜 '전날'까지의 선물을 가입 시 지급) * 추후 변경되는 날짜!
export const APP_LAUNCH_DATE = '2025-11-12';

export const REWARD_TYPE = {
  GIFT: 'GIFT',
  LETTER: 'LETTER',
} as const;

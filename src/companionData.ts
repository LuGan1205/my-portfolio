export type CompanionId =
  | 'calico'
  | 'corgi'
  | 'rabbit'
  | 'hamster'
  | 'cockatiel'
  | 'ferret';

export type Companion = {
  id: CompanionId;
  name: string;
  personality: string;
  greeting: string;
  playMessage: string;
  cell: readonly [column: 0 | 1 | 2, row: 0 | 1];
};

export const companions: readonly Companion[] = [
  {
    id: 'calico',
    name: '三花猫',
    personality: '好奇',
    greeting: '你终于来啦。',
    playMessage: '它找到了一只看不见的纸箱。',
    cell: [0, 0],
  },
  {
    id: 'corgi',
    name: '柯基',
    personality: '热情',
    greeting: '今天也一起逛逛吧！',
    playMessage: '它开心地追起了光点。',
    cell: [1, 0],
  },
  {
    id: 'rabbit',
    name: '垂耳兔',
    personality: '害羞',
    greeting: '我可以待在这里吗？',
    playMessage: '它轻轻抖了抖耳朵。',
    cell: [2, 0],
  },
  {
    id: 'hamster',
    name: '金丝熊',
    personality: '贪吃',
    greeting: '我带了一块小饼干。',
    playMessage: '它把小饼干藏进了口袋。',
    cell: [0, 1],
  },
  {
    id: 'cockatiel',
    name: '玄凤鹦鹉',
    personality: '话多',
    greeting: '你好——你好——',
    playMessage: '它歪着头学你说话。',
    cell: [1, 1],
  },
  {
    id: 'ferret',
    name: '雪貂',
    personality: '调皮',
    greeting: '别眨眼，我跑得很快。',
    playMessage: '它差点把鼠标光标叼走。',
    cell: [2, 1],
  },
] as const;

export function findCompanion(id: CompanionId) {
  return companions.find((companion) => companion.id === id) ?? companions[0];
}

export function getCompanionSpritePosition(companion: Companion) {
  const [column, row] = companion.cell;

  return {
    backgroundPosition: `${column * 50}% ${row * 100}%`,
  };
}

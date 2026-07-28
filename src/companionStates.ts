export const companionStates = [
  {
    id: 'idle',
    label: '待机',
    message: '我就在这里陪你。',
  },
  {
    id: 'walking',
    label: '走动',
    message: '一起去页面里转转吧。',
  },
  {
    id: 'sleepy',
    label: '困倦',
    message: '唔……有一点困了。',
  },
  {
    id: 'happy',
    label: '开心',
    message: '今天也很喜欢和你待在一起。',
  },
  {
    id: 'disturbed',
    label: '被打扰',
    message: '欸，慢一点，我会晕。',
  },
] as const;

export type CompanionState = (typeof companionStates)[number]['id'];


import { Pet, PetType, Gender, PetSize, Story } from './types';

export const PETS: Pet[] = [
  {
    id: '1',
    name: 'Bella',
    breed: '黃金獵犬',
    age: '2 歲',
    ageGroup: '成年',
    gender: Gender.FEMALE,
    size: PetSize.LARGE,
    location: '台北市',
    distance: '2.5 公里外',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    type: PetType.DOG,
    isFeatured: true,
    isVaccinated: true,
    isNeutered: true,
    description: 'Bella 是一隻熱愛陽光的狗狗，喜歡在海灘散步和追網球。牠非常親人，儘管體型不小，但總以為自己是隻膝上狗。',
    adoptionFee: 150,
    tags: ['愛玩', '對小孩友善', '已訓練', '活潑']
  },
  {
    id: '2',
    name: 'Milo',
    breed: '美國短毛貓',
    age: '8 個月',
    ageGroup: '幼年',
    gender: Gender.MALE,
    size: PetSize.SMALL,
    location: '新北市',
    distance: '5.1 公里外',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    type: PetType.CAT,
    isVaccinated: true,
    isNeutered: false,
    description: 'Milo 是一隻愛撒嬌的小貓，特別喜歡玩雷射筆，是一個完美的公寓伴侶。',
    adoptionFee: 100,
    tags: ['愛撒嬌', '安靜']
  },
  {
    id: '3',
    name: 'Rocky',
    breed: '巴哥',
    age: '4 歲',
    ageGroup: '成年',
    gender: Gender.MALE,
    size: PetSize.SMALL,
    location: '台中市',
    distance: '1.2 公里外',
    imageUrl: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&q=80&w=800',
    type: PetType.DOG,
    isVaccinated: true,
    isNeutered: true,
    description: 'Rocky 是一隻穩重的巴哥混種，非常有規矩，適合新手領養。',
    adoptionFee: 120,
    tags: ['穩重', '已訓練']
  },
  {
    id: '4',
    name: 'Charlie',
    breed: '小獵犬',
    age: '2 歲',
    ageGroup: '成年',
    gender: Gender.MALE,
    size: PetSize.MEDIUM,
    location: '桃園市',
    distance: '5 英里',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    type: PetType.DOG,
    isVaccinated: true,
    isNeutered: true,
    description: 'Charlie 是個充滿好奇心的小傢伙。',
    adoptionFee: 130,
    tags: ['好奇', '愛跑']
  },
  {
    id: '5',
    name: 'Luna',
    breed: '薩摩耶',
    age: '6 歲',
    ageGroup: '老年',
    gender: Gender.FEMALE,
    size: PetSize.LARGE,
    location: '台北市',
    distance: '3.0 公里外',
    imageUrl: 'https://images.unsplash.com/photo-1529429617329-8a737053918e?auto=format&fit=crop&q=80&w=800',
    type: PetType.DOG,
    isVaccinated: true,
    isNeutered: true,
    description: 'Luna 是一隻溫柔的大白熊，喜歡和人撒嬌。',
    adoptionFee: 200,
    tags: ['溫柔', '親人']
  },
  {
    id: '6',
    name: 'Kiki',
    breed: '布偶貓',
    age: '1 歲',
    ageGroup: '幼年',
    gender: Gender.FEMALE,
    size: PetSize.MEDIUM,
    location: '台南市',
    distance: '10 公里外',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    type: PetType.CAT,
    isVaccinated: true,
    isNeutered: true,
    description: 'Kiki 是一隻非常漂亮的布偶貓，性格溫順。',
    adoptionFee: 180,
    tags: ['安靜', '氣質']
  }
];

export const STORIES: Story[] = [
  {
    id: 's1',
    author: 'Sarah',
    petName: 'Luna',
    content: 'Luna 為我們的生活帶來了無限歡樂！謝謝你們協助我們找到她。',
    imageUrl: 'https://picsum.photos/seed/sarah/200/200',
    color: 'bg-primary/5'
  },
  {
    id: 's2',
    author: 'Mike',
    petName: 'Oliver',
    content: '遇見 Oliver 之前我不認為自己是貓派，但他是我最好的夥伴。',
    imageUrl: 'https://picsum.photos/seed/mike/200/200',
    color: 'bg-accent-peach/10'
  }
];

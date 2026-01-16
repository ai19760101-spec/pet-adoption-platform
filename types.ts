
export enum PetType {
  DOG = '狗狗',
  CAT = '貓咪',
  BIRD = '鳥類',
  RABBIT = '兔子',
  OTHER = '其他'
}

export enum Gender {
  MALE = '公',
  FEMALE = '母'
}

export enum PetSize {
  SMALL = '小型',
  MEDIUM = '中型',
  LARGE = '大型'
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  ageGroup: '幼年' | '成年' | '老年';
  gender: Gender;
  size: PetSize;
  location: string;
  distance: string;
  imageUrl: string;
  type: PetType;
  isFeatured?: boolean;
  isVaccinated: boolean;
  isNeutered: boolean;
  description: string;
  adoptionFee: number;
  tags: string[];
}

export interface Story {
  id: string;
  author: string;
  petName: string;
  content: string;
  imageUrl: string;
  color: string;
}

export enum AppView {
  HOME = 'home',
  EXPLORE = 'explore',
  DETAILS = 'details',
  FORM = 'form',
  PROFILE = 'profile',
  FAVORITES = 'favorites',
  POST = 'post'
}

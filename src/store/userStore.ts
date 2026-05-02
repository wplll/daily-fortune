import { create } from 'zustand';
import { UserProfile, ZodiacSign } from '../types/fortune';

interface UserState {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  setZodiacSign: (sign: ZodiacSign) => void;
  setBirthDate: (date: string) => void;
  setName: (name: string) => void;
}

const defaultProfile: UserProfile = {
  name: '',
  zodiacSign: '双鱼座',
  birthDate: '',
};

export const useUserStore = create<UserState>((set) => ({
  profile: { ...defaultProfile },
  setProfile: (profile) =>
    set((state) => ({ profile: { ...state.profile, ...profile } })),
  setZodiacSign: (sign) =>
    set((state) => ({ profile: { ...state.profile, zodiacSign: sign } })),
  setBirthDate: (date) =>
    set((state) => ({ profile: { ...state.profile, birthDate: date } })),
  setName: (name) =>
    set((state) => ({ profile: { ...state.profile, name } })),
}));

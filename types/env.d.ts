declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_AVATAR_ID?: string;
      NEXT_PUBLIC_VOICE_ID?: string;
      NEXT_PUBLIC_BASE_API_URL?: string;
    }
  }
}

export {};

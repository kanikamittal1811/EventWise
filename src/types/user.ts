export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  preferences?: {
    defaultCurrency?: string;
    notificationsEnabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
}


export type VisaMaster = {
  visaCode: string;
  visaName: string;
  visaCategory: string;
  description: string;
  active: boolean;
};

export type TempProfile = {
  id: number;
  sessionId: string;
  nationality: string;
  visaType: string;
  language: string;
  expiresAt: string;
};


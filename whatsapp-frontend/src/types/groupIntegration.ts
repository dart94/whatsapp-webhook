export type GroupIntegration = {
  id: number;
  phoneNumberId: string;
  accessTokenId: string;
  Waba_id: string;
  groupId: number;
  group?: { id: number; name: string } | null;
};

export type CreateGroupIntegrationInput = {
  phoneNumberId: string;
  accessTokenId: string;
  groupId: number;
  Waba_id: string;
}

export interface GroupIntegrationCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export interface GroupIntegrationEditProps {
  isOpen: boolean;
  onClose: (updated?: boolean) => void;
  group: GroupIntegration;
  onUpdated?: () => void;
}

export interface Group {
    id: number;
    name: string;
    groupId?: number;
}

export interface CreateGroupInput {
    name: string;
}

export interface GroupCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export interface GroupEditProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onUpdated?: () => void;
}
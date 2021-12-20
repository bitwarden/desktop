export class MenuUpdateRequest {
  hideChangeMasterPassword: boolean;
  activeUserId: string;
  accounts: { [userId: string]: MenuAccount };
}

export class MenuAccount {
  isAuthenticated: boolean;
  isLocked: boolean;
  userId: string;
  email: string;
}

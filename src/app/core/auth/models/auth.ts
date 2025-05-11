export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const UNKNOW_USER: User = {
  id: '',
  email: '',
};

export class User {
  _id: string;
  name?: string;
  email?: string;
  password?: string;
  address?: string;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }
}

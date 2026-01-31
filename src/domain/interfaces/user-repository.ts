import { User, UserRole } from '../entities/user';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: UserRole): Promise<User[]>;
  update(user: User): Promise<User>;
  deactivate(id: string): Promise<void>;
}

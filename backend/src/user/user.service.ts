import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByKiwifyOrderId(orderId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { kiwifyOrderId: orderId } });
  }

  async createOrUpdateFromKiwify(data: {
    email: string;
    name: string;
    kiwifyOrderId: string;
  }): Promise<User> {
    let user = await this.findByEmail(data.email);

    if (!user) {
      user = this.userRepo.create({
        email: data.email,
        name: data.name,
        hasPaid: true,
        kiwifyOrderId: data.kiwifyOrderId,
      });
    } else {
      user.hasPaid = true;
      user.kiwifyOrderId = data.kiwifyOrderId;
      if (data.name) user.name = data.name;
    }

    return this.userRepo.save(user);
  }

  async revokeAccess(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (user) {
      user.hasPaid = false;
      await this.userRepo.save(user);
    }
  }

  isAccessActive(user: User): boolean {
    return user.hasPaid === true;
  }
}

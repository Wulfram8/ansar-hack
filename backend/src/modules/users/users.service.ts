import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<User>> {
    const where: FindOptionsWhere<User> = {};

    if (paginationDto.search) {
      // TypeORM doesn't support OR directly in FindOptionsWhere with multiple fields easily
      // Using queryBuilder for search
    }

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (paginationDto.search) {
      queryBuilder.where(
        'user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search',
        { search: `%${paginationDto.search}%` },
      );
    }

    if (paginationDto.sortBy) {
      queryBuilder.orderBy(
        `user.${paginationDto.sortBy}`,
        paginationDto.sortOrder || 'DESC',
      );
    } else {
      queryBuilder.orderBy('user.created_at', 'DESC');
    }

    queryBuilder.skip(paginationDto.skip).take(paginationDto.limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    return new PaginatedResponse(users, total, paginationDto);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}

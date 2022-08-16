import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { UpdateUserInterface } from './interfaces/user-updated.interface';
import { User } from './user.entity';
import { hashSync } from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {}

  async find(): Promise<User[]> {
    return this.userRepository.find();
  }

  async store(data: CreateUserInput): Promise<User> {
    if (!data) {
      throw new HttpException('Data Empty', HttpStatus.BAD_REQUEST);
    }

    const userCreated = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (userCreated) {
      throw new HttpException(
        'email is already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = this.userRepository.create(data);

    const userSaved = await this.userRepository.save(user);

    if (!userSaved) {
      throw new InternalServerErrorException(
        'Error to create user try again later...',
      );
    }

    return userSaved;
  }
  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`USER NOT FOUND`);
    }
    return user;
  }
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`USER NOT FOUND`);
    }
    return user;
  }
  async updateUser(
    id: string,
    data: UpdateUserInput,
  ): Promise<UpdateUserInterface> {
    if (!data) {
      throw new HttpException('Data Empty', HttpStatus.BAD_REQUEST);
    }

    const user = await this.findUserById(id);

    if (data.password) data.password = hashSync(data.password, 10);

    await this.userRepository.update(id, data);

    const userUpdated = this.userRepository.create({ ...user, ...data });

    return userUpdated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.findUserById(id);

    if (user) {
      await this.userRepository.delete(id);
      return true;
    }
    return false;
  }
}

import { PickType } from '@nestjs/mapped-types';
import { GlobalDto } from 'src/common/dto/global.dto';

export class UpdateProfileDto extends PickType(GlobalDto, [
  'name',
  'username',
  'email',
  'phone',
] as const) {}

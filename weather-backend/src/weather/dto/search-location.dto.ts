import { IsString, MinLength } from 'class-validator';

export class SearchLocationDto {
  @IsString()
  @MinLength(2)
  query!: string;
}
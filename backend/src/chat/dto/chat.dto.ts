import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(2000)
  message: string;
}

export class ChatResponseDto {
  reply: string;
}

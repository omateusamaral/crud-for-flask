import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNumberString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'SKU123', description: 'SKU do produto' })
  sku: string;

  @IsString()
  @ApiProperty({
    example: 'Notebook Dell XPS 13',
    description: 'Nome do produto',
  })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ example: 10, description: 'Quantidade em estoque' })
  quantity?: number;

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ example: 5999.99, description: 'Preço do produto' })
  price?: string;
}

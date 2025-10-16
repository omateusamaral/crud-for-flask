import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AdjustStockDto {
  @IsInt()
  @ApiProperty({ example: 5, description: 'Quantidade a ajustar no estoque' })
  amount: number;
}

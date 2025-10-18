import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Param,
    Patch,
    Delete,
    Put,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { ProductsPage } from './products.interface';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller({
    version: '1',
    path: 'products',
})
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @ApiResponse({
        status: 201,
        description: 'Produto criado com sucesso',
        type: Product,
    })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Lista de produtos com paginação',
        type: ProductsPage,
    })
    findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
        const p = parseInt(page, 10) || 1;
        const l = Math.min(parseInt(limit, 10) || 20, 100);
        return this.productsService.findAll(p, l);
    }

    @Get(':id')
    @ApiResponse({
        status: 200,
        description: 'Produto encontrado',
        type: Product,
    })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @ApiResponse({
        status: 200,
        description: 'Produto atualizado com sucesso',
        type: Product,
    })
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiResponse({
        status: 204,
        description: 'Produto removido com sucesso',
    })
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }

    @Patch(':id/adjust-stock')
    @ApiResponse({
        status: 200,
        description: 'Estoque ajustado com sucesso',
        type: Product,
    })
    adjustStock(@Param('id') id: string, @Body() body: AdjustStockDto) {
        return this.productsService.adjustStock(id, body.amount);
    }
}

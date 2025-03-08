import { IsOptional, IsString } from "class-validator";

export class SearchStockDto {
    @IsOptional()
    @IsString()
    public startDate: string;

    @IsOptional()
    @IsString()
    public endDate: string;

    @IsOptional()
    @IsString()
    public category: string;

    @IsOptional()
    @IsString()
    public subCategory: string;

    @IsOptional()
    @IsString()
    public firstPrice: string;

    @IsOptional()
    @IsString()
    public lastPrice: string;

    @IsOptional()
    @IsString()
    public grade: string;

    @IsOptional()
    @IsString()
    public searchOrderId: string;
}

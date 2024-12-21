export interface Insurance {
    id?: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    coverageLimit: number;
    coverageType: string;
    status: string;
    provider: string;

}
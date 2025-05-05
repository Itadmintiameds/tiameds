export interface TestList {
    id: number;
    category: string;
    name: string;
    price: number;
    createdAt: string;
    updatedAt: string;
}


export interface TestForm {
    category: string;
    name: string;
    price: number;
}



export interface TestReferancePoint {
    id: number;
    category: string;
    testName: string;
    testDescription: string;
    units: string;
    gender: string;
    minReferenceRange: number;
    maxReferenceRange: number;
    ageMin: number;
    ageMax: number;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface TestList {
  id: number;
  name: string;
  price: number;
  category: string;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
}

export interface TestForm {
    category: string;
    name: string;
    price?: number;
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
    ageMax?: number; 
    createdBy?: string; 
    updatedBy?: string; 
    createdAt?: string; 
    updatedAt?: string;
    minAgeUnit?: string;
    maxAgeUnit?: string;
    reportJson?: string;
    referenceRanges?: string;
}



// export interface TestReferancePoint {
//     id: number;
//     category: string;
//     testName: string;
//     testDescription: string;
//     units: string;
//     gender: string;
//     minReferenceRange: number;
//     maxReferenceRange: number;
//     ageMin: number;
//     // ageMax: number;
//     // createdBy: string;
//     // updatedBy: string;
//     // createdAt: string;
//     // updatedAt: string;
//     // minAgeUnit: string;
//     // maxAgeUnit: string;
//     ageMax?: number;
//     createdBy?: string;
//     updatedBy?: string;
//     createdAt?: string;
//     updatedAt?: string;
//     minAgeUnit?: string;
//     maxAgeUnit?: string;
// }





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
    // ageMax: number;
    // createdBy: string;
    // updatedBy: string;
    // createdAt: string;
    // updatedAt: string;
    // minAgeUnit: string;
    // maxAgeUnit: string;
    ageMax?: number; // Made optional
    createdBy?: string; // Made optional
    updatedBy?: string; // Made optional
    createdAt?: string; // Made optional
    updatedAt?: string; // Made optional
    minAgeUnit?: string; // Made optional
    maxAgeUnit?: string; // Made optional

}
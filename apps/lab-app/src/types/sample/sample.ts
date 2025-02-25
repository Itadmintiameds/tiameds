
export interface SampleList {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Sample {
    visitId: number;
    sampleNames: string[];
}


// {
//     "visitId": 49,
//     "patientname": "Jon Doe",
//     "visitDate": "2024-12-28",
//     "visitStatus": "Collected",
//     "sampleNames": [
//         "Sweat",
//         "Blood"
//     ],
//     "testIds": [
//         2,
//         1
//     ],
//     "packageIds": [
//         21
//     ]
// },

export interface VisitSampleList {
    visitId: number;
    patientname: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
}

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
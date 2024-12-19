
export interface PackageTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
};


export interface Package {
  id: number;
  packageName: string;
  price: number;
  discount: number; 
  testIds: number[];
}


// Type for the individual Test data
export interface Test {
  id: number;
  category: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Type for the Package data
export interface Packages {
  id: number;
  packageName: string;
  price: number;
  discount: number;
  tests: Test[];
  createdAt: string;
  updatedAt: string;
}

// Type for the API response
export interface PackageApiResponse {
  status: string;
  message: string;
  data: Packages[];
}


export interface updatePackage {
  packageName: string;
  price: number;
  discount: number;
  testIds: number[];

}
import { TestList } from '@/types/test/testlist';
import { FaTrashAlt } from 'react-icons/fa'; // Importing Trash icon from react-icons
import { Package } from '@/types/package/package';

// interface Package {
//   id: number;
//   packageName: string;
//   price: number;
//   discount?: number;

// }

interface PatientTestPackageProps {
  categories: string[];
  tests: TestList[];
  packages: Package[];
  selectedTests: TestList[];
  selectedPackages: Package[];
  setSelectedTests: React.Dispatch<React.SetStateAction<TestList[]>>;
  setSelectedPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  selectedCategory: string;
  handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  searchTestTerm: string;
  handleTestSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredTests: TestList[];
  handleTestSelection: (test: TestList) => void;
  handlePackageSelection: (pkg: Package) => void;
  removeTest: (testId: string) => void;
  removePackage: (packageId: string) => void;
}

const PatientTestPackage: React.FC<PatientTestPackageProps> = ({
  categories,
  packages,
  selectedTests,
  selectedPackages,
  setSelectedTests,
  setSelectedPackages,
  selectedCategory,
  handleCategoryChange,
  searchTestTerm,
  handleTestSearch,
  filteredTests,
  handleTestSelection,
  handlePackageSelection,
}) => {
  // Ensure removeTest updates the selectedTests state
  const handleRemoveTest = (testId: string) => {
    // Filter out the test with the given ID
    setSelectedTests(selectedTests.filter((test) => test.id !== Number(testId)));
  };

  // Ensure removePackage updates the selectedPackages state
  const handleRemovePackage = (packageId: string) => {
    // Filter out the package with the given ID
    setSelectedPackages(selectedPackages.filter((pkg) => pkg.id !== Number(packageId)));
  };

  return (
    <div className="font-sans">
      {/* Test and Package Selection Section */}
      <section className="mt-6 grid grid-cols-2 gap-6">
        {/* Available Tests */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 my-2">Available Tests</h3>
          {/* Filter Section for Tests */}
          <div className="flex gap-4 mb-4">
            <select
              className="border border-gray-300 p-2 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search Tests"
              value={searchTestTerm}
              onChange={handleTestSearch}
            />
          </div>
          <div className="h-48 overflow-y-auto border rounded-lg text-xs bg-gray-50">
            <table className="w-full border-collapse border text-gray-700 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Select</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Category</th>
                  <th className="border p-2 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        value={test.id.toString()}
                        checked={selectedTests.some((t) => t.id === test.id)}
                        onChange={() => handleTestSelection(test)}
                      />
                    </td>
                    <td className="border p-2">{test.name}</td>
                    <td className="border p-2">{test.category}</td>
                                           <td className="border p-2">₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Packages */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mt-16">Available Packages</h3>
          <div className="h-48 overflow-y-auto border rounded-lg bg-gray-50">
            <table className="w-full border-collapse border text-gray-700 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Select</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        value={pkg.id.toString()}
                        checked={selectedPackages.some((p) => p.id === pkg.id)}
                        onChange={() => handlePackageSelection(pkg)}
                        className='text-xs'
                      />
                    </td>
                    <td className="border p-2">{pkg.packageName}</td>
                                           <td className="border p-2">₹{isNaN(Number(pkg.price)) ? 'N/A' : Number(pkg.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
          <div> 
            <h3 className="text-xs font-semibold text-gray-700 my-2">Selected Tests</h3>
            <div className="h-40 overflow-y-auto border rounded-lg bg-gray-50">
              <table className="w-full border-collapse border text-gray-700  text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Price</th>
                    <th className="border p-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTests.map((test) => (
                    <tr key={test.id}>
                      <td className="border p-2">{test.name}</td>
                      <td className="border p-2">₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(2)}</td>
                      <td className="border p-2 text-center">
                        <button onClick={() => handleRemoveTest(test.id.toString())}>
                          <FaTrashAlt size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Packages */}
        {selectedPackages.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 my-2">Selected Packages</h3>
            <div className="h-40 overflow-y-auto border rounded-lg bg-gray-50">
              <table className="w-full border-collapse border text-gray-700 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Price</th>
                    <th className="border p-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="border p-2">{pkg.packageName}</td>
                      <td className="border p-2">₹{isNaN(Number(pkg.price)) ? 'N/A' : Number(pkg.price).toFixed(2)}</td>
                      <td className="border p-2 text-center">
                        <button onClick={() => handleRemovePackage(pkg.id.toString())}>
                          <FaTrashAlt size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientTestPackage;

  
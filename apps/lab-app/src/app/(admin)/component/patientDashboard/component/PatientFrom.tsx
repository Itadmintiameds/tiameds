import { Patient, Gender } from '@/types/patient/patient';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  formatAgeString,
  calculateAge,
  parseAgeString,
  formatDate,
  parseDateInput,
  formatToISODate,
  calculateDOB,
  calculateAgeDetails,
  validateAgeField,
  validateDOB
} from '@/utils/ageUtils';

interface PatientFormProps {
  newPatient: Patient;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  searchTerm: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPatients: Patient[];
  handlePatientSelect: (patient: Patient) => void;
  isEditMode?: boolean; // Optional prop to indicate if it's in edit mode
}

enum Prefix {
  Mr = 'Mr.',
  Mrs = 'Mrs.',
  Ms = 'Ms.',
  MS = 'M/S'
}

const PatientForm: React.FC<PatientFormProps> = ({
  newPatient,
  handleChange,
  searchTerm,
  handleSearchChange,
  filteredPatients,
  handlePatientSelect,
  isEditMode = false, // Default to false if not provided
}) => {
  const [currentPrefix, currentFirstName] = extractPrefixAndName(newPatient.firstName || '');
  const [ageDetails, setAgeDetails] = useState({
    years: '',
    months: '',
    days: ''
  });
  const [dobInput, setDobInput] = useState('');
  const [ageInputMode, setAgeInputMode] = useState<'manual' | 'dob'>('dob');
  const [lastChanged, setLastChanged] = useState<'age' | 'dob'>('dob');
  const [validationErrors, setValidationErrors] = useState({
    phone: '',
    prefix: '',
    firstName: '',
    city: '',
    years: '',
    months: '',
    days: '',
    dob: ''
  });
  const [touchedFields, setTouchedFields] = useState({
    phone: false,
    firstName: false,
    city: false,
    dob: false
  });







  // Validate phone number
  const validatePhone = useCallback((phone: string) => {
    if (!phone) return 'Phone number is required';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be 10 digits';
    return '';
  }, []);

  // Validate name
  const validateName = useCallback((name: string) => {
    if (!name) return 'Patient name is required';
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Name contains invalid characters';
    if (name.length < 2) return 'Name is too short';
    return '';
  }, []);

  // Validate city
  const validateCity = useCallback((city: string) => {
    if (!city) return 'City is required';
    if (!/^[a-zA-Z\s.'-]+$/.test(city)) return 'City contains invalid characters';
    return '';
  }, []);

  // Validate prefix
  const validatePrefix = useCallback((prefix: string) => {
    if (!prefix && currentFirstName) return 'Prefix is required when name is provided';
    return '';
  }, [currentFirstName]);

  // Validate date of birth
  const validateDOBField = useCallback((dob: string) => {
    return validateDOB(dob, dobInput);
  }, [dobInput]);



  // Initialize dobInput and ageDetails when component mounts or newPatient changes
  useEffect(() => {
    
    if (newPatient.dateOfBirth) {
      setDobInput(formatDate(newPatient.dateOfBirth));
      setAgeInputMode('dob');
      
      if (newPatient.age) {
        const parsed = parseAgeString(newPatient.age);
        console.log('Parsed age from dateOfBirth:', parsed);
        setAgeDetails({
          years: parsed.years,
          months: parsed.months,
          days: parsed.days
        });
      }
    } else {
      setDobInput('');
      if (newPatient.age) {
        const parsed = parseAgeString(newPatient.age);
        console.log('Parsed age from age field:', parsed);
        setAgeDetails({
          years: parsed.years,
          months: parsed.months,
          days: parsed.days
        });
      } else {
        setAgeDetails({
          years: '',
          months: '',
          days: ''
        });
      }
    }
  }, [newPatient.dateOfBirth, newPatient.age]);

  // Validate all fields when they change
  useEffect(() => {
    setValidationErrors(prev => ({
      ...prev,
      phone: validatePhone(newPatient.phone),
      prefix: validatePrefix(currentPrefix),
      firstName: validateName(currentFirstName),
      city: validateCity(newPatient.city),
      dob: validateDOBField(dobInput)
    }));
  }, [newPatient.phone, currentPrefix, currentFirstName, newPatient.city, dobInput, validateDOBField, validatePrefix, validatePhone, validateName, validateCity]);

  // Handle field blur events
  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Handle manual date input changes
  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/[^0-9/]/g, '');

    let formattedValue = cleanedValue;
    if (cleanedValue.length > 2 && cleanedValue.indexOf('/') === -1) {
      formattedValue = `${cleanedValue.substring(0, 2)}/${cleanedValue.substring(2)}`;
    }
    if (formattedValue.length > 5 && formattedValue.lastIndexOf('/') === 2) {
      formattedValue = `${formattedValue.substring(0, 5)}/${formattedValue.substring(5)}`;
    }

    if (formattedValue.length <= 10) {
      setDobInput(formattedValue);
      setAgeInputMode('dob');
      setLastChanged('dob');
      setTouchedFields(prev => ({ ...prev, dob: true }));

      if (formattedValue.length === 10) {
        const date = parseDateInput(formattedValue);
        if (date && !isNaN(date.getTime())) {
          const today = new Date();
          today.setHours(12, 0, 0, 0);

          if (date > today) {
            toast.error('Date of birth cannot be in the future', { autoClose: 1000, position: "top-center" });
            return;
          }

          const hundredYearsAgo = new Date();
          hundredYearsAgo.setHours(12, 0, 0, 0);
          hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
          if (date < hundredYearsAgo) {
            toast.error('Date of birth cannot be more than 100 years ago', { autoClose: 1000, position: "top-center" });
            return;
          }

          const dobEvent = {
            target: {
              name: 'dateOfBirth',
              value: formatToISODate(date)
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(dobEvent);

          const ageString = calculateAge(formatToISODate(date));
          const ageEvent = {
            target: {
              name: 'age',
              value: ageString
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(ageEvent);
          
          return;
        }
      }

      const dobEvent = {
        target: {
          name: 'dateOfBirth',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(dobEvent);

      const ageEvent = {
        target: {
          name: 'age',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(ageEvent);
    }
  };



  // Update age details when DOB changes
  useEffect(() => {
    if (lastChanged === 'dob' && newPatient.dateOfBirth) {
      const ageDetailsFromDOB = calculateAgeDetails(newPatient.dateOfBirth);
      setAgeDetails(ageDetailsFromDOB);

      const ageString = calculateAge(newPatient.dateOfBirth);
      if (newPatient.age !== ageString) {
        const ageEvent = {
          target: {
            name: 'age',
            value: ageString
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(ageEvent);
      }
    }
  }, [newPatient.dateOfBirth, lastChanged, handleChange, newPatient.age]);

  const handleAgeDetailChange = (field: 'years' | 'months' | 'days') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value.replace(/\D/g, '');
      const error = validateAgeField(field, value);

      if (error) {
        // Adjust value based on validation
        if (field === 'years' && parseInt(value, 10) > 100) {
          value = '100';
        } else if (field === 'months' && parseInt(value, 10) > 12) {
          value = '12';
        } else if (field === 'days' && parseInt(value, 10) > 31) {
          value = '31';
        }
      }

      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));

      if (error) {
        toast.error(error, { autoClose: 1000, position: "top-center" });
      }

      const newAgeDetails = {
        ...ageDetails,
        [field]: value
      };

      if (field !== 'days' && ageDetails.days === '') {
        newAgeDetails.days = '';
      }

      setAgeDetails(newAgeDetails);
      setAgeInputMode('manual');
      setLastChanged('age');

      if (newAgeDetails.years || newAgeDetails.months || newAgeDetails.days) {
        const dob = calculateDOB(newAgeDetails.years, newAgeDetails.months, newAgeDetails.days);
        if (dob) {
          const dobEvent = {
            target: {
              name: 'dateOfBirth',
              value: dob
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(dobEvent);
          setDobInput(formatDate(dob));

          const ageParts = [];
          if (newAgeDetails.years) ageParts.push(`${newAgeDetails.years} year${newAgeDetails.years !== '1' ? 's' : ''}`);
          if (newAgeDetails.months) ageParts.push(`${newAgeDetails.months} month${newAgeDetails.months !== '1' ? 's' : ''}`);
          if (newAgeDetails.days) ageParts.push(`${newAgeDetails.days} day${newAgeDetails.days !== '1' ? 's' : ''}`);

          const ageString = ageParts.join(' ');
          const ageEvent = {
            target: {
              name: 'age',
              value: ageString
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(ageEvent);
        }
      } else {
        const dobEvent = {
          target: {
            name: 'dateOfBirth',
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(dobEvent);

        const ageEvent = {
          target: {
            name: 'age',
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(ageEvent);
        
        setDobInput('');
      }
    };

  const handlePrefixChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const prefix = event.target.value as Prefix;
    const newFullName = prefix ? `${prefix} ${currentFirstName}` : currentFirstName;

    const nameEvent = {
      target: {
        name: 'firstName',
        value: newFullName.trim()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    const genderEvent = {
      target: {
        name: 'gender',
        value: getGenderFromPrefix(prefix)
      }
    } as React.ChangeEvent<HTMLSelectElement>;

    handleChange(nameEvent);
    handleChange(genderEvent);
  };

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const firstName = event.target.value;
    const newFullName = currentPrefix ? `${currentPrefix} ${firstName}` : firstName;

    const nameEvent = {
      target: {
        name: 'firstName',
        value: newFullName.trim()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(nameEvent);
    setTouchedFields(prev => ({ ...prev, firstName: true }));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event);
    handleChange(event);
    setTouchedFields(prev => ({ ...prev, phone: true }));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    setTouchedFields(prev => ({ ...prev, city: true }));
  };

  return (
    <section className={`flex flex-col space-y-3 w-full max-w-3xl mx-auto p-3 border rounded-lg border-gray-200 shadow-xs ${isEditMode ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Phone <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              required
              value={searchTerm || newPatient.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.phone && validationErrors.phone ? 'border-red-500' : ''
                }`}
              placeholder="Enter phone number"
              maxLength={10}
            />
            {touchedFields.phone && validationErrors.phone && (
              <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.phone}</p>
            )}
            {filteredPatients?.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-xs max-h-60 overflow-y-auto">
                {filteredPatients.map((patientItem, index) => (
                  <div
                    key={index}
                    className="p-1.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handlePatientSelect(patientItem)}
                  >
                    <p className="text-xs font-medium text-gray-800">{patientItem.firstName} {patientItem.lastName}</p>
                    <p className="text-[0.65rem] text-gray-500">{patientItem.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Patient Name <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex">
            <select
              name="prefix"
              value={currentPrefix}
              onChange={handlePrefixChange}
              className={`border rounded-l-md border-gray-300 p-1.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.prefix ? 'border-red-500' : ''
                }`}
            >
              <option value="">-</option>
              {Object.values(Prefix).map((prefix) => (
                <option key={prefix} value={prefix}>
                  {prefix}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="firstName"
              required
              value={currentFirstName}
              onChange={handleFirstNameChange}
              onBlur={() => handleBlur('firstName')}
              className={`border rounded-r-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.firstName && validationErrors.firstName ? 'border-red-500' : ''
                }`}
              placeholder="First name"
            />
          </div>
          {touchedFields.firstName && validationErrors.firstName && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.firstName}</p>
          )}
          {validationErrors.prefix && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.prefix}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Gender <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            name="gender"
            required
            value={newPatient.gender}
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(Gender).map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1">
            City <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={newPatient.city}
            onChange={handleCityChange}
            onBlur={() => handleBlur('city')}
            className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.city && validationErrors.city ? 'border-red-500' : ''
              }`}
            placeholder="City"
          />
          {touchedFields.city && validationErrors.city && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.city}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Date of Birth <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="dobInput"
            value={dobInput}
            onChange={handleDobInputChange}
            onBlur={() => handleBlur('dob')}
            placeholder="DD/MM/YYYY"
            className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.dob && validationErrors.dob ? 'border-red-500' : ''
              }`}
          />
          {touchedFields.dob && validationErrors.dob && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.dob}</p>
          )}
          {ageInputMode === 'dob' && newPatient.dateOfBirth && !validationErrors.dob && (
            <p className="text-[0.65rem] mt-1 text-gray-500">
              {formatAgeString(newPatient.age)}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Age Details (Manual Input)
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Enter age details manually if you prefer not to use date of birth.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Years
              </label>
              <input
                type="text"
                name="ageYears"
                value={ageDetails.years}
                onChange={handleAgeDetailChange('years')}
                className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.years ? 'border-red-500' : ''
                  }`}
                placeholder="Enter years (0-100)"
                maxLength={3}
              />
              {validationErrors.years && (
                <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.years}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Months
              </label>
              <input
                type="text"
                name="ageMonths"
                value={ageDetails.months}
                onChange={handleAgeDetailChange('months')}
                className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.months ? 'border-red-500' : ''
                  }`}
                placeholder="Enter months (0-12)"
                maxLength={2}
              />
              {validationErrors.months && (
                <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.months}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Days
              </label>
              <input
                type="text"
                name="ageDays"
                value={ageDetails.days}
                onChange={handleAgeDetailChange('days')}
                className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.days ? 'border-red-500' : ''
                  }`}
                placeholder="Enter days (0-31)"
                maxLength={2}
              />
              {validationErrors.days && (
                <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.days}</p>
              )}
            </div>
          </div>
          {ageInputMode === 'manual' && newPatient.age && (
            <p className="text-[0.65rem] mt-1 text-gray-500">
              Age: {formatAgeString(newPatient.age)}
            </p>
          )}
        </div>
      </div>
      <div className="text-right mt-1">
        <p className="text-[0.65rem] text-gray-500">
          <span className="text-red-500">*</span> indicates required fields
        </p>
      </div>
    </section>
  );
};

function extractPrefixAndName(fullName: string): [Prefix | '', string] {
  if (!fullName) return ['', ''];

  const prefixValues = Object.values(Prefix);
  for (const prefix of prefixValues) {
    if (fullName.startsWith(prefix)) {
      const name = fullName.substring(prefix.length).trim();
      return [prefix, name];
    }
  }
  return ['', fullName];
}

function getGenderFromPrefix(prefix: Prefix | ''): Gender {
  switch (prefix) {
    case Prefix.Mr:
      return Gender.Male;
    case Prefix.Mrs:
    case Prefix.Ms:
      return Gender.Female;
    case Prefix.MS:
      return Gender.Other;
    default:
      return Gender.Other;
  }
}

export default PatientForm;
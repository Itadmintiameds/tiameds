import { Patient, Gender } from '@/types/patient/patient';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
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
  isEditMode?: boolean;
  forceValidation?: boolean;
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
  forceValidation = false,
}) => {
  const [currentPrefix, currentFirstName] = extractPrefixAndName(newPatient.firstName || '');
  const [ageDetails, setAgeDetails] = useState({
    years: '',
    months: '',
    days: ''
  });
  const [dobInput, setDobInput] = useState('');
  const [, setAgeInputMode] = useState<'manual' | 'dob'>('dob');
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
    dob: false,
    prefix: false
  });
  const [, setNameInputValue] = useState('');







  // Validate phone number
  const validatePhone = useCallback((phone: string) => {
    if (!phone) return 'Phone number is required';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be 10 digits';
    return '';
  }, []);

  // Validate name
  const validateName = useCallback((name: string) => {
    if (!name) return 'Patient name is required';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should contain only alphabets and spaces';
    if (name.length < 2) return 'Name is too short';
    return '';
  }, []);

  // Validate city
  const validateCity = useCallback((city: string) => {
    if (!city) return 'City is required';
    if (!/^[a-zA-Z\s]+$/.test(city)) return 'City should contain only alphabets and spaces';
    if (city.trim().length < 2) return 'City must contain at least 2 characters';
    return '';
  }, []);

  // Validate prefix
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validatePrefix = useCallback((_prefix: string) => {
    // Since we have a default value (Mr.), this should always pass
    return '';
  }, []);

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

  // Initialize nameInputValue when component mounts or newPatient changes
  useEffect(() => {
    const fullName = currentFirstName + (newPatient.lastName ? ` ${newPatient.lastName}` : '');
    setNameInputValue(fullName);
  }, [currentFirstName, newPatient.lastName]);

  // Initialize prefix with "Mr." if no prefix is set
  useEffect(() => {
    if (!currentPrefix && !newPatient.firstName) {
      // Only set default prefix if this is a new patient (no existing data)
      const prefixEvent = {
        target: {
          name: 'prefix',
          value: Prefix.Mr
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      handlePrefixChange(prefixEvent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrefix, newPatient.firstName]);

  // Validate all fields when they change
  useEffect(() => {
    // Use searchTerm for phone validation if it exists, otherwise use newPatient.phone
    const phoneValueToValidate = searchTerm || newPatient.phone;
    
    setValidationErrors(prev => ({
      ...prev,
      phone: validatePhone(phoneValueToValidate),
      prefix: validatePrefix(currentPrefix),
      firstName: validateName(currentFirstName),
      city: validateCity(newPatient.city),
      dob: validateDOBField(dobInput)
    }));
  }, [searchTerm, newPatient.phone, currentPrefix, currentFirstName, newPatient.city, dobInput, validateDOBField, validatePrefix, validatePhone, validateName, validateCity]);

  // Mark all fields as touched when parent triggers validation
  useEffect(() => {
    if (forceValidation) {
      setTouchedFields({
        phone: true,
        firstName: true,
        city: true,
        dob: true,
        prefix: true,
      });
    }
  }, [forceValidation]);

  // Handle field blur events
  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Handle manual date input changes
  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If user completely cleared the input, reset everything
    if (!value.trim()) {
      setDobInput('');
      setAgeInputMode('dob');
      setLastChanged('dob');
      setTouchedFields(prev => ({ ...prev, dob: true }));
      
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
      return;
    }
    
    const cleanedValue = value.replace(/[^0-9/]/g, '');

    let formattedValue = cleanedValue;
    if (cleanedValue.length > 2 && cleanedValue.indexOf('/') === -1) {
      formattedValue = `${cleanedValue.substring(0, 2)}/${cleanedValue.substring(2)}`;
    }
    if (formattedValue.length > 5 && formattedValue.lastIndexOf('/') === 2) {
      formattedValue = `${formattedValue.substring(0, 5)}/${formattedValue.substring(5)}`;
    }

    // Always update the input display
    setDobInput(formattedValue);
    setAgeInputMode('dob');
    setLastChanged('dob');
    setTouchedFields(prev => ({ ...prev, dob: true }));

    // Clear DOB and age if input is incomplete or invalid
    if (formattedValue.length !== 10) {
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
      return;
    }

    // Only process if we have a complete date (10 characters)
    const date = parseDateInput(formattedValue);
    if (date && !isNaN(date.getTime())) {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      if (date > today) {
        toast.error('Date of birth cannot be in the future', { autoClose: 1000, position: "top-center" });
        // Clear the invalid date
        setDobInput('');
        const dobEvent = {
          target: {
            name: 'dateOfBirth',
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(dobEvent);
        return;
      }

      const hundredYearsAgo = new Date();
      hundredYearsAgo.setHours(12, 0, 0, 0);
      hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
      if (date < hundredYearsAgo) {
        toast.error('Date of birth cannot be more than 100 years ago', { autoClose: 1000, position: "top-center" });
        // Clear the invalid date
        setDobInput('');
        const dobEvent = {
          target: {
            name: 'dateOfBirth',
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(dobEvent);
        return;
      }

      // Valid date - set DOB and calculate age
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
    } else {
      // Invalid date format - clear everything
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
    setTouchedFields(prev => ({ ...prev, prefix: true }));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const numericValue = event.target.value.replace(/\D/g, '');
    
    // Create a new event with the numeric value
    const numericEvent = {
      ...event,
      target: {
        ...event.target,
        value: numericValue
      }
    };
    
    handleSearchChange(numericEvent);
    handleChange(numericEvent);
    setTouchedFields(prev => ({ ...prev, phone: true }));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphabets and spaces
    const alphabeticValue = event.target.value.replace(/[^a-zA-Z\s]/g, '');
    
    // Create a new event with the filtered value
    const cityEvent = {
      target: {
        name: 'city',
        value: alphabeticValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(cityEvent);
    setTouchedFields(prev => ({ ...prev, city: true }));
  };

  return (
    <section className="w-full space-y-3">

      {/* ── CONTACT INFORMATION ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Contact Information
        </p>

        <div className="space-y-4">
          {/* Row 1 — Mobile | Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={searchTerm || newPatient.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${touchedFields.phone && validationErrors.phone ? 'border-red-400' : ''}`}
                  placeholder="+91 XXXXX XXXXX"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                />
                {touchedFields.phone && validationErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>
                )}
                {filteredPatients?.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.map((patientItem, index) => (
                      <div
                        key={index}
                        className="px-4 py-2.5 cursor-pointer hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handlePatientSelect(patientItem)}
                      >
                        <p className="text-sm font-medium text-gray-800">{patientItem.firstName} {patientItem.lastName}</p>
                        <p className="text-xs text-gray-500">{patientItem.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Email Address</label>
              <input
                type="email"
                name="email"
                value={newPatient.email || ''}
                onChange={handleChange}
                placeholder="patient@email.com"
                className="w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Row 2 — City */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={newPatient.city}
              onChange={handleCityChange}
              onBlur={() => handleBlur('city')}
              onKeyPress={(e) => { if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault(); }}
              className={`w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${touchedFields.city && validationErrors.city ? 'border-red-400' : ''}`}
              placeholder="Enter city"
            />
            {touchedFields.city && validationErrors.city && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.city}</p>
            )}
          </div>

          {/* Row 3 — Address */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Address</label>
            <input
              type="text"
              name="address"
              value={newPatient.address || ''}
              onChange={handleChange}
              placeholder="Enter full address"
              className="w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      {/* ── TAX & BILLING ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Tax &amp; Billing
        </p>

        {/* hidden prefix select — keeps gender-from-prefix logic alive */}
        <div className="hidden">
          <select name="prefix" value={currentPrefix || Prefix.Mr} onChange={handlePrefixChange}>
            {Object.values(Prefix).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {/* Row 1 — First Name | Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentFirstName}
                onBlur={() => handleBlur('firstName')}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z]/g, '');
                  handleChange({ target: { name: 'firstName', value: (currentPrefix ? `${currentPrefix} ${val}` : val).trim() } } as React.ChangeEvent<HTMLInputElement>);
                  setTouchedFields(prev => ({ ...prev, firstName: true }));
                }}
                onKeyPress={(e) => { if (!/[a-zA-Z]/.test(e.key)) e.preventDefault(); }}
                placeholder="Enter first name"
                className={`w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${touchedFields.firstName && validationErrors.firstName ? 'border-red-400' : ''}`}
              />
              {touchedFields.firstName && validationErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={newPatient.lastName || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  handleChange({ target: { name: 'lastName', value: val } } as React.ChangeEvent<HTMLInputElement>);
                }}
                onKeyPress={(e) => { if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault(); }}
                placeholder="Enter last name"
                className="w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Row 2 — DOB | Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dobInput"
                value={dobInput}
                onChange={handleDobInputChange}
                onBlur={() => handleBlur('dob')}
                placeholder="DD/MM/YYYY"
                className={`w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${touchedFields.dob && validationErrors.dob ? 'border-red-400' : ''}`}
              />
              {touchedFields.dob && validationErrors.dob && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.dob}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Age</label>
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <input
                    type="text"
                    value={ageDetails.years}
                    onChange={handleAgeDetailChange('years')}
                    placeholder="YY"
                    maxLength={3}
                    className="w-full border rounded-xl border-gray-300 px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-center">Yrs</p>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={ageDetails.months}
                    onChange={handleAgeDetailChange('months')}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full border rounded-xl border-gray-300 px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-center">Mnths</p>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={ageDetails.days}
                    onChange={handleAgeDetailChange('days')}
                    placeholder="DD"
                    maxLength={2}
                    className="w-full border rounded-xl border-gray-300 px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-center">Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 — Gender full width */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="gender"
                required
                value={newPatient.gender}
                onChange={handleChange}
                className="w-full border rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white appearance-none"
              >
                {Object.values(Gender).map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-right">
        <span className="text-red-500">*</span> indicates required fields
      </p>
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

  return ['', fullName.trim()];
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
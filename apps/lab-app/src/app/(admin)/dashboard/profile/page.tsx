import React from 'react';

const ProfilePage = () => {
  const email = 'jane.smith@labmanagement.com';
  const firstLetter = email.charAt(0).toUpperCase(); // Get the first letter of the email and capitalize it

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Profile Header */}
        <div className="flex items-center mb-6">
          {/* Display first letter of email instead of profile image */}
          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {firstLetter}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-purple-700">Dr. Jane Smith</h1>
            <p className="text-gray-600">Senior Lab Technician</p>
          </div>
        </div>

        {/* Lab Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-600">Lab Information</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Lab Assignment: Microbiology Lab - Room 204</li>
            <li>Certifications: ISO 17025 Certified, PCR Testing Specialist</li>
            <li>Access Level: Full Access (Lab Equipment, Reports, Inventory)</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-600">Contact Information</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Email: {email}</li>
            <li>Phone: +1 987 654 3210</li>
            <li>Location: Boston, MA</li>
          </ul>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-600">About Me</h2>
          <p className="text-gray-700">
            Experienced Lab Technician with 8+ years in the industry, specializing in microbiology research, lab safety protocols, and data analysis for diagnostic labs.
          </p>
        </div>

        {/* Assigned Tasks */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-600">Assigned Tasks</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Supervise daily PCR test procedures</li>
            <li>Ensure lab safety compliance</li>
            <li>Maintain equipment and inventory records</li>
          </ul>
        </div>

        {/* Actions Section */}
        <div className="flex space-x-4">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
            Edit Profile
          </button>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

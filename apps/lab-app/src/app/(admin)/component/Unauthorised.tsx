import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, HelpCircle, Lock, Shield, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Unauthorised = ({
  allowedRoles = [],
  currentRoles = [],
  notallowedRoles = [],
  username = ''
}: {
  allowedRoles?: string[];
  currentRoles?: string[];
  notallowedRoles?: string[];
  username?: string;
}) => {
  const getAccessMessage = () => {
    if (notallowedRoles.length > 0 && currentRoles?.some(role => notallowedRoles.includes(role))) {
      return `Your current access level (${currentRoles.join(', ')}) is explicitly restricted from this resource due to security policies.`;
    }
    if (allowedRoles.length > 0) {
      return `Elevated privileges required: ${allowedRoles.join(', ')}`;
    }
    return "Your current permissions don't allow access to this resource.";
  };

  const getSeverity = () => {
    if (notallowedRoles.length > 0) return 'high';
    if (allowedRoles.length > 0) return 'medium';
    return 'low';
  };

  const severity = getSeverity();

  const severityData = {
    high: { 
      color: 'red', 
      icon: ShieldAlert,
      title: 'Access Denied: Security Restriction',
      subtitle: 'Your account has been restricted from this content',
      description: 'This area contains sensitive information restricted to specific user groups. Your account has been explicitly blocked from accessing this resource.'
    },
    medium: { 
      color: 'amber', 
      icon: Lock,
      title: 'Authorization Required',
      subtitle: 'Higher clearance needed for this section',
      description: 'To protect sensitive data, this area requires special permissions. Please contact your administrator if you believe you should have access.'
    },
    low: { 
      color: 'blue', 
      icon: AlertCircle,
      title: 'Limited Access Permissions',
      subtitle: 'Additional privileges needed',
      description: 'Your current user role doesn\'t have sufficient permissions to view this content. You may need to request access from your administrator.'
    }
  };

  const { color, icon: Icon, title, subtitle, description } = severityData[severity];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Animated Image and Detailed Explanation */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex w-1/2 flex-col items-center justify-center p-8 space-y-8"
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-full h-64"
        >
          <Image
            src="/undraw_security_0ubl.svg"
            alt="Access Denied"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        <div className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Understanding Access Levels</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Shield className="flex-shrink-0 w-5 h-5 mt-0.5 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-800">Role-Based Access Control</h3>
                <p className="text-sm text-gray-600">Our system uses precise permission levels to protect sensitive information.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <HelpCircle className="flex-shrink-0 w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <h3 className="font-medium text-gray-800">Need Access?</h3>
                <p className="text-sm text-gray-600">Contact your administrator or use the request access button below.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Compact Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Header with animated icon */}
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className={`bg-${color}-50 p-6 flex flex-col items-center justify-center space-y-3`}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className={`p-4 rounded-full bg-${color}-100 shadow-inner`}
            >
              <Icon className={`w-10 h-10 text-${color}-600`} />
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-lg bg-${color}-50 border border-${color}-100`}
            >
              <p className={`text-sm text-${color}-800`}>{description}</p>
            </motion.div>

            {/* Detailed Alert */}
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              className={`p-4 rounded-lg bg-${color}-50 border-l-4 border-${color}-500`}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className={`flex-shrink-0 w-5 h-5 mt-0.5 text-${color}-600`} />
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Access Details</h3>
                  <p className={`text-sm text-${color}-700`}>{getAccessMessage()}</p>
                </div>
              </div>
            </motion.div>

            {/* User Information Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="font-medium text-gray-800 border-b pb-2">Your Access Information</h3>
              
              {username && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Logged in as:</span>
                  <span className="font-medium text-gray-700 truncate max-w-[180px]">{username}</span>
                </div>
              )}

              {currentRoles?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Your current roles:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentRoles.map(role => (
                      <motion.span 
                        key={role}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs rounded-full font-medium"
                      >
                        {role}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {allowedRoles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Required roles:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allowedRoles.map(role => (
                      <motion.span 
                        key={role}
                        whileHover={{ scale: 1.05 }}
                        className={`px-3 py-1.5 bg-${color}-100 text-${color}-800 text-xs rounded-full font-medium`}
                      >
                        {role}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Link
                href="/"
                className={`flex items-center justify-center px-6 py-3 rounded-lg bg-${color}-600 text-white hover:bg-${color}-700 transition-colors text-sm font-medium shadow-sm`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Link>
              
              {/* <div className="flex space-x-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-${color}-300 bg-white text-${color}-600 hover:bg-${color}-50`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Request Access
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50`}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </motion.button>
              </div> */}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between"
          >
            <p className="text-xs text-gray-500">
              System Security Level: <span className="font-medium">{severity.toUpperCase()}</span>
            </p>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Unauthorised;
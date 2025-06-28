// import React, { useEffect, useState } from 'react'

// const CurrentTime = () => {
//   const [time, setTime] = useState('');

//   useEffect(() => {
//     const updateTime = () => {
//       setTime(new Date().toLocaleTimeString());
//     };

//     // Set the time immediately
//     updateTime();

//     // Update the time every second
//     const intervalId = setInterval(updateTime, 1000);

//     // Cleanup interval on component unmount
//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <span className="text-xs font-semibold text-textzinc ml-2 bg-primary rounded-full px-2 py-1">
//       {time}
//     </span>
//   );
// }

// export default CurrentTime;





import React, { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';

interface CurrentTimeProps {
  className?: string;
  showSeconds?: boolean;
  showIcon?: boolean;
}

const CurrentTime: React.FC<CurrentTimeProps> = ({ 
  className = '', 
  showSeconds = true,
  showIcon = true
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: true
      };
      setTime(new Date().toLocaleTimeString(undefined, options));
    };

    // Set the time immediately
    updateTime();

    // Update the time every second
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [showSeconds]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      {showIcon && <FiClock className="mr-1.5 h-3.5 w-3.5  text-emerald-600" />}
      <span className="text-sm font-medium text-gray-700">
        {time}
      </span>
    </div>
  );
};

export default CurrentTime;
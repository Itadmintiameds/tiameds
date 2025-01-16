import React, { useEffect, useState } from 'react'

const CurrentTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };

    // Set the time immediately
    updateTime();

    // Update the time every second
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <span className="text-xs font-semibold text-gray-100 ml-2 bg-primary rounded-full px-2 py-1">
      {time}
    </span>
  );
}

export default CurrentTime;

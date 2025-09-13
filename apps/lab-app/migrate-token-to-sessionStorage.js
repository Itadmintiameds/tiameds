
// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const tokenInLocalStorage = localStorage.getItem('token');
const tokenInSessionStorage = sessionStorage.getItem('token');
const tokenInCookie = getCookie('token');

if (tokenInCookie) {
  // Token already in cookie
} else {
  // Try to get token from localStorage or sessionStorage
  let tokenToMigrate = tokenInLocalStorage || tokenInSessionStorage;
  
  if (tokenToMigrate) {
    // Move token to cookie
    document.cookie = `token=${tokenToMigrate}; path=/; secure; samesite=strict`;
    
    // Remove from localStorage and sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
}

// Check auth-storage for token
const authStorage = localStorage.getItem('auth-storage');
if (authStorage) {
  try {
    const authData = JSON.parse(authStorage);
    if (authData.state && authData.state.token) {
      // Move token to cookie
      document.cookie = `token=${authData.state.token}; path=/; secure; samesite=strict`;
      
      // Remove token from auth-storage (keep other data)
      authData.state.token = null;
      localStorage.setItem('auth-storage', JSON.stringify(authData));
    }
  } catch (error) {
    // Handle parsing error silently
  }
}



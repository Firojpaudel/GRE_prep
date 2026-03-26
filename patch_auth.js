const fs = require('fs');

const content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

let newContent = content.replace(
  `  const updateUserData = async (newData: Partial<UserData>) => {
    if (!user || !token) return;
    
    setUser(prev => {
        if (!prev) return prev;
        const currentData = prev.user_data || {};
        const updatedData = { ...currentData, ...newData };
        const updatedUser = { ...prev, user_data: updatedData };
        localStorage.setItem('gre_user', JSON.stringify(updatedUser));
        
        // Background sync to server
        const apiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
        const endpoint = '/api/user/data';
        const requestUrl = apiBaseUrl ? \`\${apiBaseUrl.replace(/\\/$/, '')}\${endpoint}\` : endpoint;
        
        fetch(requestUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
            },
            body: JSON.stringify({ user_data: updatedData })
        })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(text || 'Failed to sync user data');
            }
          })
          .catch(err => console.error('Failed to sync:', err));

        return updatedUser;
    });
  };`,
  `  const updateUserData = async (newData: Partial<UserData>) => {
    if (!token) return;
    
    // We compute the next state so we can reliably use it for side-effects.
    let finalUser = user;
    setUser(prev => {
        if (!prev) return prev;
        const currentData = prev.user_data || {};
        const updatedData = { ...currentData, ...newData };
        const updatedUser = { ...prev, user_data: updatedData };
        
        finalUser = updatedUser;
        return updatedUser;
    });

    // Wait slightly to let the state updater run and get finalUser
    setTimeout(() => {
        if (!finalUser) return;
        localStorage.setItem('gre_user', JSON.stringify(finalUser));
        
        const apiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
        const endpoint = '/api/user/data';
        const requestUrl = apiBaseUrl ? \`\${apiBaseUrl.replace(/\\/$/, '')}\${endpoint}\` : endpoint;
        
        fetch(requestUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
            },
            body: JSON.stringify({ user_data: finalUser.user_data })
        })
        .catch(err => console.error('Failed to sync:', err));
    }, 50);
  };`
);

fs.writeFileSync('src/context/AuthContext.tsx', newContent);

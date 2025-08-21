import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext();

export function AuthProvider({children}) {
  const [token,setToken] = useState(localStorage.getItem('token')||null);
  const [user,setUser]   = useState(JSON.parse(localStorage.getItem('user')||'null'));

  useEffect(()=>{
    if(token){
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(()=>{
    if(user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // hydrate from /profile/me when token exists but user missing
  useEffect(()=>{
    (async ()=>{
      if(token && !user){
        try{
          const res = await api.get('/profile/me');
          setUser(res.data);
        }catch(e){ console.error(e); }
      }
    })();
  }, [token]);


  return <AuthContext.Provider value={{token,setToken,user,setUser}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

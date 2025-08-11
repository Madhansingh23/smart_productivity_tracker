
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
const AuthContext = createContext();
export function AuthProvider({children}){
  const [token,setToken]=useState(localStorage.getItem('token')||null);
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user')||'null'));
  useEffect(()=>{ if(token){ localStorage.setItem('token',token); api.defaults.headers.common['Authorization']=`Bearer ${token}`; } else { delete api.defaults.headers.common['Authorization']; localStorage.removeItem('token'); } if(user) localStorage.setItem('user',JSON.stringify(user)); else localStorage.removeItem('user'); }, [token,user]);
  return <AuthContext.Provider value={{token,setToken,user,setUser}}>{children}</AuthContext.Provider>;
}
export const useAuth = ()=> useContext(AuthContext);

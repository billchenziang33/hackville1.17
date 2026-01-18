import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthChange, logOut } from '../services/firebase';
import { getPatientProfile, getFamilyMemberProfile } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const patientProfile = await getPatientProfile();
          setUserProfile(patientProfile);
          setUserType('patient');
        } catch (e) {
          try {
            const familyProfile = await getFamilyMemberProfile();
            setUserProfile(familyProfile);
            setUserType('family_member');
          } catch (e2) {
            setUserProfile(null);
            setUserType(null);
          }
        }
      } else {
        setUserProfile(null);
        setUserType(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const patientProfile = await getPatientProfile();
      setUserProfile(patientProfile);
      setUserType('patient');
    } catch (e) {
      try {
        const familyProfile = await getFamilyMemberProfile();
        setUserProfile(familyProfile);
        setUserType('family_member');
      } catch (e2) {
        setUserProfile(null);
        setUserType(null);
      }
    }
  };

  const logout = async () => {
    try {
      await logOut();
      setUser(null);
      setUserProfile(null);
      setUserType(null);
    } catch (error) {
      console.log('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      userType,
      loading,
      refreshProfile,
      logout,
      isPatient: userType === 'patient',
      isFamilyMember: userType === 'family_member',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

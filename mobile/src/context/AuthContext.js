import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthChange } from '../services/firebase';
import { getPatientProfile, getFamilyMemberProfile } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null); // 'patient' or 'family_member'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Try to get user profile
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
            // User exists in Firebase but not registered in our system
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

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      userType,
      loading,
      refreshProfile,
      isPatient: userType === 'patient',
      isFamilyMember: userType === 'family_member',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

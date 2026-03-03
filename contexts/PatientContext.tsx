import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Patient } from '../types';

interface PatientContextType {
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient) => void;
  isDoctor: boolean;
}

const PatientContext = createContext<PatientContextType>({
  currentPatient: null,
  setCurrentPatient: () => {},
  isDoctor: false,
});

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (user) {
        if (user.role === 'patient') {
            // If logged in as patient, they can only view themselves
            setCurrentPatient(user);
        } else if (user.role === 'doctor' && !currentPatient) {
            // If doctor, wait for selection. 
            // We do NOT auto-select to avoid confusion, or could select first one.
            setCurrentPatient(null); 
        }
    }
  }, [user]);

  return (
    <PatientContext.Provider 
      value={{ 
        currentPatient, 
        setCurrentPatient, 
        isDoctor: user?.role === 'doctor' 
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const useCurrentPatient = () => useContext(PatientContext);

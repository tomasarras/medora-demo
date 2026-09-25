"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "medora_role";

const RoleContext = createContext({
  role: null,
  doctorId: null,
  loaded: false,
  enterSecretaria: () => {},
  enterMedico: () => {},
  exitRole: () => {},
});

export function RoleProvider({ children }) {
  const [role, setRole] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.role === "secretaria") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRole("secretaria");
      } else if (saved?.role === "medico" && saved.doctorId) {
        setRole("medico");
        setDoctorId(saved.doctorId);
      }
    } catch {
      // ignore malformed localStorage content
    }
    setLoaded(true);
  }, []);

  function enterSecretaria() {
    setRole("secretaria");
    setDoctorId(null);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "secretaria" }));
  }

  function enterMedico(id) {
    setRole("medico");
    setDoctorId(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "medico", doctorId: id }));
  }

  function exitRole() {
    setRole(null);
    setDoctorId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <RoleContext.Provider value={{ role, doctorId, loaded, enterSecretaria, enterMedico, exitRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

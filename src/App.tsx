import React from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { RegistrationPage } from './components/auth/RegistrationPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';

const MainAppContent: React.FC = () => {
  const { currentRole } = useCanteen();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative selection:bg-orange-500 selection:text-white">
      {/* Strict Role-Based View Access: Users only see the dashboard for their authenticated role */}
      {currentRole === null && <RegistrationPage />}
      {currentRole === 'student' && <StudentDashboard />}
      {currentRole === 'staff' && <StaffDashboard />}
      {currentRole === 'manager' && <ManagerDashboard />}
    </div>
  );
};

export default function App() {
  return (
    <CanteenProvider>
      <MainAppContent />
    </CanteenProvider>
  );
}

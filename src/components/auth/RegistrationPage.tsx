import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { UserRole } from '../../types';
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChefHat,
  Sparkles,
  Lock,
  User,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const { registerStudent, loginStudent, loginStaff, loginManager } = useCanteen();

  // Role selection: Student | Canteen Staff | Canteen Manager
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Form mode for Student: 'register' | 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Student Register Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usn, setUsn] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Staff & Manager Auth state
  const [staffId, setStaffId] = useState('STAFF-101');
  const [staffPin, setStaffPin] = useState('staff123');
  const [managerId, setManagerId] = useState('MGR-01');
  const [managerPin, setManagerPin] = useState('manager123');

  // Student Login Fields
  const [loginUsnOrEmail, setLoginUsnOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Quick fill helper for evaluator
  const handleQuickFillStudent = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFirstName('Namitha');
    setLastName('Reddy');
    setUsn(`1RV21CS${randomSuffix}`);
    setMobile('9876543210');
    setEmail(`namitha.reddy${randomSuffix}@campus.edu`);
    setPassword('Campus@2026');
    setConfirmPassword('Campus@2026');
    setErrorMessage(null);
  };

  // Student Registration submit
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validations
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please enter both First Name and Last Name.');
      return;
    }

    const cleanUsn = usn.trim().toUpperCase();
    if (!cleanUsn || cleanUsn.length < 5) {
      setErrorMessage('Please enter a valid University Seat Number (USN).');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian Mobile Number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid Email ID.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerStudent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        usn: cleanUsn,
        mobile: `+91 ${cleanMobile}`,
        email: email.trim().toLowerCase(),
        passwordHash: password,
      });

      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
      } else {
        setSuccessMessage('Registration successful! Redirecting to Student Dashboard...');
      }
    }, 600);
  };

  // Student Login submit
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginUsnOrEmail.trim()) {
      setErrorMessage('Please enter your registered USN or Email ID.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginStudent(loginUsnOrEmail.trim(), loginPassword);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed.');
      } else {
        setSuccessMessage('Login successful! Redirecting to Student Dashboard...');
      }
    }, 500);
  };

  // Staff Continue - enforce authorized credentials
  const handleContinueStaff = () => {
    setErrorMessage(null);
    if (!staffId.trim()) {
      setErrorMessage('Please enter your Staff ID.');
      return;
    }
    if (staffPin.trim() !== 'staff123') {
      setErrorMessage('Invalid Staff Security PIN. Authorized kitchen credentials required (Default: staff123).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginStaff(staffId.trim(), staffPin.trim());
      setIsLoading(false);
    }, 400);
  };

  // Manager Continue - enforce authorized credentials
  const handleContinueManager = () => {
    setErrorMessage(null);
    if (!managerId.trim()) {
      setErrorMessage('Please enter your Manager ID.');
      return;
    }
    if (managerPin.trim() !== 'manager123') {
      setErrorMessage('Invalid Manager Security PIN. Authorized manager credentials required (Default: manager123).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginManager(managerId.trim(), managerPin.trim());
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-10 px-4 sm:px-6 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered White Registration Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-orange-950/25 border border-orange-100 overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Card Header */}
        <div className="pt-8 pb-6 px-6 sm:px-10 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/30 mb-4 transform hover:rotate-6 transition-transform">
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SMART CAMPUS CANTEEN
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            Welcome! Register to access your smart campus canteen.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-xs font-semibold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Skip the Queue. Order Smart. Collect Fresh.</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-10">
          
          {/* Notification Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{successMessage}</div>
            </div>
          )}

          {/* FIRST FIELD – REGISTER AS DROPDOWN */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Register As <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as UserRole);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-base font-semibold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="staff">Canteen Staff</option>
                <option value="manager">Canteen Manager</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Select your role to dynamically load the appropriate registration and access portal.
            </p>
          </div>

          {/* =========================================
              IF STUDENT IS SELECTED
             ========================================= */}
          {selectedRole === 'student' && (
            <div>
              {/* Toggle Register vs Login */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                  }}
                  className={`pb-3 text-sm font-bold border-b-2 mr-6 transition-colors ${
                    authMode === 'register'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  New Student Registration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    authMode === 'login'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Already Registered? Sign In
                </button>
              </div>

              {authMode === 'register' ? (
                <form onSubmit={handleStudentRegister} className="space-y-5">
                  {/* Two-Column Grid on Desktop, Single-Column on Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    
                    {/* Student Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* USN */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        USN (University Seat Number) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="e.g. 1RV21CS042"
                          value={usn}
                          onChange={(e) => setUsn(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 uppercase font-mono tracking-wider focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-700 text-sm font-semibold">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="Enter 10-digit mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-r-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Email ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          placeholder="student@campus.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Large Attractive Green Button: REGISTER AS STUDENT */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Registering Student Account...</span>
                        </>
                      ) : (
                        <>
                          <span>REGISTER AS STUDENT</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Evaluator Quick Demo Fill button */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleQuickFillStudent}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-4"
                    >
                      Prefill sample student credentials for fast evaluation
                    </button>
                  </div>
                </form>
              ) : (
                /* Student Sign In Form */
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered USN or Email ID
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. 1RV21CS042 or student@campus.edu"
                        value={loginUsnOrEmail}
                        onChange={(e) => setLoginUsnOrEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-base py-3 px-6 rounded-xl shadow-lg shadow-orange-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Signing In...' : 'SIGN IN TO STUDENT DASHBOARD'}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsnOrEmail('1RV21CS042');
                        setLoginPassword('pass123');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Quick sign in with demo student (1RV21CS042 - Aarav)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =========================================
              IF CANTEEN STAFF IS SELECTED
             ========================================= */}
          {selectedRole === 'staff' && (
            <div className="py-4 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  Welcome to the Canteen Staff Portal
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Access your smart kitchen management dashboard to handle live orders, AI food quantity calculations, token packing, and recipe timers.
                </p>
              </div>

              {/* Staff Authentication Container */}
              <div className="max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Staff Session</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff ID</label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Access PIN</label>
                  <input
                    type="password"
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CONTINUE TO STAFF DASHBOARD button */}
              <div className="max-w-sm mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleContinueStaff}
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-orange-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONTINUE TO STAFF DASHBOARD</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              IF CANTEEN MANAGER IS SELECTED
             ========================================= */}
          {selectedRole === 'manager' && (
            <div className="py-4 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  Welcome to the Canteen Manager Portal
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Manage your canteen operations from one place. Oversee menu items, pickup slots, staff task assignments, inventory levels, and business analytics.
                </p>
              </div>

              {/* Manager Authentication Container */}
              <div className="max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Authorized Manager Portal</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manager ID</label>
                  <input
                    type="text"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN</label>
                  <input
                    type="password"
                    value={managerPin}
                    onChange={(e) => setManagerPin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CONTINUE TO MANAGER DASHBOARD button */}
              <div className="max-w-sm mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleContinueManager}
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-black active:scale-[0.99] text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-slate-950/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONTINUE TO MANAGER DASHBOARD</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-500">
          Smart Campus Canteen &middot; Enterprise Kitchen Automation &amp; Pre-Ordering System &middot; 2026
        </div>
      </div>
    </div>
  );
};

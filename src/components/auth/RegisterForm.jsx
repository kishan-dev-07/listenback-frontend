import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['teacher', 'student'], {
    required_error: 'Please select a role'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function RegisterForm({ onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    const { name, email, password, role } = data;
    const { user, error } = await registerUser(email, password, name, role);
    
    if (user) {
      reset();
      // Redirect will be handled by AuthProvider
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-2xl blur-sm opacity-30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      {/* Main card */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50 p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Join our platform and start your learning journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative group">
              <input
                {...register('name')}
                type="text"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 pl-12 pr-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  errors.name 
                    ? 'border-red-300 dark:border-red-600 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 group-hover:border-gray-300 dark:group-hover:border-gray-500'
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white`}
              />
              <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                errors.name ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
              }`} />
            </div>
            {errors.name && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name.message}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative group">
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 pl-12 pr-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  errors.email 
                    ? 'border-red-300 dark:border-red-600 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 group-hover:border-gray-300 dark:group-hover:border-gray-500'
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white`}
              />
              <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
              }`} />
            </div>
            {errors.email && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email.message}</span>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative cursor-pointer group">
                <input
                  {...register('role')}
                  type="radio"
                  value="teacher"
                  className="sr-only"
                />
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 group-hover:border-gray-300 dark:group-hover:border-gray-500 group-has-[:checked]:border-blue-500 group-has-[:checked]:bg-blue-50 dark:group-has-[:checked]:bg-blue-900/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Teacher</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Educator</p>
                  </div>
                </div>
              </label>
              <label className="relative cursor-pointer group">
                <input
                  {...register('role')}
                  type="radio"
                  value="student"
                  className="sr-only"
                />
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 group-hover:border-gray-300 dark:group-hover:border-gray-500 group-has-[:checked]:border-blue-500 group-has-[:checked]:bg-blue-50 dark:group-has-[:checked]:bg-blue-900/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Student</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Learner</p>
                  </div>
                </div>
              </label>
            </div>
            {errors.role && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.role.message}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative group">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 pl-12 pr-12 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  errors.password 
                    ? 'border-red-300 dark:border-red-600 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 group-hover:border-gray-300 dark:group-hover:border-gray-500'
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white`}
              />
              <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
              }`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative group">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 pl-12 pr-12 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  errors.confirmPassword 
                    ? 'border-red-300 dark:border-red-600 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 group-hover:border-gray-300 dark:group-hover:border-gray-500'
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white`}
              />
              <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
              }`} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full relative px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Create Account</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
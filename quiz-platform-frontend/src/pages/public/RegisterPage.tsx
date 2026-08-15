import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/api';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      await authService.register(data);
      toast.success('Registration successful! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 sm:p-10 w-full animate-fade-in relative overflow-hidden mt-8 mb-8">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
      <p className="text-gray-400 mb-8">Join us to start taking quizzes and assessments</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label" htmlFor="firstName">First name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="firstName"
                type="text"
                className={`input-field pl-11 ${errors.firstName ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                placeholder="John"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="lastName">Last name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="lastName"
                type="text"
                className={`input-field pl-11 ${errors.lastName ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                placeholder="Doe"
                {...register('lastName')}
              />
            </div>
            {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="email">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              className={`input-field pl-11 ${errors.email ? 'border-red-500/50 focus:ring-red-500' : ''}`}
              placeholder="you@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="password"
              type="password"
              className={`input-field pl-11 ${errors.password ? 'border-red-500/50 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              {...register('password')}
            />
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              className={`input-field pl-11 ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex justify-center py-3 text-base mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'
import { useProfile } from '@/lib/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Loader2, Moon, Sun } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useTheme } from '@/lib/ThemeProvider'
import { motion } from 'framer-motion'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage = () => {
  const { signIn, signInWithGoogle, user } = useAuth()
  const { profile } = useProfile()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const fromAssessment = searchParams.get('fromAssessment') === 'true'
  const isNewUser = searchParams.get('newUser') === 'true'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Handle redirect after successful login
  useEffect(() => {
    if (user && profile !== undefined) {
      if (profile) {
        // User has profile, go to dashboard
        navigate('/')
      } else {
        // User doesn't have profile, go to onboarding
        navigate('/onboarding')
      }
    }
  }, [user, profile, navigate])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password)
      toast({
        title: "Welcome back, warrior!",
        description: "Ready to continue your battle?",
      })
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: any) {
      toast({
        title: "Google Sign In Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  const getTitle = () => {
    if (fromAssessment) return 'Complete Your Battle Setup'
    if (isNewUser) return 'Complete Your Recruitment'
    return 'Enter the Arena'
  }

  const getDescription = () => {
    if (fromAssessment) return 'Sign in to finalize your warrior profile'
    if (isNewUser) return 'Sign in to begin your battle assessment'
    return 'Welcome back, warrior'
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      {/* Theme toggle */}
      <motion.div 
        className="absolute top-4 right-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md gradient-card border-primary/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div 
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="h-12 w-12 text-primary shield-glow" />
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${
                    errors.email ? 'border-destructive' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entering Arena...
                    </>
                  ) : (
                    fromAssessment || isNewUser ? 'Continue to Arena' : 'Enter Arena'
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <motion.div className="mt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full border-border bg-background/50 text-foreground hover:bg-background/80"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </motion.div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to={fromAssessment ? "/signup?fromAssessment=true" : "/signup"} 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Join the Battle
                </Link>
              </p>
              
              <Link 
                to={fromAssessment ? "/assessment" : "/landing"} 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors block mt-2"
              >
                ← {fromAssessment ? 'Back to assessment' : 'Back to landing'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chrome, Zap, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
          >
            <Zap className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Flow</h1>
          <p className="text-muted-foreground">
            Track your mastery journey with the 10,000 hour rule
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8"
        >
          {/* Features list */}
          <div className="space-y-4 mb-8">
            {[
              { icon: Clock, text: 'Focus timer with live tracking' },
              { icon: Target, text: 'Track progress to 10,000 hours' },
              { icon: Zap, text: 'Build consistent habits' },
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-muted-foreground"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Google Sign In Button */}
          <Button
            onClick={signInWithGoogle}
            className="w-full h-12 text-base gap-3"
            variant="default"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Start your journey to mastery today
        </p>
      </motion.div>
    </div>
  );
}

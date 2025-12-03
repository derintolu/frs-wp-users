import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Mail, Wifi, WifiOff } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorDisplayProps {
  type?: 'network' | 'server' | 'validation' | 'permission' | 'not-found' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  className?: string;
}

export function ErrorDisplay({ 
  type = 'generic',
  title,
  message,
  onRetry,
  onGoHome,
  showRetry = true,
  showHome = false,
  className = ''
}: ErrorDisplayProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
          color: 'text-orange-500'
        };
      case 'server':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Our team has been notified and is working to fix the issue.',
          color: 'text-red-500'
        };
      case 'validation':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Validation Error',
          defaultMessage: 'Please check your input and try again.',
          color: 'text-yellow-500'
        };
      case 'permission':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to access this resource.',
          color: 'text-red-500'
        };
      case 'not-found':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Not Found',
          defaultMessage: 'The resource you\'re looking for doesn\'t exist or has been moved.',
          color: 'text-gray-500'
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Something Went Wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          color: 'text-[var(--brand-steel-blue)]'
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center space-y-6 ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className={`p-4 rounded-full bg-[var(--brand-pale-blue)] ${config.color}`}
      >
        <IconComponent className="h-12 w-12" />
      </motion.div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-[var(--brand-dark-navy)]">
          {title || config.defaultTitle}
        </h3>
        <p className="text-[var(--brand-slate)]">
          {message || config.defaultMessage}
        </p>
      </div>

      <div className="flex space-x-3">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {showHome && onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outline"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface ErrorAlertProps {
  type?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

export function ErrorAlert({
  type = 'error',
  title,
  message,
  onDismiss,
  dismissible = true,
  className = ''
}: ErrorAlertProps) {
  const getAlertConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: AlertTriangle,
          variant: 'default' as const,
          iconColor: 'text-yellow-500'
        };
      case 'info':
        return {
          icon: Mail,
          variant: 'default' as const,
          iconColor: 'text-[var(--brand-electric-blue)]'
        };
      default:
        return {
          icon: AlertTriangle,
          variant: 'destructive' as const,
          iconColor: 'text-red-500'
        };
    }
  };

  const config = getAlertConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      <Alert variant={config.variant} className="relative">
        <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            ×
          </Button>
        )}
      </Alert>
    </motion.div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen bg-[var(--brand-off-white)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <ErrorDisplay
          type="server"
          title="Application Error"
          message="The application encountered an unexpected error. Our team has been notified."
          onRetry={resetError}
          showRetry={true}
          showHome={true}
          onGoHome={() => window.location.href = '/'}
        />
        
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <h4 className="font-medium text-red-800 mb-2">Development Error Details:</h4>
            <pre className="text-sm text-red-700 overflow-auto">
              {error.message}
              {error.stack && (
                <>
                  <br />
                  <br />
                  {error.stack}
                </>
              )}
            </pre>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

interface ErrorToastProps {
  message: string;
  type?: 'error' | 'warning' | 'success';
  duration?: number;
  onClose?: () => void;
}

export function ErrorToast({ message, type = 'error', duration = 5000, onClose }: ErrorToastProps) {
  const getToastConfig = () => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          icon: AlertTriangle
        };
      case 'success':
        return {
          bgColor: 'bg-[var(--brand-cyan)]',
          textColor: 'text-white',
          icon: Mail
        };
      default:
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: AlertTriangle
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed top-4 right-4 ${config.bgColor} ${config.textColor} p-4 rounded-lg shadow-lg z-50 max-w-sm`}
    >
      <div className="flex items-start space-x-3">
        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            ×
          </Button>
        )}
      </div>
    </motion.div>
  );
}
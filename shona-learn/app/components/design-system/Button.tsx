'use client'
import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  loadingText?: string
  leftIcon?: IconType
  rightIcon?: IconType
  iconOnly?: boolean
  fullWidth?: boolean
  animated?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  platform?: 'web' | 'ios' | 'android' | 'watchos'
  children?: React.ReactNode
}

type RemainingButtonProps = Omit<ButtonProps, 
  'variant' | 'size' | 'loading' | 'loadingText' | 'leftIcon' | 'rightIcon' | 
  'iconOnly' | 'fullWidth' | 'animated' | 'rounded' | 'platform' | 'disabled' | 'children' | 'className'>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconOnly = false,
  fullWidth = false,
  animated = true,
  rounded = 'md',
  platform = 'web',
  disabled,
  children,
  className = '',
  ...props
}, ref) => {
  
  // Platform-specific styles
  const platformStyles = {
    web: {
      base: 'transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
      interactive: 'hover:transform hover:scale-105 active:scale-95'
    },
    ios: {
      base: 'transition-all duration-300 ease-out focus:outline-none',
      interactive: 'active:scale-95'
    },
    android: {
      base: 'transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1',
      interactive: 'hover:shadow-md active:scale-98'
    },
    watchos: {
      base: 'transition-all duration-200 ease-in-out focus:outline-none',
      interactive: 'active:scale-90'
    }
  }

  // Variant styles
  const variantStyles = {
    primary: {
      web: 'bg-gradient-primary text-white shadow-soft focus:ring-blue-500 hover:shadow-medium',
      ios: 'bg-blue-500 text-white shadow-sm',
      android: 'bg-blue-600 text-white shadow-md',
      watchos: 'bg-blue-700 text-white'
    },
    secondary: {
      web: 'bg-gradient-secondary text-white shadow-soft focus:ring-purple-500 hover:shadow-medium',
      ios: 'bg-purple-500 text-white shadow-sm',
      android: 'bg-purple-600 text-white shadow-md',
      watchos: 'bg-purple-700 text-white'
    },
    outline: {
      web: 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
      ios: 'border border-gray-300 text-gray-700 bg-white',
      android: 'border-2 border-gray-400 text-gray-700 bg-white',
      watchos: 'border border-gray-500 text-gray-300 bg-transparent'
    },
    ghost: {
      web: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      ios: 'text-gray-700 bg-transparent',
      android: 'text-gray-700 bg-transparent',
      watchos: 'text-gray-300 bg-transparent'
    },
    destructive: {
      web: 'bg-red-500 text-white shadow-soft focus:ring-red-500 hover:bg-red-600 hover:shadow-medium',
      ios: 'bg-red-500 text-white shadow-sm',
      android: 'bg-red-600 text-white shadow-md',
      watchos: 'bg-red-700 text-white'
    },
    success: {
      web: 'bg-green-500 text-white shadow-soft focus:ring-green-500 hover:bg-green-600 hover:shadow-medium',
      ios: 'bg-green-500 text-white shadow-sm',
      android: 'bg-green-600 text-white shadow-md',
      watchos: 'bg-green-700 text-white'
    },
    warning: {
      web: 'bg-yellow-500 text-white shadow-soft focus:ring-yellow-500 hover:bg-yellow-600 hover:shadow-medium',
      ios: 'bg-yellow-500 text-white shadow-sm',
      android: 'bg-yellow-600 text-white shadow-md',
      watchos: 'bg-yellow-700 text-white'
    }
  }

  // Size styles
  const sizeStyles = {
    xs: {
      base: 'px-2 py-1 text-xs',
      icon: 'p-1',
      iconSize: 'text-xs'
    },
    sm: {
      base: 'px-3 py-2 text-sm',
      icon: 'p-2',
      iconSize: 'text-sm'
    },
    md: {
      base: 'px-4 py-2 text-base',
      icon: 'p-2',
      iconSize: 'text-base'
    },
    lg: {
      base: 'px-6 py-3 text-lg',
      icon: 'p-3',
      iconSize: 'text-lg'
    },
    xl: {
      base: 'px-8 py-4 text-xl',
      icon: 'p-4',
      iconSize: 'text-xl'
    }
  }

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  // Disabled styles
  const disabledStyles = {
    web: 'opacity-50 cursor-not-allowed hover:transform-none hover:scale-100',
    ios: 'opacity-50',
    android: 'opacity-50',
    watchos: 'opacity-50'
  }

  // Loading styles
  const loadingStyles = {
    web: 'cursor-wait',
    ios: 'opacity-75',
    android: 'opacity-75',
    watchos: 'opacity-75'
  }

  // Build className
  const baseClasses = [
    'inline-flex items-center justify-center font-medium',
    'select-none user-select-none',
    platformStyles[platform].base,
    variantStyles[variant][platform],
    iconOnly ? sizeStyles[size].icon : sizeStyles[size].base,
    roundedStyles[rounded],
    fullWidth ? 'w-full' : '',
    !disabled && !loading && animated ? platformStyles[platform].interactive : '',
    disabled ? disabledStyles[platform] : '',
    loading ? loadingStyles[platform] : '',
    className
  ].filter(Boolean).join(' ')

  const ButtonContent = () => (
    <>
      {loading && (
        <motion.div
          className={`mr-2 ${sizeStyles[size].iconSize}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.div>
      )}
      
      {LeftIcon && !loading && (
        <LeftIcon className={`${sizeStyles[size].iconSize} ${!iconOnly ? 'mr-2' : ''}`} />
      )}
      
      {!iconOnly && (
        <span className="flex-1 text-center">
          {loading && loadingText ? loadingText : children}
        </span>
      )}
      
      {RightIcon && !loading && (
        <RightIcon className={`${sizeStyles[size].iconSize} ${!iconOnly ? 'ml-2' : ''}`} />
      )}
    </>
  )

  if (animated && !disabled && !loading) {
    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        whileHover={{ scale: platform === 'web' ? 1.05 : 1.02 }}
        whileTap={{ scale: platform === 'watchos' ? 0.90 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...(props as RemainingButtonProps)}
      >
        <ButtonContent />
      </motion.button>
    )
  }

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      <ButtonContent />
    </button>
  )
})

Button.displayName = 'Button'

export default Button

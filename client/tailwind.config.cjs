/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      scale: {
        '102': '1.02',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      transitionTimingFunction: {
        'quantum': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'cyber': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'neural': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        'hologram': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-slow-reverse': 'spin-reverse 20s linear infinite',
        'scanline': 'scanline 4s ease-in-out infinite',
        'shine': 'shine 2s ease-in-out infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'orbit 10s linear infinite',
        'orbit-delayed-1': 'orbit 3s linear 0.5s infinite',
        'orbit-delayed-2': 'orbit 3s linear 1s infinite',
        'orbit-delayed-3': 'orbit 3s linear 1.5s infinite',
        'burn-top': 'burnTop 2s ease-in forwards',
        'burn-bottom': 'burnBottom 2.5s ease-in forwards',
        'flicker': 'flicker 0.5s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 6s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'scan-line': 'scanLineMove 2s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-delay': 'floatDelay 8s ease-in-out infinite',
        'modal-enter': 'modalEnter 0.5s ease-out',
        'image-reveal': 'imageReveal 0.7s ease-out',
        'scan': 'scan 2s linear infinite',
        
        // Futuristic minting animations
        'door-open-left': 'doorOpenLeft 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'door-open-right': 'doorOpenRight 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'door-close-left': 'doorCloseLeft 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'door-close-right': 'doorCloseRight 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'smoke-pulse': 'smokePulse 3s ease-in-out infinite',
        'smoke-puff': 'smokePuff 2s ease-out forwards',
        'certificate-reveal': 'certificateReveal 0.8s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        
        // Page swipe animations
        'page-flip': 'pageFlip 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'page-reveal': 'pageReveal 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'book-perspective': 'bookPerspective 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'scan-line': 'scanLineMove 2s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'scanline': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'scanLine': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'gradient': {
          '0%, 100%': { 
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 50%' 
          },
          '50%': { 
            backgroundSize: '200% 200%',
            backgroundPosition: '100% 50%' 
          },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.4'
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(180deg)',
            opacity: '0.8'
          },
        },
        'floatDelay': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.3'
          },
          '50%': { 
            transform: 'translateY(-15px) rotate(-180deg)',
            opacity: '0.7'
          },
        },
        'burnTop': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'burnBottom': {
          '0%': { transform: 'translateY(20%)', opacity: '0' },
          '60%': { opacity: '1' },
          '100%': { transform: 'translateY(-15%)', opacity: '0' }
        },
        'flicker': {
          '0%': { opacity: '0.5', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '1', transform: 'translateY(-2px) scale(1.1)' }
        },
        
        // Futuristic minting keyframes
        'doorOpenLeft': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'doorOpenRight': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'doorCloseLeft': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'doorCloseRight': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'smokePulse': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' }
        },
        'smokePuff': {
          '0%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
          '100%': { opacity: '0.1', transform: 'scale(1.5)' }
        },
        'certificateReveal': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.7)' }
        },
        
        // Page swipe keyframes
        'pageFlip': {
          '0%': { transform: 'rotateY(0deg) translateX(0)' },
          '50%': { transform: 'rotateY(-90deg) translateX(-25px)' },
          '100%': { transform: 'rotateY(-180deg) translateX(-50px)' }
        },
        'pageReveal': {
          '0%': { opacity: '0', transform: 'translateX(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' }
        },
        'bookPerspective': {
          '0%': { transform: 'perspective(1000px) rotateY(0deg) scale(1)' },
          '100%': { transform: 'perspective(1000px) rotateY(15deg) scale(1.1)' }
        },
        'scanLineMove': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        
        // Modal and image animations
        'modalEnter': {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.95) translateY(20px)',
            backdropFilter: 'blur(0px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1) translateY(0)',
            backdropFilter: 'blur(8px)'
          }
        },
        'imageReveal': {
          '0%': { 
            opacity: '0', 
            transform: 'scale(1.1)',
            filter: 'blur(4px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)',
            filter: 'blur(0px)'
          }
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-linear-45': 'linear-gradient(45deg, var(--tw-gradient-stops))',
      },
      perspective: {
        '1000': '1000px',
      },
      dropShadow: {
        'glow': '0 0 20px rgba(34, 197, 255, 0.8)',
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        '4xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk neon palette
        neon: {
          cyan: '#00f5ff',
          purple: '#bf00ff',
          pink: '#ff006e',
          green: '#39ff14',
          yellow: '#fff200',
        },
        dark: {
          900: '#020408',
          800: '#050d15',
          700: '#0a1628',
          600: '#0f1f3d',
          500: '#162447',
          400: '#1e3a5f',
        },
        glass: {
          white: 'rgba(255,255,255,0.05)',
          border: 'rgba(0,245,255,0.15)',
        }
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        'neon-glow': 'radial-gradient(ellipse at center, rgba(0,245,255,0.15) 0%, transparent 70%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.2) 0%, rgba(191,0,255,0.1) 40%, transparent 70%)',
      },
      backgroundSize: {
        'grid-size': '40px 40px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.2)',
        'neon-purple': '0 0 20px rgba(191,0,255,0.5), 0 0 60px rgba(191,0,255,0.2)',
        'neon-pink': '0 0 20px rgba(255,0,110,0.5), 0 0 60px rgba(255,0,110,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glitch': 'glitch 0.3s steps(2) infinite',
        'typing': 'typing 0.05s steps(1) infinite',
        'border-flow': 'borderFlow 3s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%, 100%': { clipPath: 'inset(0 0 100% 0)' },
          '50%': { clipPath: 'inset(0 0 0% 0)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
    },
  },
  plugins: [],
}

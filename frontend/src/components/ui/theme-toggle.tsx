import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "pill" | "dropdown";
  className?: string;
  useLightColors?: boolean;
}

export function ThemeToggle({ variant = "pill", className, useLightColors = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "icon") {
    return (
      <motion.button
        onClick={toggleTheme}
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
          "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          useLightColors && "hover:bg-white/10",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {resolvedTheme === "light" ? (
              <Sun className={cn("w-5 h-5", useLightColors ? "text-white" : "text-amber-500")} />
            ) : (
              <Moon className={cn("w-5 h-5", useLightColors ? "text-white" : "text-indigo-400")} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === "pill") {
    return (
      <div 
        className={cn(
          "relative flex items-center p-1 rounded-full transition-all duration-300",
          resolvedTheme === "light" 
            ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-800 dark:to-slate-700" 
            : "bg-gradient-to-r from-indigo-900/50 to-purple-900/50",
          "border border-border/50",
          className
        )}
      >
        {/* Background slider */}
        <motion.div
          className={cn(
            "absolute w-8 h-8 rounded-full shadow-lg",
            resolvedTheme === "light"
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-gradient-to-br from-indigo-500 to-purple-600"
          )}
          layout
          initial={false}
          animate={{
            x: resolvedTheme === "light" ? 0 : 36,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />

        {/* Sun button */}
        <motion.button
          onClick={() => setTheme("light")}
          className={cn(
            "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
            resolvedTheme === "light" ? "text-white" : "text-muted-foreground hover:text-foreground"
          )}
          whileTap={{ scale: 0.9 }}
          aria-label="Light mode"
        >
          <Sun className="w-4 h-4" />
        </motion.button>

        {/* Moon button */}
        <motion.button
          onClick={() => setTheme("dark")}
          className={cn(
            "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
            resolvedTheme === "dark" ? "text-white" : "text-muted-foreground hover:text-foreground"
          )}
          whileTap={{ scale: 0.9 }}
          aria-label="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </motion.button>
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={cn("relative", className)}>
      <motion.button
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300",
          "bg-muted/50 hover:bg-muted border border-border/50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {resolvedTheme === "light" ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// Advanced toggle with system option
export function ThemeToggleAdvanced({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className={cn(
      "flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50",
      className
    )}>
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            "relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            "flex items-center gap-1.5",
            theme === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          whileTap={{ scale: 0.95 }}
        >
          {theme === option.value && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <option.icon className={cn(
              "w-4 h-4",
              option.value === "light" && "text-amber-500",
              option.value === "dark" && "text-indigo-400",
              option.value === "system" && "text-muted-foreground"
            )} />
            <span className="hidden sm:inline">{option.label}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export default ThemeToggle;

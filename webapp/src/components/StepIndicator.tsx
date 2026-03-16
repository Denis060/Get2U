import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={label} className="flex items-center">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  isCompleted
                    ? "border-[hsl(24_95%_48%)] bg-[hsl(24_95%_48%)] text-white"
                    : isCurrent
                    ? "border-[hsl(24_95%_48%)] bg-[hsl(24_95%_48%)] text-white shadow-[0_0_0_4px_hsl(24_95%_48%/0.15)]"
                    : "border-gray-200 bg-white text-gray-400"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </motion.div>
              <motion.span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isCurrent ? "text-[hsl(24_95%_48%)]" : isCompleted ? "text-gray-500" : "text-gray-400"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
              >
                {label}
              </motion.span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < steps.length - 1 ? (
              <div className="mx-2 mb-5 h-[2px] w-10 sm:w-16 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full bg-[hsl(24_95%_48%)]"
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

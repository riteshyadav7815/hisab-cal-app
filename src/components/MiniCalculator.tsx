"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function MiniCalculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 w-80"
    >
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg mb-2">Mini Calculator</h3>
        <div className="bg-black/20 rounded-xl p-4 border border-white/10">
          <div className="text-white text-right text-2xl font-mono min-h-[2rem]">
            {display}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Clear button */}
        <button
          onClick={clear}
          className="col-span-2 p-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl transition-colors"
        >
          Clear
        </button>
        
        {/* Calculator buttons */}
        {buttons.map((row, rowIndex) =>
          row.map((button, colIndex) => {
            const isNumber = !isNaN(Number(button)) || button === ".";
            const isOperator = ["+", "-", "×", "÷"].includes(button);
            const isEquals = button === "=";

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => {
                  if (isNumber) {
                    inputNumber(button);
                  } else if (isOperator) {
                    inputOperation(button);
                  } else if (isEquals) {
                    performCalculation();
                  }
                }}
                className={`p-3 rounded-xl transition-colors font-semibold ${
                  isNumber
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : isOperator
                    ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                    : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300"
                }`}
              >
                {button}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

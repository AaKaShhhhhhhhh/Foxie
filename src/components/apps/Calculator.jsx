import React, { useState, useCallback } from 'react';

/**
 * Simple Calculator App
 */
const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handleNumber = useCallback((num) => {
    if (justEvaluated) {
      setDisplay(num);
      setEquation('');
      setJustEvaluated(false);
    } else if (display === '0' && num !== '.') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  }, [display, justEvaluated]);

  const handleOperator = useCallback((op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
    setJustEvaluated(false);
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setJustEvaluated(false);
  }, []);

  const handleEquals = useCallback(() => {
    try {
      const fullEquation = equation + display;
      // Safe eval using Function constructor
      const result = new Function('return ' + fullEquation.replace(/×/g, '*').replace(/÷/g, '/'))();
      setDisplay(String(result));
      setEquation('');
      setJustEvaluated(true);
    } catch (e) {
      setDisplay('Error');
    }
  }, [equation, display]);

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <div className="calculator-app">
      <div className="calculator-display">
        <div className="calculator-equation">{equation}</div>
        <div className="calculator-result">{display}</div>
      </div>
      <div className="calculator-buttons">
        {buttons.map((row, i) => (
          <div key={i} className="calculator-row">
            {row.map((btn) => (
              <button
                key={btn}
                className={`calc-btn ${btn === '0' ? 'wide' : ''} ${['÷', '×', '-', '+', '='].includes(btn) ? 'operator' : ''} ${btn === 'C' ? 'clear' : ''}`}
                onClick={() => {
                  if (btn === 'C') handleClear();
                  else if (btn === '=') handleEquals();
                  else if (['÷', '×', '-', '+'].includes(btn)) handleOperator(btn);
                  else if (btn === '±') setDisplay(d => String(-parseFloat(d)));
                  else if (btn === '%') setDisplay(d => String(parseFloat(d) / 100));
                  else handleNumber(btn);
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calculator;

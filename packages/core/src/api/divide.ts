import { RoundingMode } from '../calculator';
import { BaseDinero } from '../types';
import { Dependencies } from './types';

export function divide<TAmount, TDinero extends BaseDinero<TAmount>>({
  factory,
  calculator,
}: Dependencies<TAmount, TDinero, 'divide' | 'round'>) {
  return function _divide(
    dividend: TDinero,
    divisor: TAmount,
    roundingMode: RoundingMode<TAmount> = calculator.round
  ) {
    const { amount, currency, scale } = dividend.toJSON();

    return factory({
      amount: roundingMode(calculator.divide(amount, divisor)),
      currency,
      scale,
    });
  };
}
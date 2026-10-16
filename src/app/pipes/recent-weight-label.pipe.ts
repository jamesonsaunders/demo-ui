import { Pipe, PipeTransform } from '@angular/core';

// The backtest only tries these weights. Only the 3-month figure needs the season removed.
const LABELS: Record<number, string> = {
  0: 'taken from the last 12 months',
  0.25: 'a quarter of the way from the last 12 months to the last 3 months (season removed)',
  0.5: 'halfway between the last 12 months and the last 3 months (season removed)',
  0.75: 'three quarters of the way from the last 12 months to the last 3 months (season removed)',
  1: 'taken from the last 3 months (season removed)',
};

/** Recent weight (0-1) as where the starting level sits between the last 12 and last 3 months. */
@Pipe({ name: 'recentWeightLabel' })
export class RecentWeightLabelPipe implements PipeTransform {
  transform(value: number): string {
    return `starting level ${LABELS[value]}`;
  }
}

declare module 'hijri-date' {
  class HijriDate {
    constructor(year?: number, month?: number, date?: number);
    getFullYear(): number;
    getMonth(): number;
    getDate(): number;
    toGregorian(): Date;
    static fromGregorian(date: Date): HijriDate;
    static today(): HijriDate;
  }
  export default HijriDate;
}

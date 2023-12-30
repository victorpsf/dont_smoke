import { AppStorage, IJSON } from './Storage';

const storage = AppStorage();

interface ICurrentDate {
    year: number;
    month: number;
    date: number;
}

interface ICurrentDateCounterInfo {
    date: ICurrentDate;
    count: number;
}

interface ICurrentDateCounter {
    count: number;
}

export interface IChar {
    labels: string[];
    values: number[];
}

export interface IAppState {
    date: string;
    count: number;
    month: IChar;
    year: IChar;
    interval: NodeJS.Timeout | null;
}

export const getCurrentDate = (): ICurrentDate => {
    const date = new Date();
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate()
    };
}

export const setValueInCache = async (date: string, count: number): Promise<void> => {
    const data = await storage.get();
    data[date] = { count };
    await storage.set(data);
}

export const getCurrentDateString = (): string => {
    const { year, month, date } = getCurrentDate();
    return `${year}-${month}-${date}`;
}

export const getCurrentDateToString = ({ year, month, date }: ICurrentDate): string => `${year}-${month}-${date}`;
export const getCurrentDateToDate = ({ year, month, date }: ICurrentDate): Date => new Date(year, (month - 1), date);
export const getDateStringToObject = (value: string): ICurrentDate => {
    const [year, month, date] = value.split('-').map(a => parseInt(a));
    return { year, month, date }
}

export const getYearStorage = async function (): Promise<ICurrentDateCounterInfo[]> {
    const value = await storage.get(),
        { year } = getCurrentDate();

    const keys = Object.keys(value)
        .map(a => getDateStringToObject(a))
        .filter((a) => (a.year === year))
        .map(b => getCurrentDateToString(b));

    return keys.map(a => ({
        date: getDateStringToObject(a),
        count: (value[a] as ICurrentDateCounter).count
    }))
}

export const getMonthStorage = async function (): Promise<ICurrentDateCounterInfo[]> {
    const value = await getYearStorage(),
        { month } = getCurrentDate();

    return value.filter((a) =>  (a.date.month === month));
}

export const getDateStorage = async function (): Promise<number> {
    const value = await getMonthStorage(),
        { date } = getCurrentDate();

    const [data] = value.filter((a) => (a.date.date === date));
    const { count } = data ?? { count: 0 };
    return count;
}

export const getCharDataMonth = (data: ICurrentDateCounterInfo[]): IChar => { 
    const chart: IChar = {
        labels: [],
        values: []
    }
    try {
        const info = data.map(a => ({ date: a.date.date, count: a.count }))
        chart.labels = info.map(a => a.date.toString())
        chart.values = info.map(a => a.count);
    }

    catch (ex) { console.log(ex); }

    return chart;
}

export const getCharDataYear = (data: ICurrentDateCounterInfo[]): IChar => { 
    const chart: IChar = {
        labels: [],
        values: []
    }

    try {
        const formatedData = data.map(a => ({
            date: a.date,
            month: Intl.DateTimeFormat('en-US', { month: 'short' }).format(getCurrentDateToDate(a.date)).toString(),
            count: a.count
        }))

        formatedData.sort((a, b) => {
            if (a.date.month > b.date.month)
                return 1;
            else if (a.date.month == b.date.month)
                return 0;
            else 
                return -1;
        })

        for (const { month } of formatedData) {
            if (chart.labels.findIndex(a => month === a) >= 0) continue;
            chart.labels.push(month);
        }

        for (const month of chart.labels) {
            const values = formatedData.filter(a => a.month.toLocaleUpperCase() == month.toLocaleUpperCase())
                .map(a => a.count);
            chart.values.push(values.reduce((a, b) => (a + b)));
        }
    }

    catch (ex) { console.log(ex); }

    return chart;
}

export const getCharData = (data: ICurrentDateCounterInfo[], format: 'month' |'year'): IChar => {
    switch(format) {
        case 'month':
            return getCharDataMonth(data);
        case 'year':
            return getCharDataYear(data);
        default:
            return {
                labels: [],
                values: []
            }
    }
}
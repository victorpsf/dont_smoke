import Storage from '@react-native-async-storage/async-storage';

export interface IJSON {
    [key: string]: IJSON | any;
}

interface IAppStorage {
    get: () => Promise<IJSON>;
    set: (data: IJSON) => Promise<void>;
}

export const AppStorage = function (): IAppStorage {
    const get = async function (): Promise<IJSON> {
        const data = await Storage.getItem('@app:data');

        if (data) return (JSON.parse(data) ?? {}) as IJSON;
        else return {};
    }

    const set = async function (data: IJSON): Promise<void> {
        await Storage.setItem('@app:data', JSON.stringify(data));
    }

    return { get, set }
} 
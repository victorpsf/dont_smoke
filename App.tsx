import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, BackHandler } from 'react-native';
import Chart from './Chart';
import { getYearStorage, getMonthStorage, getDateStorage, IAppState, getCharData, setValueInCache, getCurrentDateString } from './IApp'

export default function App(): JSX.Element {
  const [state, setState] = React.useState<IAppState>({
    date: '',
    count: 0,
    month: {
      labels: [],
      values: []
    },
    year: {
      labels: [],
      values: []
    },
    interval: null
  });

  const saveInStorage = (): Promise<void> => setValueInCache(state.date, state.count);
  const validateCurrentDate = () => {
      if (state.date == getCurrentDateString()) return;
      if (state.interval) clearInterval(state.interval);
      setState((values) => ({
        ...values,
        date: getCurrentDateString()
      }));
  }

  React.useEffect(
    () => {
      const init = async (): Promise<void> => {
        const date = getCurrentDateString();
        const [count, monthValues, yearValues] = await Promise.all([ 
          getDateStorage(), 
          getMonthStorage(),
          getYearStorage()
        ]);

        setState((values) => ({ 
          ...values, 
          date, 
          count,
          month: getCharData(monthValues, 'month'),
          year: getCharData(yearValues, 'year'),
          interval: setInterval(() => validateCurrentDate(), 500)
        }))
      }

      init();
      return () => {
        saveInStorage();
        if (state.interval) clearInterval(state.interval);
      }
    }, 
    [state.date]
  );

  const addCounter = async function (): Promise<void> {
    const count = state.count + 1;
    await setValueInCache(state.date, count);
    Promise.all([
      getMonthStorage(),
      getYearStorage(),
    ]).then(([m, y]) => {
      setState(
        (values: IAppState) => ({ 
          ...values, 
          count, 
          month: getCharData(m, 'month'),
          year: getCharData(y, 'year')
        })
      );
    }) 
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      paddingHorizontal: '5%',
      paddingVertical: '10%',
      width: '100%',
      height: '100%',
      backgroundColor: '#323232'
    }}>
      <View>
        <StatusBar style="auto" />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(state.year.labels.length > 0 && state.year.values.length > 0) && (
            <Chart 
              title='Current year metrics' 
              labels={state.year.labels} 
              values={state.year.values} 
            />
          )}

          {(state.month.labels.length > 0 && state.month.values.length > 0) && (
            <Chart 
              title='Current smoke month metrics' 
              labels={state.month.labels} 
              values={state.month.values} 
            />
          )}

          <View style={{ marginTop: 50 }}>
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff' }}>{`Total daily Cigaretts: ${state.count ?? 0}`}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: 'red', padding: 20, borderRadius: 4, marginTop: 10 }}
                onPress={() => addCounter()}
              >
                <Text style={{ color: '#fff' }}>{`I Smoked one more :(`}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

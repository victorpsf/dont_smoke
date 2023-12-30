import React from 'react'
import { Dimensions, ScaledSize, View, Text } from 'react-native';
import { LineChart } from "react-native-chart-kit";

export interface IOffSet {
    width: number;
    height: number;
}

export interface IChartState {
    component?: IOffSet;
    chart?: IOffSet;
}

export interface IChartProps {
    labels: string[];
    values: number[];
    title: string;
}

export default function Chart ({ labels, values, title }: IChartProps): JSX.Element {
    const [ state, setState ] = React.useState<IChartState>({ });

    const getComponentDimension = function ({ width, height }: IOffSet): IOffSet {
        return {
            width: (width),
            height: (height * 0.3)
        };
    }

    const getChartDimension = function ({ width, height }: IOffSet): IOffSet {
        return {
            width: (width - 40),
            height: (height * 0.3) - 40
        };
    }

    const changeDimension = function ({ width, height }: ScaledSize) {
        setState({
            component: getComponentDimension({ width, height }),
            chart: getChartDimension({ width, height })
        })
    }

    React.useEffect(() => {
        changeDimension(Dimensions.get('window'));
        const register = Dimensions.addEventListener('change', ({ window }) => changeDimension(window)).remove;
        return register;
    }, [])

    return (
        <View 
            style={{ 
                width: state.component?.width ?? 0, 
                height: state.component?.height ?? 0, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}
        >
            {title && <Text style={{ width: '100%', paddingHorizontal: 40, color: '#fff' }}>{ title }</Text>}
            <LineChart 
                data={{ labels: labels, datasets: [{ data: values }] }}
                width={state.chart?.width ?? 0}
                height={state.chart?.height ?? 0}
                bezier
                yAxisInterval={1}
                chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#fb8c00",
                    backgroundGradientTo: "#ffa726",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </View>
    )
}
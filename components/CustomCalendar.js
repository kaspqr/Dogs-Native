import React, { useState, useEffect } from 'react'
import { View, Text, TouchableNativeFeedback, TouchableOpacity } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import dayjs from 'dayjs'

const CustomCalendar = () => {
    const [arr, setArr] = useState([])
    const [customDate, setCustomDate] = useState(dayjs())
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [answers, setAnswers] = useState(dayjs())

    useEffect(() => {
        for (let i = dayjs().year(); i > dayjs().year() - 100; i--) {
            setArr((prev) => [...prev, i])
        }
    }, [])

    return (
        <>
            <Calendar
                renderHeader={() => (
                    <TouchableNativeFeedback onPress={() => setIsModalVisible(true)}>
                        <View>
                            <Text>
                                {customDate.month() + 1}월 {customDate.year()}
                            </Text>
                        </View>
                    </TouchableNativeFeedback>
                )}
                onPressArrowLeft={() => setCustomDate((prev) => dayjs(prev.format('YYYY-MM-DD')).subtract(1, 'month'))}
                onPressArrowRight={() => setCustomDate((prev) => dayjs(prev.format('YYYY-MM-DD')).add(1, 'month'))}
                initialDate={customDate.format('YYYY-MM-DD')}
                allowSelectionOutOfRange
                current={customDate.format('YYYY-MM-DD').toString()}
                markingType='multi-dot'
                markedDates={{ [answers[item.id]]: { selected: true } }}
                onDayPress={({ dateString }) => {
                    setAnswers({
                        ...answers,
                        [item.id]: dateString,
                    });
                }}
            />
            {isModalVisible && arr.length > 0 && (
                <View
                    style={{
                        zIndex: 10,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'green',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 40,
                        }}
                    >
                        <View style={{ flex: 7, alignItems: 'center' }}>
                            <Text style={{ fontSize: 20 }}>select Year</Text>
                        </View>
                        <TouchableNativeFeedback onPress={() => setIsModalVisible(false)}>
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            ></View>
                        </TouchableNativeFeedback>
                    </View>
                    <ScrollView>
                        <View
                            style={{
                                alignItems: 'center',
                                zIndex: 25,
                                padding: 15,
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {arr.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    onPress={() => {
                                        setCustomDate((prev) => dayjs().subtract(dayjs().year() - year, 'years'))
                                        setIsModalVisible(false)
                                    }}
                                >
                                    <View style={{ padding: 20, width: '100%' }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{year}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}
        </>
    )
}

export default CustomCalendar

import { TouchableNativeFeedback, Text, View, Image, TextInput, ScrollView } from 'react-native'
import styles from './styles'
import React, { useEffect, useState, useLayoutEffect } from 'react'
import images from '../../config/images'
import colors from '../../config/colors'
import ModalCustom from '../../components/ModalCustom/ModalCustom'
import CalendarPicker from 'react-native-calendar-picker';
import Button from '../../components/Button/Button'
import { YAxis } from 'react-native-svg-charts'
import { LineChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import Dots from '../../components/AreaChartAdds/Dots'
import { Grid } from 'react-native-svg-charts'
import { XAxis } from 'react-native-svg-charts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'

const HomeScreen = ({ navigation }) => {
  const [dateInput, setDateInput] = useState("")
  const [showSelectDateModal, setShowSelectDateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")

  const [data, setData] = useState([5, 3, 5, null, 8, 5, 6])
  const contentInset = { top: 16, bottom: 24, }


  //Only for testing
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableNativeFeedback
          useForeground
          background={TouchableNativeFeedback.Ripple(null, true, 24)}
          onPress={() => getAverages()}
        >
          <View style={{ marginRight: 8, padding: 8 }} pointerEvents="box-only">
            <Image source={images.refresh} style={{ width: 24, height: 24 }} />
          </View>
        </TouchableNativeFeedback>
      )
    })
  })

  const dismissModal = () => {
    setShowSelectDateModal(false)
    setSelectedDate("")
  }

  const getAverages = () => {
    let today = getShortDate(moment())
    let pastWeek = [today]
    for (let i = 0; i < 6; i++) {
      pastWeek.push(getShortDate(moment(today).subtract(i + 1, "d")))
    }

    try {
      AsyncStorage.multiGet(pastWeek.reverse()).then(resp => {

        let newData = resp.map(d => {
          //Get average score of each day, null if it isn't evaluated
          if (d[1]) {
            let info = JSON.parse(d[1])

            let totalScore = 0
            info.points.forEach(p => totalScore += p)

            return totalScore / info.points.length
          } else return null
        })
        
        setData(newData)
      })
    } catch (error) {

    }
  }
  //Get last week's averages
  useEffect(() => {
    getAverages()
  }, [])

  const getShortDate = (date) => date.toISOString().slice(0, 10)

  return (
    <ScrollView style={styles.container}>
      <Text style={{fontSize:16, fontWeight:"bold", color:colors.COLOR_PRIMARY_1_DARK_2, marginBottom:4, flex: 1, textAlign:"center"}} >Hi Kim, how was your day?</Text>
      {/* Graph */}
      <View style={styles.chartContainer}>
        <Text style={{ fontWeight: "bold", marginLeft: 32, color: colors.COLOR_PRIMARY_1_DARK_2 }}>Past week</Text>
        <View style={{ flexDirection: "row", paddingRight: 24 }}>
          <YAxis
            contentInset={contentInset}
            min={0}
            max={10}
            data={data}
            svg={{
              fill: colors.COLOR_PRIMARY_1_DARK_2,
              fontSize: 14,
            }}
            numberOfTicks={2}
          />
          <LineChart
            style={{ flex: 1, marginLeft: 8, height: 256 }}
            data={data}
            gridMin={0}
            gridMax={10}
            start={0}

            contentInset={contentInset}
            curve={shape.curveBumpX}
            svg={{ stroke: colors.COLOR_PRIMARY_1_DARK_2, strokeWidth: 10, }}
          >
            <Grid />
            <Dots color={colors.COLOR_PRIMARY_1_DARK_2} />

          </LineChart>
        </View>
        <XAxis
          contentInset={{ left: 24, right: 24 }}
          min={0}
          max={6}
          data={data}
          svg={{
            fill: colors.COLOR_PRIMARY_1_DARK_2,
            fontSize: 14,
          }}
          formatLabel={(value, index) => {
            let today = getShortDate(moment())

            let pastWeekDays = []
            for (let i = 0; i < 7; i++) {
              pastWeekDays.push((moment(today).subtract(i, "d").isoWeekday()))
            }
            pastWeekDays.reverse()
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

            return days[pastWeekDays[index] - 1]
          }}
        />
      </View>

      <Button buttonText={"Evaluate your day"}
        icon={images.arrow}
        color={colors.COLOR_PRIMARY_2}
        iconStyle={{ width: 36, height: 36 }}
        style={{ marginTop: 16, elevation: 4 }}
        filled
        onPress={() => navigation.navigate("Evaluate day", {})} />

      <Button buttonText={"Choose other date to evaluate"}
        icon={images.add}
        color={colors.COLOR_PRIMARY_1_DARK_2}
        style={{ marginTop: 16 }}
        onPress={() => setShowSelectDateModal(true)} />

      <ModalCustom
        visible={showSelectDateModal}
        title="Select date"
        onPressOutside={() => dismissModal()}
        modalContent={
          <View>
            <CalendarPicker
              selectedDayColor={colors.COLOR_PRIMARY_1_DARK}
              selectedDayTextColor={"white"}
              width={380}
              startFromMonday={true}
              onDateChange={setSelectedDate}>

            </CalendarPicker>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>

              <Button buttonText={"Cancel"} color={colors.COLOR_CANCEL}
                onPress={() => dismissModal()} />

              <Button buttonText={"Continue"}
                color={selectedDate != "" ? colors.COLOR_PRIMARY_1_DARK_2 : colors.COLOR_PRIMARY_1_DARK}
                disabled={selectedDate == ""}
                onPress={() => {
                  navigation.navigate("Evaluate day", { selectedDate: selectedDate.toISOString().slice(0, 10) })
                  dismissModal()
                }} />
            </View>
          </View>
        }
      />
    </ScrollView>
  )
}

export default HomeScreen
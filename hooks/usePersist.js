import { useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'

const usePersist = () => {
  const [persist, setPersist] = useState(false)

  useEffect(() => {
    // Load data from AsyncStorage during component initialization
    const loadData = async () => {
      try {
        const storedPersist = await AsyncStorage.getItem("persist")
        if (storedPersist !== null) {
          setPersist(JSON.parse(storedPersist))
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error)
      }
    }

    loadData()
  }, []) // Empty dependency array ensures this effect runs once during component initialization

  useEffect(() => {
    // Save data to AsyncStorage whenever 'persist' changes
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("persist", JSON.stringify(persist))
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error)
      }
    };

    saveData()
  }, [persist]) // Run this effect whenever 'persist' changes

  return [persist, setPersist]
}

export default usePersist

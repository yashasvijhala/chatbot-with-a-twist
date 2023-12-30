import { StyleSheet, View } from 'react-native'
import Chatbot from './src'

export default function App() {
  return (
    <View style={styles.container}>
      <Chatbot />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})

import axios from 'axios'
import * as Speech from 'expo-speech'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

const Chatbot = () => {
  const [messages, setMessages] = React.useState([])
  const apikey = ''
  const chatgptUrl = 'https://api.openai.com/v1/chat/completions'
  const dalleUrl = 'https://api.openai.com/v1/images/generations'

  const client = axios.create({
    headers: {
      Authorization: `Bearer ${apikey}`,
      'Content-Type': 'application/json'
    }
  })

  const send = async (messages = []) => {
    const text = messages[0].text

    const userMessage = {
      _id: Math.random().toString(),
      text: text,
      createdAt: new Date(),
      user: {
        _id: 1,
        name: 'User'
      }
    }

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [userMessage])
    )

    const res = await client.post(chatgptUrl, {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `is it for picture?`
        }
      ]
    })

    const isArt = res.data?.choices[0]?.message?.content?.trim()?.toLowerCase()

    if (isArt?.includes('yes')) {
      console.log('dall.e call')
      return dalleApiCall(text)
    } else {
      console.log('chatgpt call')
      return chatgptApiCall(text)
    }
  }

  const chatgptApiCall = async prompt => {
    const res = await client.post(chatgptUrl, {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const answer = res.data?.choices[0]?.message?.content?.trim()
    const newMessage = {
      _id: Math.random().toString(),
      text: answer,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'ChatBot'
      }
    }

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [newMessage])
    )

    Speech.speak(answer, {
      language: 'en-UK',
      pitch: 1.0,
      rate: 1.0
    })
  }

  const dalleApiCall = async prompt => {
    const res = await client.post(dalleUrl, {
      prompt,
      n: 1,
      size: '512x512'
    })

    let url = res?.data?.data[0]?.url

    const newMessage = {
      _id: Math.random().toString(),
      image: url,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'ChatBot'
      }
    }

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [newMessage])
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text>Chatbot</Text>
      </View>
      <GiftedChat
        messages={messages}
        renderMessageImage={({ currentMessage }) => (
          <Image
            source={{ uri: currentMessage.image }}
            style={{ width: 200, height: 200 }}
          />
        )}
        onSend={messages => send(messages)}
        user={{
          _id: 1
        }}
      />
    </View>
  )
}

export default Chatbot

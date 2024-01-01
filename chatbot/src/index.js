import axios from 'axios'
import * as Speech from 'expo-speech'
import React from 'react'
import { Button, Image, Text, View } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

const Chatbot = () => {
  const [messages, setMessages] = React.useState([])
  const [codeToRun, setCodeToRun] = React.useState(null)
  const apikey = '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'
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
          content: `wanna generate ai img?? ${text}. answer with a yes or no.`
        }
      ]
    })

    const isArt = res.data?.choices[0]?.message?.content?.trim()?.toLowerCase()

    if (isArt?.includes('yes')) {
      console.log('DALL·E API call')
      return dalleApiCall(text)
    } else {
      console.log('ChatGPT API call')
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
    if (answer.includes('```')) {
      const startIndex = answer.indexOf('```')
      const endIndex = answer.indexOf('```', startIndex + 3)
      if (endIndex !== -1) {
        const code = answer.slice(startIndex + 3, endIndex).trim()
        setCodeToRun(code)
      }
    }
  }

  const runCode = async () => {
    if (!codeToRun) return
    let code = codeToRun.trim()
    let lang = ''
    const space = code.indexOf(' ')
    const nl = code.indexOf('\n')

    if (space !== -1 && nl !== -1) {
      lang = code.substring(0, Math.min(space, nl)).toLowerCase()
    } else if (space !== -1) {
      lang = code.substring(0, space).toLowerCase()
    } else if (nl !== -1) {
      lang = code.substring(0, nl).toLowerCase()
    } else {
      lang = code.toLowerCase()
    }

    console.log('lang:', lang)

    if (lang.length > 0) {
      const i = code.indexOf('\n') !== -1 ? nl : space
      code = code.substring(i + 1).trim()
    }
    console.log('code:', code)
    if (lang == 'javascript' || lang == 'js') {
      lang = 'nodejs'
    } else if (lang == 'python') {
      lang = 'python3'
    }
    const rapidApiKey = 'fcf6727181mshab6af9d51fada5ep1ea825jsnfd5135f21a8e'
    const rapidApiHost = 'online-code-compiler.p.rapidapi.com'
    const rapidApiUrl = 'https://online-code-compiler.p.rapidapi.com/v1/'

    const options = {
      method: 'POST',
      url: rapidApiUrl,
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost
      },
      data: {
        language: lang,
        version: 'latest',
        code: code,
        input: null
      }
    }

    const response = await axios.request(options)
    console.log('API Response:', response.data)

    const outputMessage = {
      _id: Math.random().toString(),
      text: `Output: ${response.data.output || 'No output'}`,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'ChatBot'
      }
    }

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [outputMessage])
    )
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
      {codeToRun !== null && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10
          }}
        >
          <Button title="Run Code" onPress={runCode} />
        </View>
      )}
    </View>
  )
}

export default Chatbot

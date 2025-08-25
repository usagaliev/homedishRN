import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { MessageType } from '../utils/types';

interface MessageInputProps {
  onSendMessage: (text: string, type: MessageType, mediaUrl?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onTyping, 
  disabled = false 
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim(), 'text');
      setText('');
      onTyping?.(false);
    }
  };

  const handleTyping = (value: string) => {
    setText(value);
    onTyping?.(value.length > 0);
  };

  const handlePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Здесь должна быть загрузка в Firebase Storage
        // Пока отправляем локальный URI
        onSendMessage('', 'photo', imageUri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    }
  };

  const handleVoice = () => {
    // TODO: Реализовать запись голосовых сообщений
    Alert.alert('Информация', 'Голосовые сообщения будут доступны в следующем обновлении');
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton} 
            onPress={handlePhoto}
            disabled={disabled}
          >
            <Ionicons name="camera" size={24} color="#666" />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={text}
            onChangeText={handleTyping}
            placeholder="Введите сообщение..."
            multiline
            maxLength={1000}
            editable={!disabled}
          />
          
          <TouchableOpacity 
            style={styles.voiceButton} 
            onPress={handleVoice}
            disabled={disabled}
          >
            <Ionicons name="mic" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={canSend ? '#fff' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  voiceButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0a7ea4',
  },
});


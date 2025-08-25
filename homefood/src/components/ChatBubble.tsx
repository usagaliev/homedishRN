import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '../utils/types';

interface ChatBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onImagePress?: (imageUrl: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage, onImagePress }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'photo':
        return (
          <TouchableOpacity
            onPress={() => onImagePress?.(message.mediaUrl!)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: message.mediaUrl }} style={styles.messageImage} />
          </TouchableOpacity>
        );
      case 'audio':
        return (
          <View style={styles.audioContainer}>
            <Text style={styles.audioText}>🎵 Голосовое сообщение</Text>
          </View>
        );
      default:
        return <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>{message.text}</Text>;
    }
  };

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessage]}>
      <View style={[styles.bubble, isOwnMessage && styles.ownBubble]}>
        {renderMessageContent()}
        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, isOwnMessage && styles.ownTimeText]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwnMessage && (
            <Text style={[styles.statusText, message.status === 'read' && styles.readStatus]}>
              {getStatusIcon(message.status)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: '#f1f1f1',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8,
  },
  ownBubble: {
    backgroundColor: '#0a7ea4',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  ownMessageText: {
    color: '#fff',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  audioText: {
    fontSize: 16,
    color: '#666',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  ownTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  readStatus: {
    color: '#4CAF50',
  },
});


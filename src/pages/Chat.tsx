import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Hash, Loader2, MessageSquare, VolumeX, User } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  useChatChannels,
  useChatMessages,
  useSendMessage,
  useDirectMessageThreads,
  useDirectMessages,
  useSendDirectMessage,
} from '@/hooks/useChat';
import type { ChatMessageWithProfile, DirectMessage } from '@/hooks/useChat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type TabType = 'channels' | 'dms';

function ChatContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('channels');

  // Channel state
  const { data: channels, isLoading: channelsLoading } = useChatChannels(user?.id);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const { data: channelMessages, isLoading: channelMessagesLoading } = useChatMessages(activeChannel || undefined);
  const { mutate: sendChannelMessage, isPending: isSendingChannel } = useSendMessage();

  // DM state
  const { data: dmThreads, isLoading: dmThreadsLoading } = useDirectMessageThreads(user?.id);
  const [activeDMUser, setActiveDMUser] = useState<string | null>(null);
  const { data: dmMessages, isLoading: dmMessagesLoading } = useDirectMessages(user?.id, activeDMUser || undefined);
  const { mutate: sendDM, isPending: isSendingDM } = useSendDirectMessage();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set first channel as active when channels are loaded
  useEffect(() => {
    if (channels && channels.length > 0 && !activeChannel && activeTab === 'channels') {
      setActiveChannel(channels[0].id);
    }
  }, [channels, activeChannel, activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages, dmMessages]);

  const handleSendChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChannel) return;

    sendChannelMessage({
      channel_id: activeChannel,
      content: newMessage.trim(),
      user_id: user.id
    });

    setNewMessage('');
  };

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeDMUser || !user) return;

    sendDM({
      fromUserId: user.id,
      toUserId: activeDMUser,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleStartDM = (targetUser: any) => {
    if (!user || !targetUser) return;

    // Switch to DMs tab and open conversation with this user
    setActiveTab('dms');
    setActiveDMUser(targetUser.user_id);
    toast.success(`Started chat with ${targetUser.full_name}`);
  };

  const handleMute = (userName: string) => {
    toast.success(`Muted ${userName}`);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDisplayName = (msg: ChatMessageWithProfile | DirectMessage) => {
    if ('profile' in msg) {
      return msg.profile?.full_name || 'Unknown User';
    } else {
      return msg.from_profile?.full_name || 'Unknown User';
    }
  };

  const getAvatarUrl = (msg: ChatMessageWithProfile | DirectMessage) => {
    if ('profile' in msg) {
      return msg.profile?.avatar_url;
    } else {
      return msg.from_profile?.avatar_url;
    }
  };

  const getChannelDisplayName = (channel: any) => {
    if (channel.is_private && channel.other_profile) {
      return channel.other_profile.full_name || 'Unknown User';
    }
    if (channel.name.startsWith('dm_')) {
      return 'Direct Message';
    }
    return channel.name;
  };

  if (channelsLoading && dmThreadsLoading) {
    return (
      <Layout hideFooter>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const currentChannel = channels?.find(c => c.id === activeChannel);
  const currentDMThread = dmThreads?.find(t => t.other_user_id === activeDMUser);
  const isLoading = activeTab === 'channels' ? channelMessagesLoading : dmMessagesLoading;
  const isSending = activeTab === 'channels' ? isSendingChannel : isSendingDM;
  const messages = activeTab === 'channels' ? channelMessages : dmMessages;

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-80px)] flex">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 bg-card border-r border-border/50 flex-shrink-0 hidden md:flex flex-col"
        >
          {/* Tabs */}
          <div className="p-4 border-b border-border/50">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('channels')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'channels'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
                  }`}
              >
                <Hash className="w-4 h-4 inline mr-2" />
                {t('tab_channels')}
              </button>
              <button
                onClick={() => setActiveTab('dms')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dms'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
                  }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                {t('tab_dms')}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'channels' ? (
              // Channels list
              channels?.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeChannel === channel.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{getChannelDisplayName(channel)}</div>
                    <div className="text-xs truncate opacity-70">{channel.description}</div>
                  </div>
                </button>
              ))
            ) : (
              // DM threads list
              dmThreads?.map((thread) => (
                <button
                  key={thread.other_user_id}
                  onClick={() => setActiveDMUser(thread.other_user_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeDMUser === thread.other_user_id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {thread.other_user_avatar ? (
                      <img src={thread.other_user_avatar} alt={thread.other_user_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium">
                        {thread.other_user_name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {thread.other_user_name}
                      {thread.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs truncate opacity-70">{thread.last_message}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-16 px-6 border-b border-border/50 flex items-center">
            <div className="flex items-center gap-3">
              {activeTab === 'channels' ? (
                <>
                  <Hash className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {currentChannel ? getChannelDisplayName(currentChannel) : 'Select a channel'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {currentChannel?.description}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {currentDMThread?.other_user_name || 'Select a conversation'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Direct Message
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages?.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                {t('no_messages')}
              </div>
            ) : (
              messages?.map((msg: any, index: number) => {
                const isOwnMessage = activeTab === 'channels'
                  ? msg.user_id === user?.id
                  : msg.from_user_id === user?.id;
                const prevMsg = messages[index - 1] as any;
                const showAvatar = index === 0 || (
                  activeTab === 'channels'
                    ? prevMsg?.user_id !== msg.user_id
                    : prevMsg?.from_user_id !== msg.from_user_id
                );

                const displayName = getDisplayName(msg);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${isOwnMessage ? 'justify-end' : ''}`}
                  >
                    {!isOwnMessage && showAvatar && activeTab === 'channels' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                            {getAvatarUrl(msg) ? (
                              <img src={getAvatarUrl(msg)} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium">
                                {displayName.charAt(0)}
                              </span>
                            )}
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleStartDM(msg.profile)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat personally
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMute(displayName)}>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Mute {displayName}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {!isOwnMessage && showAvatar && activeTab === 'dms' && (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {getAvatarUrl(msg) ? (
                          <img src={getAvatarUrl(msg)} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">
                            {displayName.charAt(0)}
                          </span>
                        )}
                      </div>
                    )}
                    {!isOwnMessage && !showAvatar && (
                      <div className="w-10 flex-shrink-0" />
                    )}
                    <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                      {showAvatar && activeTab === 'channels' && (
                        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                          {!isOwnMessage ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="outline-none hover:underline cursor-pointer">
                                <span className="text-sm font-medium">
                                  {displayName}
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleStartDM(msg.profile)}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Chat personally
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMute(displayName)}>
                                  <VolumeX className="w-4 h-4 mr-2" />
                                  Mute {displayName}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-sm font-medium">
                              {displayName}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`inline-block rounded-xl px-4 py-2.5 ${isOwnMessage
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary rounded-bl-sm'
                        }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      {activeTab === 'dms' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(msg.created_at)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border/50">
            <form onSubmit={activeTab === 'channels' ? handleSendChannel : handleSendDM} className="flex gap-3">
              <Input
                type="text"
                placeholder={
                  activeTab === 'channels'
                    ? t('msg_placeholder_channel', { channel: currentChannel?.name || '...' })
                    : t('msg_placeholder_dm', { user: currentDMThread?.other_user_name || '...' })
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-secondary border-border h-12"
                disabled={
                  (activeTab === 'channels' && !activeChannel) ||
                  (activeTab === 'dms' && !activeDMUser) ||
                  isSending
                }
              />
              <Button
                type="submit"
                className="btn-gold h-12 px-6"
                disabled={
                  !newMessage.trim() ||
                  (activeTab === 'channels' && !activeChannel) ||
                  (activeTab === 'dms' && !activeDMUser) ||
                  isSending
                }
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden fixed bottom-20 left-4 right-4 flex gap-2">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium ${activeTab === 'channels'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground border border-border'
              }`}
          >
            {t('tab_channels')}
          </button>
          <button
            onClick={() => setActiveTab('dms')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium ${activeTab === 'dms'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground border border-border'
              }`}
          >
            {t('tab_dms')}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default function Chat() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
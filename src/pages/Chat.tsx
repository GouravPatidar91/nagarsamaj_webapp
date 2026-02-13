
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Hash, Loader2, MessageSquare, VolumeX, User, Paperclip, X, FileText, Image as ImageIcon, Video as VideoIcon, Trash2, MoreHorizontal } from 'lucide-react';
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
  useDeleteMessage,
  useDeleteDirectMessage,
} from '@/hooks/useChat';
import type { ChatMessageWithProfile, DirectMessage } from '@/hooks/useChat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const deleteMessageMutation = useDeleteMessage();
  const deleteDirectMessageMutation = useDeleteDirectMessage();

  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      return { url: data.publicUrl, type };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const handleSendChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !user || !activeChannel) return;

    let attachmentData = null;
    if (selectedFile) {
      setIsUploading(true);
      attachmentData = await uploadFile(selectedFile);
      setIsUploading(false);
      if (!attachmentData) return;
    }

    sendChannelMessage({
      channel_id: activeChannel,
      content: newMessage.trim() || (selectedFile ? 'Sent an attachment' : ''),
      user_id: user.id,
      attachment_url: attachmentData?.url,
      attachment_type: attachmentData?.type,
    });

    setNewMessage('');
    clearFile();
  };

  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeDMUser || !user) return;

    let attachmentData = null;
    if (selectedFile) {
      setIsUploading(true);
      attachmentData = await uploadFile(selectedFile);
      setIsUploading(false);
      if (!attachmentData) return;
    }

    sendDM({
      fromUserId: user.id,
      toUserId: activeDMUser,
      content: newMessage.trim() || (selectedFile ? 'Sent an attachment' : ''),
      attachment_url: attachmentData?.url,
      attachment_type: attachmentData?.type,
    });

    setNewMessage('');
    clearFile();
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

  const handleDeleteMessage = async (messageId: string, isDirectMessage: boolean) => {
    if (!confirm(t('Are you sure you want to delete this message?'))) return;

    try {
      if (isDirectMessage) {
        await deleteDirectMessageMutation.mutateAsync(messageId);
      } else {
        await deleteMessageMutation.mutateAsync(messageId);
      }
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
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

                // Determine if we should show avatar/header (new sender or significant time gap)
                const isNewGroup = index === 0 || (
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
                    {/* Avatar Side (Left) - Only for other users */}
                    {!isOwnMessage && (
                      <>
                        {isNewGroup ? (
                          <div className="flex-shrink-0">
                            {activeTab === 'channels' ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="outline-none">
                                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
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
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                {getAvatarUrl(msg) ? (
                                  <img src={getAvatarUrl(msg)} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {displayName.charAt(0)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-10 flex-shrink-0" />
                        )}
                      </>
                    )}

                    {/* Message Content Side */}
                    <div className={`group max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>

                      {/* Metadata Header (Name/Time/Actions) */}
                      <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {/* Case: Other User in Channel - Show Name & Actions */}
                        {!isOwnMessage && activeTab === 'channels' && isNewGroup && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{displayName}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                          </div>
                        )}

                        {/* Case: Other User in DM - Show Time if new group */}
                        {!isOwnMessage && activeTab === 'dms' && isNewGroup && (
                          <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                        )}

                        {/* Case: Own Message - Show Time & Delete Option */}
                        {isOwnMessage && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="outline-none cursor-pointer text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <MoreHorizontal className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleDeleteMessage(msg.id, activeTab === 'dms')}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`relative inline-block rounded-xl px-4 py-2.5 text-left ${isOwnMessage
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary rounded-bl-sm'
                        }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* Attachments */}
                        {msg.attachment_url && (
                          <div className="mt-2">
                            {msg.attachment_type === 'image' ? (
                              <img
                                src={msg.attachment_url}
                                alt="Attachment"
                                className="max-w-full rounded-lg max-h-60 object-cover"
                              />
                            ) : msg.attachment_type === 'video' ? (
                              <video
                                src={msg.attachment_url}
                                controls
                                className="max-w-full rounded-lg max-h-60"
                              />
                            ) : (
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-background/20 rounded-lg hover:bg-background/30 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-xs underline">View Document</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp footer for non-avatar/consecutive messages if simple view needed? */}
                      {/* Currently handled in header for simplicity and better look */}

                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border/50">
            {selectedFile && (
              <div className="mb-2 p-2 bg-secondary rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  {selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-primary" />
                  ) : selectedFile.type.startsWith('video/') ? (
                    <VideoIcon className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button onClick={clearFile} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <form onSubmit={activeTab === 'channels' ? handleSendChannel : handleSendDM} className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
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
                  (!newMessage.trim() && !selectedFile) ||
                  (activeTab === 'channels' && !activeChannel) ||
                  (activeTab === 'dms' && !activeDMUser) ||
                  isSending || isUploading
                }
              >
                {isSending || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Phone, Instagram, Facebook, Globe, Plus } from "lucide-react";

const sessions = [
  {
    id: 1,
    client: "John Doe",
    channel: "whatsapp_business",
    status: "active",
    lastMessage: "Thanks for the information!",
    lastMessageTime: "2 min ago",
    unreadCount: 2,
    avatar: ""
  },
  {
    id: 2,
    client: "Sarah Wilson",
    channel: "instagram",
    status: "pending",
    lastMessage: "Can you help me with pricing?",
    lastMessageTime: "15 min ago",
    unreadCount: 1,
    avatar: ""
  },
  {
    id: 3,
    client: "Mike Johnson",
    channel: "facebook_messenger",
    status: "active",
    lastMessage: "Perfect, I'll take it!",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    avatar: ""
  },
  {
    id: 4,
    client: "Emily Davis",
    channel: "webchat",
    status: "closed",
    lastMessage: "Thank you for your help",
    lastMessageTime: "2 hours ago",
    unreadCount: 0,
    avatar: ""
  },
  {
    id: 5,
    client: "Alex Smith",
    channel: "evolution_api",
    status: "active",
    lastMessage: "When can we schedule a call?",
    lastMessageTime: "3 hours ago",
    unreadCount: 3,
    avatar: ""
  }
];

const channelIcons: { [key: string]: React.ReactNode } = {
  whatsapp_business: <MessageCircle className="h-4 w-4" />,
  evolution_api: <Phone className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  facebook_messenger: <Facebook className="h-4 w-4" />,
  webchat: <Globe className="h-4 w-4" />,
  email: <MessageCircle className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />
};

const channelColors: { [key: string]: string } = {
  whatsapp_business: "bg-green-100 text-green-800",
  evolution_api: "bg-blue-100 text-blue-800",
  instagram: "bg-pink-100 text-pink-800",
  facebook_messenger: "bg-blue-100 text-blue-800",
  webchat: "bg-gray-100 text-gray-800",
  email: "bg-purple-100 text-purple-800",
  phone: "bg-orange-100 text-orange-800"
};

const statusColors: { [key: string]: string } = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  closed: "bg-gray-100 text-gray-800"
};

const Sessions = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);

  const filteredSessions = selectedStatus === "all" 
    ? sessions 
    : sessions.filter(session => session.status === selectedStatus);

  const getChannelName = (channel: string) => {
    const names: { [key: string]: string } = {
      whatsapp_business: "WhatsApp Business",
      evolution_api: "Evolution API",
      instagram: "Instagram",
      facebook_messenger: "Facebook Messenger",
      webchat: "Web Chat",
      email: "Email",
      phone: "Phone"
    };
    return names[channel] || channel;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">
            Manage your communication sessions across all channels.
          </p>
        </div>
        <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Start a new communication session with a client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="text-sm text-muted-foreground">
                Select a communication channel to start a new session.
              </div>
              <div className="grid gap-2">
                {Object.entries(channelIcons).map(([channel, icon]) => (
                  <Button
                    key={channel}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      console.log("Creating session for channel:", channel);
                      setIsNewSessionOpen(false);
                    }}
                  >
                    {icon}
                    <span className="ml-2">{getChannelName(channel)}</span>
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("all")}
        >
          All ({sessions.length})
        </Button>
        <Button
          variant={selectedStatus === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("active")}
        >
          Active ({sessions.filter(s => s.status === "active").length})
        </Button>
        <Button
          variant={selectedStatus === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("pending")}
        >
          Pending ({sessions.filter(s => s.status === "pending").length})
        </Button>
        <Button
          variant={selectedStatus === "closed" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("closed")}
        >
          Closed ({sessions.filter(s => s.status === "closed").length})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Active Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, session) => sum + session.unreadCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Unread Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(sessions.map(s => s.channel)).size}
            </div>
            <div className="text-sm text-muted-foreground">Channels Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Response</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="grid gap-4">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={session.avatar} />
                    <AvatarFallback>
                      {session.client.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{session.client}</h3>
                      <Badge variant="secondary" className={channelColors[session.channel]}>
                        <span className="mr-1">{channelIcons[session.channel]}</span>
                        {getChannelName(session.channel)}
                      </Badge>
                      <Badge variant="secondary" className={statusColors[session.status]}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.lastMessage}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {session.lastMessageTime}
                    </div>
                    {session.unreadCount > 0 && (
                      <Badge variant="destructive" className="mt-1">
                        {session.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline">
                    Open Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sessions;
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const campaigns = [
  {
    id: 1,
    title: "Black Friday Sale",
    content: "🔥 ¡Black Friday Sale! 50% de descuento en todos nuestros productos. ¡Solo por tiempo limitado!",
    channel: "whatsapp_business",
    status: "sent",
    totalRecipients: 1500,
    sentCount: 1500,
    failedCount: 12,
    scheduledAt: "2024-11-29 09:00",
    sentAt: "2024-11-29 09:15",
    createdAt: "2024-11-28"
  },
  {
    id: 2,
    title: "New Product Launch",
    content: "🚀 ¡Nuevo producto disponible! Descubre nuestra última innovación. Contáctanos para más información.",
    channel: "instagram",
    status: "sending",
    totalRecipients: 800,
    sentCount: 450,
    failedCount: 3,
    scheduledAt: "2024-12-01 10:00",
    sentAt: null,
    createdAt: "2024-11-30"
  },
  {
    id: 3,
    title: "Holiday Wishes",
    content: "🎄 ¡Felices fiestas! Que tengas una navidad llena de alegría y un próspero año nuevo.",
    channel: "facebook_messenger",
    status: "scheduled",
    totalRecipients: 2200,
    sentCount: 0,
    failedCount: 0,
    scheduledAt: "2024-12-25 08:00",
    sentAt: null,
    createdAt: "2024-12-01"
  },
  {
    id: 4,
    title: "Customer Survey",
    content: "📊 Tu opinión es importante para nosotros. Completa esta breve encuesta y recibe un descuento especial.",
    channel: "email",
    status: "draft",
    totalRecipients: 0,
    sentCount: 0,
    failedCount: 0,
    scheduledAt: null,
    sentAt: null,
    createdAt: "2024-12-02"
  }
];

const statusColors: { [key: string]: string } = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  sending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

const statusIcons: { [key: string]: React.ReactNode } = {
  draft: <Users className="h-4 w-4" />,
  scheduled: <Clock className="h-4 w-4" />,
  sending: <Send className="h-4 w-4" />,
  sent: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />
};

const channels = [
  { value: "whatsapp_business", label: "WhatsApp Business" },
  { value: "evolution_api", label: "Evolution API" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook_messenger", label: "Facebook Messenger" },
  { value: "email", label: "Email" }
];

const MassMessaging = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    content: "",
    channel: "whatsapp_business",
    scheduledAt: ""
  });
  const { toast } = useToast();

  const filteredCampaigns = selectedStatus === "all" 
    ? campaigns 
    : campaigns.filter(campaign => campaign.status === selectedStatus);

  const getProgress = (campaign: any) => {
    if (campaign.totalRecipients === 0) return 0;
    return Math.round((campaign.sentCount / campaign.totalRecipients) * 100);
  };

  const handleCreateCampaign = () => {
    console.log("Creating campaign:", newCampaign);
    setIsNewCampaignOpen(false);
    setNewCampaign({ title: "", content: "", channel: "whatsapp_business", scheduledAt: "" });
    toast({
      title: "Success",
      description: "Mass messaging campaign created successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mass Messaging</h1>
          <p className="text-muted-foreground">
            Create and manage bulk messaging campaigns across all channels.
          </p>
        </div>
        <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Mass Messaging Campaign</DialogTitle>
              <DialogDescription>
                Create a new campaign to send messages to multiple contacts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign-title">Campaign Title</Label>
                <Input
                  id="campaign-title"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                  placeholder="Enter campaign title..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign-channel">Channel</Label>
                <select
                  id="campaign-channel"
                  value={newCampaign.channel}
                  onChange={(e) => setNewCampaign({...newCampaign, channel: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {channels.map(channel => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign-content">Message Content</Label>
                <Textarea
                  id="campaign-content"
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                  placeholder="Enter your message..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign-schedule">Schedule (Optional)</Label>
                <Input
                  id="campaign-schedule"
                  type="datetime-local"
                  value={newCampaign.scheduledAt}
                  onChange={(e) => setNewCampaign({...newCampaign, scheduledAt: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 flex-wrap">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("all")}
        >
          All ({campaigns.length})
        </Button>
        {["draft", "scheduled", "sending", "sent"].map(status => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status)}
          >
            {status} ({campaigns.filter(c => c.status === status).length})
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.totalRecipients, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Recipients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Messages Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === "sending").length}
            </div>
            <div className="text-sm text-muted-foreground">Active Campaigns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round((campaigns.reduce((sum, c) => sum + c.sentCount, 0) / Math.max(campaigns.reduce((sum, c) => sum + c.totalRecipients, 0), 1)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid gap-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  <Badge variant="secondary" className={statusColors[campaign.status]}>
                    <span className="mr-1">{statusIcons[campaign.status]}</span>
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline">
                    {campaign.channel.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {campaign.status === "sending" && (
                    <Button size="sm" variant="outline">
                      Pause
                    </Button>
                  )}
                  {campaign.status === "draft" && (
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{campaign.content}</p>
              
              {campaign.totalRecipients > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {campaign.sentCount}/{campaign.totalRecipients}</span>
                    <span>{getProgress(campaign)}%</span>
                  </div>
                  <Progress value={getProgress(campaign)} className="w-full" />
                  {campaign.failedCount > 0 && (
                    <div className="text-sm text-red-600">
                      {campaign.failedCount} failed deliveries
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <span>Created: {campaign.createdAt}</span>
                {campaign.scheduledAt && (
                  <span>Scheduled: {campaign.scheduledAt}</span>
                )}
                {campaign.sentAt && (
                  <span>Sent: {campaign.sentAt}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MassMessaging;